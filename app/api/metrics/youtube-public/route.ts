import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { db } from "@/lib/db";
import { resolveChannelIdFromUrl, fetchPublicYouTubeStats } from "@/lib/youtube-public";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const userId = await getVerifiedUserIdFromCookies();
        if (!userId) {
            return NextResponse.json({ ok: false, error: "UNAUTHORIZED", detail: "Please log in again." }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const youtubeUrl = body.youtubeUrl || body.urlOrHandle || body.channel || body.handle;

        if (!youtubeUrl || typeof youtubeUrl !== 'string') {
            return NextResponse.json({ ok: false, error: "INVALID_INPUT", detail: "Currently supports Channel URL, @Handle, or Video URL." }, { status: 400 });
        }

        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            console.error("YOUTUBE_API_KEY is missing via process.env");
            return NextResponse.json({ ok: false, error: "YOUTUBE_API_KEY_MISSING", detail: "Server configuration error: Missing API Key." }, { status: 500 });
        }

        // Resolving
        console.info(`[YoutubePublic] Resolving: ${youtubeUrl}`);
        const resolution = await resolveChannelIdFromUrl(youtubeUrl, apiKey);

        if (resolution.error || !resolution.channelId) {
            console.warn(`[YoutubePublic] Resolution failed for '${youtubeUrl}':`, resolution.error, resolution.reason);
            return NextResponse.json({
                ok: false,
                error: resolution.error || "NOT_FOUND",
                detail: resolution.reason || "Could not resolve channel. Check URL spelling."
            }, { status: 404 });
        }

        const channelId = resolution.channelId;
        console.info(`[YoutubePublic] Resolved Channel ID: ${channelId}`);

        // Check if creator exists
        const creator = await db.creator.findUnique({ where: { userId } });
        if (!creator) {
            return NextResponse.json({ ok: false, error: "NOT_FOUND", detail: "Creator profile not found." }, { status: 404 });
        }

        // Fetch stats
        const { stats, error: statsError } = await fetchPublicYouTubeStats(channelId, apiKey);

        if (statsError || !stats) {
            console.error(`[YoutubePublic] Stats fetch failed for '${channelId}':`, statsError);
            const detail = statsError?.message || statsError?.reason || "YouTube API Error";
            return NextResponse.json({
                ok: false,
                error: "YOUTUBE_API_ERROR",
                detail
            }, { status: 500 }); // Can be 400 if invalid ID
        }

        // DB Updates

        // 1. Check if DB needs handling for hidden metrics
        const safeSubscriberCount = stats.subscribers ? parseInt(stats.subscribers) : 0;
        const safeVideoCount = parseInt(stats.videoCount) || 0;

        // Upsert Account
        await db.creatorSocialAccount.upsert({
            where: {
                creatorId_provider: {
                    creatorId: creator.id,
                    provider: "youtube"
                }
            },
            create: {
                creatorId: creator.id,
                provider: "youtube",
                providerId: channelId,
                username: stats.title,
                type: "PUBLIC_API",
                accessToken: null,
            },
            update: {
                providerId: channelId,
                username: stats.title,
                type: "PUBLIC_API",
                accessToken: null,
                refreshToken: null,
            }
        });

        // Create Metric Entry
        await db.creatorMetric.create({
            data: {
                creatorId: creator.id,
                provider: "youtube",
                followersCount: safeSubscriberCount,
                engagementRate: stats.recentEngagementRate || 0,
                viewsCount: stats.totalViews,
                mediaCount: safeVideoCount,
                rawResponse: JSON.stringify({
                    ...stats,
                    subscribersHidden: stats.isSubscribersHidden
                }),
            }
        });

        console.info(`[YoutubePublic] Successfully updated metrics for ${stats.title} (${channelId})`);

        return NextResponse.json({ ok: true, stats });

    } catch (error: any) {
        console.error("[YoutubePublic] Critical Error:", error);
        return NextResponse.json({
            ok: false,
            error: "INTERNAL_SERVER_ERROR",
            detail: error.message || "An unexpected error occurred."
        }, { status: 500 });
    }
}
