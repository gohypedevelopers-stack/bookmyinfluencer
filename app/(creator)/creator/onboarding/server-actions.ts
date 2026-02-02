'use server'

import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { db } from "@/lib/db"
import { runApifyActor } from "@/lib/apify"
import { normalizeYoutubeMetrics, parseYoutubeChannel } from "@/lib/metrics-util"
import { fetchInstagramPublicStats } from "@/lib/instagram-public"
import { revalidatePath } from "next/cache"

// --- YouTube Action ---
export async function fetchAndSaveYoutubeOnboarding(url: string) {
    const userId = await getVerifiedUserIdFromCookies()
    console.log(`[YouTube Onboarding] ID from cookie: ${userId}`);

    if (!userId) {
        return { success: false, error: "Unauthorized" }
    }

    // Ensure user exists in DB to avoid FK violation
    const userExists = await db.otpUser.findUnique({ where: { id: userId } })
    console.log(`[YouTube Onboarding] User exists in DB? ${!!userExists} (ID: ${userId})`);

    if (!userExists) {
        return { success: false, error: "Session invalid. Please verify again." }
    }

    // 1. Validate Input
    if (!url) return { success: false, error: "URL is required" }

    // 2. Apify Config
    const apifyToken = process.env.APIFY_TOKEN
    const actorId = process.env.APIFY_YOUTUBE_ACTOR_ID
    if (!apifyToken || !actorId) {
        return { success: false, error: "Server configuration missing" }
    }

    // 3. Parse URL
    const target = parseYoutubeChannel(url)
    if (!target || !target.value) {
        return { success: false, error: "Invalid YouTube URL" }
    }

    try {
        // 4. Run Apify
        const input: any = { maxResults: 1 }
        if (target.type === 'channel' && target.value.startsWith("UC")) {
            input.startUrls = [{ url: `https://www.youtube.com/channel/${target.value}` }]
        } else {
            let cleanUrl = target.value
            if (target.type === 'handle' && !cleanUrl.includes("youtube.com")) {
                cleanUrl = `https://www.youtube.com/${cleanUrl.startsWith("@") ? cleanUrl : "@" + cleanUrl}`
            }
            input.startUrls = [{ url: cleanUrl }]
        }

        const result = await runApifyActor({
            token: apifyToken,
            actorId: actorId,
            input: input,
            timeoutSecs: 180
        })

        if (result.error) return { success: false, error: result.error }
        const items = result.data || []
        if (items.length === 0) return { success: false, error: "Channel not found" }

        const stats = normalizeYoutubeMetrics(items)
        const finalChannelId = stats.channelId || target.value

        // 5. UPSERT Creator & Related Data
        // Creates the creator profile if it doesn't exist yet!
        const creator = await db.creator.upsert({
            where: { userId },
            update: {
                autoDisplayName: stats.title?.substring(0, 100),
                autoProfileImageUrl: stats.thumbnailUrl,
                autoBio: stats.description?.substring(0, 500),
                youtubeUrl: stats.customUrl || `https://youtube.com/channel/${finalChannelId}`,
                rawSocialData: JSON.stringify(items.filter((i: any) => i.type === 'video' || i.likeCount).slice(0, 50)),
                lastYoutubeFetchAt: new Date(),
            },
            create: {
                userId,
                autoDisplayName: stats.title?.substring(0, 100),
                autoProfileImageUrl: stats.thumbnailUrl,
                autoBio: stats.description?.substring(0, 500),
                youtubeUrl: stats.customUrl || `https://youtube.com/channel/${finalChannelId}`,
                rawSocialData: JSON.stringify(items.filter((i: any) => i.type === 'video' || i.likeCount).slice(0, 50)),
                lastYoutubeFetchAt: new Date(),
            }
        })

        // Upsert Social Account
        await db.creatorSocialAccount.upsert({
            where: { creatorId_provider: { creatorId: creator.id, provider: "youtube" } },
            create: {
                creatorId: creator.id,
                provider: "youtube",
                providerId: finalChannelId,
                username: stats.title,
                type: "OAUTH", // Keeping OAUTH/PUBLIC distinction if needed, but this is fetched public data.
            },
            update: {
                providerId: finalChannelId,
                username: stats.title,
            }
        })

        // Create Metric
        await db.creatorMetric.create({
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
        })

        revalidatePath('/creator/onboarding')
        return { success: true, data: stats }

    } catch (e: any) {
        console.error("YouTube Onboarding Error:", e)
        return { success: false, error: e.message }
    }
}

// --- Instagram Action ---
export async function fetchAndSaveInstagramOnboarding(url: string) {
    const userId = await getVerifiedUserIdFromCookies()
    console.log(`[Instagram Onboarding] ID from cookie: ${userId}`);

    if (!userId) return { success: false, error: "Unauthorized" }

    // Ensure user exists in DB to avoid FK violation
    const userExists = await db.otpUser.findUnique({ where: { id: userId } })
    console.log(`[Instagram Onboarding] User exists in DB? ${!!userExists} (ID: ${userId})`);

    if (!userExists) {
        return { success: false, error: "Session invalid. Please verify again." }
    }

    if (!url) return { success: false, error: "URL is required" }

    const apifyToken = process.env.APIFY_TOKEN
    if (!apifyToken) return { success: false, error: "Server configuration missing" }

    const actorId = process.env.APIFY_INSTAGRAM_ACTOR_ID

    try {
        const { stats, error } = await fetchInstagramPublicStats(url, apifyToken, actorId)

        if (error || !stats) {
            return { success: false, error: error?.message || "Failed to fetch Instagram data" }
        }

        // UPSERT Creator
        const creator = await db.creator.upsert({
            where: { userId },
            update: {
                autoDisplayName: stats.fullName,
                autoProfileImageUrl: stats.profilePicUrl,
                autoBio: stats.biography,
                instagramUrl: `https://instagram.com/${stats.username}`,
                lastInstagramFetchAt: new Date(),
            },
            create: {
                userId,
                autoDisplayName: stats.fullName,
                autoProfileImageUrl: stats.profilePicUrl,
                autoBio: stats.biography,
                instagramUrl: `https://instagram.com/${stats.username}`,
                lastInstagramFetchAt: new Date(),
            }
        })

        // Upsert Social Account
        await db.creatorSocialAccount.upsert({
            where: { creatorId_provider: { creatorId: creator.id, provider: "instagram" } },
            create: {
                creatorId: creator.id,
                provider: "instagram",
                providerId: stats.username,
                username: stats.username,
                type: "PUBLIC_API",
            },
            update: {
                providerId: stats.username,
                username: stats.username,
                type: "PUBLIC_API",
            }
        })

        // Create Metric
        await db.creatorMetric.create({
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
        })

        revalidatePath('/creator/onboarding')
        return { success: true, data: stats }

    } catch (e: any) {
        console.error("Instagram Onboarding Error:", e)
        return { success: false, error: e.message }
    }
}

export async function logoutAction() {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    cookieStore.delete("session")
    return { success: true }
}
