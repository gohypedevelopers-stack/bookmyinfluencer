import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { db } from "@/lib/db";
import { fetchInstagramPublicStats } from "@/lib/instagram-public";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const userId = await getVerifiedUserIdFromCookies();
        if (!userId) {
            return NextResponse.json({ ok: false, error: "UNAUTHORIZED", detail: "Please log in again." }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const instagramUrl = body.instagramUrl;

        if (!instagramUrl || typeof instagramUrl !== 'string') {
            return NextResponse.json({ ok: false, error: "INVALID_INPUT", detail: "Instagram URL or username is required." }, { status: 400 });
        }

        const apifyToken = process.env.APIFY_TOKEN;
        if (!apifyToken) {
            console.error("APIFY_TOKEN is missing in .env");
            return NextResponse.json({ ok: false, error: "APIFY_TOKEN_MISSING", detail: "Server configuration error. APIFY_TOKEN is missing." }, { status: 500 });
        }

        // Check if creator exists
        const creator = await db.creator.findUnique({ where: { userId } });
        if (!creator) {
            return NextResponse.json({ ok: false, error: "NOT_FOUND", detail: "Creator profile not found." }, { status: 404 });
        }

        // Check cache (6 hours)
        const FETCH_COOLDOWN_HOURS = parseInt(process.env.FETCH_COOLDOWN_HOURS || "6");
        if (creator.lastInstagramFetchAt) {
            const diffMs = new Date().getTime() - new Date(creator.lastInstagramFetchAt).getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            if (diffHours < FETCH_COOLDOWN_HOURS) {
                const lastMetric = await db.creatorMetric.findFirst({
                    where: { creatorId: creator.id, provider: "instagram" },
                    orderBy: { date: 'desc' }
                });
                if (lastMetric) {
                    return NextResponse.json({ ok: true, cached: true, metric: lastMetric });
                }
            }
        }

        // Fetch stats via Apify
        const actorId = process.env.APIFY_INSTAGRAM_ACTOR_ID; // Optional override
        const { stats, error: apiError } = await fetchInstagramPublicStats(instagramUrl, apifyToken, actorId);

        if (apiError || !stats) {
            // Check for private error specifically if possible, or generic
            const msg = apiError?.message || "Apify Error";
            if (msg.includes("Login required") || msg.includes("Private")) {
                return NextResponse.json({ ok: false, error: "PRIVATE_OR_BLOCKED", detail: "Instagram public data not available. Profile might be private." }, { status: 400 });
            }
            return NextResponse.json({ ok: false, error: "APIFY_ERROR", detail: msg }, { status: 500 });
        }

        // Save Data
        // 1. Update Creator Auto Fields
        await db.creator.update({
            where: { id: creator.id },
            data: {
                autoDisplayName: stats.fullName,
                autoProfileImageUrl: stats.profilePicUrl,
                autoBio: stats.biography,
                instagramUrl: `https://instagram.com/${stats.username}`,
                lastInstagramFetchAt: new Date(),
            }
        });

        // 2. Upsert Social Account
        await db.creatorSocialAccount.upsert({
            where: { creatorId_provider: { creatorId: creator.id, provider: "instagram" } },
            create: {
                creatorId: creator.id,
                provider: "instagram",
                providerId: stats.username, // IG API usually needs ID, but for scraped metrics username is key. 
                // However, our schema treats providerId as unique. If we ever get real Graph API ID, this might conflict.
                // For now, using username as providerId for scraped data is acceptable if type is PUBLIC_API.
                username: stats.username,
                type: "PUBLIC_API",
                accessToken: null,
            },
            update: {
                providerId: stats.username,
                username: stats.username,
                type: "PUBLIC_API",
            }
        });

        // 3. Add Metric
        const metric = await db.creatorMetric.create({
            data: {
                creatorId: creator.id,
                provider: "instagram",
                followersCount: stats.followersCount,
                engagementRate: stats.engagementRate || 0,
                mediaCount: stats.mediaCount,
                avgLikes: stats.avgLikes || 0,
                avgComments: stats.avgComments || 0,
                source: "apify",
                rawResponse: JSON.stringify(stats),
            }
        });

        return NextResponse.json({ ok: true, data: stats, metric });

    } catch (error: any) {
        console.error("Critical Error:", error);
        return NextResponse.json({ ok: false, error: "INTERNAL_ERROR", detail: error.message }, { status: 500 });
    }
}
