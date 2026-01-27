
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { db } from "@/lib/db";
import { runApifyActor } from "@/lib/apify";
import { normalizeYoutubeMetrics, parseYoutubeChannel } from "@/lib/metrics-util";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const userId = await getVerifiedUserIdFromCookies();
        if (!userId) {
            return NextResponse.json({ ok: false, error: "UNAUTHORIZED", detail: "Please log in again." }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const youtubeUrl = body.youtubeUrl || body.channel || body.handle;

        if (!youtubeUrl || typeof youtubeUrl !== 'string') {
            return NextResponse.json({ ok: false, error: "INVALID_INPUT", detail: "YouTube URL is required." }, { status: 400 });
        }

        const creator = await db.creator.findUnique({ where: { userId } });
        if (!creator) {
            return NextResponse.json({ ok: false, error: "NOT_FOUND", detail: "Creator profile not found." }, { status: 404 });
        }

        const apifyToken = process.env.APIFY_TOKEN;
        const actorId = process.env.APIFY_YOUTUBE_ACTOR_ID;

        // Strict Requirement: Remove YouTube API logic, use Apify only.
        if (!apifyToken || !actorId) {
            return NextResponse.json({ ok: false, error: "CONFIG_ERROR", detail: "Apify configuration missing." }, { status: 500 });
        }

        // Cache Check (6 hours)
        const FETCH_COOLDOWN_HOURS = parseInt(process.env.FETCH_COOLDOWN_HOURS || "6");
        if (creator.lastYoutubeFetchAt) {
            const diffMs = new Date().getTime() - new Date(creator.lastYoutubeFetchAt).getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            if (diffHours < FETCH_COOLDOWN_HOURS) {
                const lastMetric = await db.creatorMetric.findFirst({
                    where: { creatorId: creator.id, provider: "youtube" },
                    orderBy: { date: 'desc' }
                });
                if (lastMetric) {
                    return NextResponse.json({ ok: true, cached: true, metric: lastMetric, data: JSON.parse(lastMetric.rawResponse || "{}") });
                }
            }
        }

        // Parse Input
        let target = null;
        const cleanInput = youtubeUrl.trim();
        target = parseYoutubeChannel(cleanInput);

        if (!target || !target.value) {
            return NextResponse.json({ ok: false, error: "INVALID_INPUT", detail: "Could not parse YouTube URL/Handle." }, { status: 400 });
        }

        // Prepare Apify Input
        const input: any = { maxResults: 1 };
        if (target.type === 'channel' && target.value.startsWith("UC")) {
            input.startUrls = [{ url: `https://www.youtube.com/channel/${target.value}` }];
        } else {
            let url = target.value;
            if (target.type === 'handle' && !url.includes("youtube.com")) {
                url = `https://www.youtube.com/${url.startsWith("@") ? url : "@" + url}`;
            }
            input.startUrls = [{ url }];
        }

        console.info(`[YouTube Sync] Starting Apify run for ${input.startUrls[0].url}`);

        const result = await runApifyActor({
            token: apifyToken,
            actorId: actorId,
            input: input,
            timeoutSecs: 180
        });

        if (result.error) {
            console.error("[YouTube Sync] Apify Error:", result.error);
            return NextResponse.json({ ok: false, error: "FETCH_ERROR", detail: result.error }, { status: 500 });
        }

        const items = result.data || [];
        if (items.length === 0) {
            return NextResponse.json({ ok: false, error: "NOT_FOUND", detail: "Channel not found via Scraper." }, { status: 404 });
        }

        // Debug Logs as requested
        if (items.length > 0) {
            console.log("[YT] first 3 items", JSON.stringify(items.slice(0, 3), null, 2));
        }

        const stats = normalizeYoutubeMetrics(items);

        const finalChannelId = stats.channelId || target.value;

        // Save Data
        await db.creator.update({
            where: { id: creator.id },
            data: {
                autoDisplayName: stats.title?.substring(0, 100),
                autoProfileImageUrl: stats.thumbnailUrl,
                autoBio: stats.description?.substring(0, 500),
                youtubeUrl: stats.customUrl || `https://youtube.com/channel/${finalChannelId}`,
                // Save filtered videos for Media Kit selection (limit size)
                rawSocialData: JSON.stringify(items.filter(i => i.type === 'video' || i.likeCount).slice(0, 50)),
                lastYoutubeFetchAt: new Date(),
            }
        });

        await db.creatorSocialAccount.upsert({
            where: { creatorId_provider: { creatorId: creator.id, provider: "youtube" } },
            create: {
                creatorId: creator.id,
                provider: "youtube",
                providerId: finalChannelId,
                username: stats.title,
                type: "OAUTH",
                accessToken: null,
            },
            update: {
                providerId: finalChannelId,
                username: stats.title,
                type: "OAUTH",
            }
        });

        const metric = await db.creatorMetric.create({
            data: {
                creatorId: creator.id,
                provider: "youtube",
                followersCount: typeof stats.subscribers === 'number' ? stats.subscribers : 0,
                engagementRate: stats.engagementRate || 0,
                viewsCount: String(stats.totalViews || "0"),
                mediaCount: typeof stats.videoCount === 'number' ? stats.videoCount : 0,
                avgLikes: stats.avgLikes || 0,
                avgComments: stats.avgComments || 0,
                source: "apify",
                rawResponse: JSON.stringify(stats),
            }
        });

        return NextResponse.json({ ok: true, data: stats, metric });

    } catch (error: any) {
        console.error("[YouTube Sync] Critical Error:", error);
        return NextResponse.json({ ok: false, error: "INTERNAL_ERROR", detail: error.message }, { status: 500 });
    }
}
