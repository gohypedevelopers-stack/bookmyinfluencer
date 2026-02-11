"use server"

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { revalidatePath } from "next/cache"

import { runApifyActor } from "@/lib/apify";
import { normalizeYoutubeMetrics, parseYoutubeChannel } from "@/lib/metrics-util";

// Generic function to update any social profile (Instagram, YouTube, etc.)
export async function updateSocialProfile(provider: "instagram" | "youtube" | "tiktok" | "twitch", url: string, followersCount: number = 0) {
    try {
        const userId = await getVerifiedUserIdFromCookies()
        if (!userId) {
            return { error: "Unauthorized" }
        }

        const creator = await db.creator.findUnique({
            where: { userId }
        })

        if (!creator) {
            return { error: "Creator profile not found" }
        }

        // Basic validation & Data Prep
        let username = "";
        let providerId = "";
        let finalFollowersCount = followersCount;
        let finalEncodedData: any = null;
        let socialType: "PUBLIC_API" | "OAUTH" = "PUBLIC_API"; // Default to manual/public

        if (provider === "instagram") {
            if (!url.includes("instagram.com/")) return { error: "Invalid Instagram URL" }

            // --- INSTAGRAM AUTO-FETCH START ---
            try {
                const apifyToken = process.env.APIFY_TOKEN;
                const actorId = process.env.APIFY_INSTAGRAM_ACTOR_ID;

                if (apifyToken && actorId) {
                    const { fetchInstagramPublicStats } = await import("@/lib/instagram-public");
                    const res = await fetchInstagramPublicStats(url, apifyToken, actorId);

                    if (res.stats) {
                        finalFollowersCount = res.stats.followersCount;
                        username = res.stats.username;
                        providerId = username;
                        socialType = "OAUTH"; // Verified via scraper
                        finalEncodedData = res.stats;
                    }
                }
            } catch (err) {
                console.error("[Instagram Sync] Error:", err);
            }

            if (!username) {
                username = url.split("instagram.com/")[1]?.split("/")[0] || "instagram_user"
                providerId = username
            }
            // --- INSTAGRAM AUTO-FETCH END ---
        } else if (provider === "youtube") {
            if (!url.includes("youtube.com/")) return { error: "Invalid YouTube URL" }

            // --- AUTO-FETCH LOGIC START ---
            try {
                const apifyToken = process.env.APIFY_TOKEN;
                const actorId = process.env.APIFY_YOUTUBE_ACTOR_ID;

                if (apifyToken && actorId) {
                    console.log("[Auto-Sync] Fetching YouTube data for:", url);

                    const target = parseYoutubeChannel(url.trim());
                    if (target && target.value) {
                        // Prepare Apify Input
                        const input: any = { maxResults: 1 };
                        if (target.type === 'channel' && target.value.startsWith("UC")) {
                            input.startUrls = [{ url: `https://www.youtube.com/channel/${target.value}` }];
                        } else {
                            let cleanUrl = target.value;
                            if (target.type === 'handle' && !cleanUrl.includes("youtube.com")) {
                                cleanUrl = `https://www.youtube.com/${cleanUrl.startsWith("@") ? cleanUrl : "@" + cleanUrl}`;
                            }
                            input.startUrls = [{ url: cleanUrl }];
                        }

                        const result = await runApifyActor({
                            token: apifyToken,
                            actorId: actorId,
                            input: input,
                            timeoutSecs: 120 // Create slightly shorter timeout for UI interaction
                        });

                        if (!result.error && result.data && result.data.length > 0) {
                            const stats = normalizeYoutubeMetrics(result.data);

                            // Update variables with real data
                            finalFollowersCount = typeof stats.subscribers === 'number' ? stats.subscribers : finalFollowersCount;
                            username = stats.title || username;
                            providerId = stats.channelId || target.value;
                            socialType = "OAUTH"; // Verified via scraper effectively acts as verified data

                            // Save raw data for Media Kit
                            // We save the first 50 items (videos) if available
                            finalEncodedData = result.data.filter((i: any) => i.type === 'video' || i.likeCount).slice(0, 50);
                            console.log("[Auto-Sync] Success. Subscribers:", finalFollowersCount);
                        } else {
                            console.warn("[Auto-Sync] Failed to fetch or no data returned", result.error);
                            // Fallback to manual parsing if parse failed or no data
                            const parts = url.split("youtube.com/");
                            username = parts[1]?.split("/")[0] || "youtube_user"
                            if (username.startsWith("@")) username = username.substring(1);
                            providerId = username;
                        }
                    }
                }
            } catch (fetchErr) {
                console.error("[Auto-Sync] Exception during fetch:", fetchErr);
                // Fallback to basic parsing
                const parts = url.split("youtube.com/");
                username = parts[1]?.split("/")[0] || "youtube_user"
                if (username.startsWith("@")) username = username.substring(1);
                providerId = username;
            }
            // --- AUTO-FETCH LOGIC END ---

            // If we failed to get providerId from fetch, ensure we have one
            if (!providerId) {
                const parts = url.split("youtube.com/");
                username = parts[1]?.split("/")[0] || "youtube_user"
                if (username.startsWith("@")) username = username.substring(1);
                providerId = username;
            }
        } else if (provider === "tiktok") {
            if (!url.includes("tiktok.com/")) return { error: "Invalid TikTok URL" }
            username = url.split("tiktok.com/")[1]?.split("/")[0] || "tiktok_user"
            if (username.startsWith("@")) username = username.substring(1);
            providerId = username
        } else if (provider === "twitch") {
            if (!url.includes("twitch.tv/")) return { error: "Invalid Twitch URL" }
            username = url.split("twitch.tv/")[1]?.split("/")[0] || "twitch_user"
            providerId = username
        }

        // Update logic
        const updateData: any = {
            socialAccounts: {
                connectOrCreate: {
                    where: {
                        creatorId_provider: {
                            creatorId: creator.id,
                            provider: provider
                        }
                    },
                    create: {
                        provider: provider,
                        username: username,
                        providerId: providerId,
                        type: socialType
                    }
                }
            },
            // Also save the self-reported metric (or verified metric if we got it)
            selfReportedMetrics: {
                upsert: {
                    where: {
                        creatorId_provider: {
                            creatorId: creator.id,
                            provider: provider
                        }
                    },
                    create: {
                        provider: provider,
                        followersCount: finalFollowersCount
                    },
                    update: {
                        followersCount: finalFollowersCount
                    }
                }
            },
            // Update the main metric snapshot
            metrics: {
                create: {
                    provider: provider,
                    followersCount: finalFollowersCount,
                    source: socialType === "OAUTH" ? "apify" : "self_reported",
                    date: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        };

        // Specific field updates if they exist in valid schema
        if (provider === "instagram") {
            updateData.instagramUrl = url;
            if (socialType === "OAUTH") {
                updateData.lastInstagramFetchAt = new Date();
                if (finalEncodedData) updateData.rawSocialData = JSON.stringify(finalEncodedData);
            }
        } else if (provider === "youtube") {
            updateData.youtubeUrl = url;
            if (socialType === "OAUTH") {
                updateData.lastYoutubeFetchAt = new Date();
                if (username) updateData.autoDisplayName = username.substring(0, 100);
                if (finalEncodedData) updateData.rawSocialData = JSON.stringify(finalEncodedData);
            }
        } else if (provider === "tiktok") {
            updateData.tiktokUrl = url;
            if (socialType === "OAUTH") {
                updateData.lastTiktokFetchAt = new Date();
                if (finalEncodedData) updateData.rawSocialData = JSON.stringify(finalEncodedData);
            }
        } else if (provider === "twitch") {
            (updateData as any).twitchUrl = url;
            if (socialType === "OAUTH") {
                (updateData as any).lastTwitchFetchAt = new Date();
                if (finalEncodedData) updateData.rawSocialData = JSON.stringify(finalEncodedData);
            }
        }

        await db.creator.update({
            where: { id: creator.id },
            data: updateData
        })

        // Also update the SocialAccount explicitly if it existed, to ensure username/providerId sync
        // connectOrCreate doesn't update if exists.
        await db.creatorSocialAccount.updateMany({
            where: { creatorId: creator.id, provider: provider },
            data: {
                username: username,
                providerId: providerId,
                type: socialType
            }
        });

        revalidatePath("/creator/profile", "layout")
        revalidatePath("/creator/profile/social-accounts")
        return { success: true }
    } catch (error) {
        console.error(`Error updating ${provider} URL:`, error)
        return { error: `Failed to update ${provider} URL` }
    }
}

export async function disconnectSocialProfile(provider: "instagram" | "youtube" | "tiktok" | "twitch") {
    try {
        const userId = await getVerifiedUserIdFromCookies()
        if (!userId) return { error: "Unauthorized" }

        const creator = await db.creator.findUnique({ where: { userId } })
        if (!creator) return { error: "Creator not found" }

        // Remove from SocialAccounts
        await db.creatorSocialAccount.deleteMany({
            where: {
                creatorId: creator.id,
                provider: provider
            }
        })

        // NOTE: We might want to keep Metrics for history, but typically "Disconnect" implies resetting.
        // However, self-reported metrics might be kept or cleared. Let's clear self-reported.
        await db.creatorSelfReportedMetric.deleteMany({
            where: {
                creatorId: creator.id,
                provider: provider
            }
        })

        // Also clear the specific URL fields on Creator model
        const updateData: any = {}
        if (provider === "instagram") updateData.instagramUrl = null
        if (provider === "youtube") updateData.youtubeUrl = null
        if (provider === "tiktok") updateData.tiktokUrl = null

        await db.creator.update({
            where: { id: creator.id },
            data: updateData
        })

        revalidatePath("/creator/profile", "layout")
        revalidatePath("/creator/profile/social-accounts")
        return { success: true }
    } catch (error) {
        console.error(`Error disconnecting ${provider}:`, error)
        return { error: `Failed to disconnect ${provider}` }
    }
}

export async function toggleLiveSync(enabled: boolean) {
    try {
        const userId = await getVerifiedUserIdFromCookies()
        if (!userId) return { error: "Unauthorized" }

        await db.creator.update({
            where: { userId },
            data: { isLiveSyncEnabled: enabled } as any
        })

        revalidatePath("/creator/profile/social-accounts")
        return { success: true }
    } catch (error) {
        console.error("Error toggling live sync:", error)
        return { error: "Failed to update sync settings" }
    }
}

export async function syncAllSocialData() {
    try {
        const userId = await getVerifiedUserIdFromCookies()
        if (!userId) return { error: "Unauthorized" }

        const creator = await db.creator.findUnique({
            where: { userId },
            include: { socialAccounts: true }
        })

        if (!creator) return { error: "Creator not found" }

        const results = [];
        for (const account of creator.socialAccounts) {
            // Re-use updateSocialProfile if we have the URL stored in Creator model
            let url = "";
            if (account.provider === "instagram") url = creator.instagramUrl || "";
            if (account.provider === "youtube") url = creator.youtubeUrl || "";
            if (account.provider === "tiktok") url = (creator as any).tiktokUrl || "";
            if (account.provider === "twitch") url = (creator as any).twitchUrl || "";

            if (url) {
                console.log(`[SyncAll] Syncing ${account.provider} for ${url}`);
                const res = await updateSocialProfile(account.provider as any, url);
                results.push({ provider: account.provider, success: !res.error });
            }
        }

        revalidatePath("/creator/profile/social-accounts")
        return { success: true, results }
    } catch (error) {
        console.error("Error syncing all social data:", error)
        return { error: "Failed to sync social data" }
    }
}

export async function updateMediaKitStats() {
    // This is a wrapper for a full sync for now
    return syncAllSocialData();
}

// Keep this for backward compatibility if needed, or redirect to new one
export async function updateInstagramUrl(url: string, followersCount: number = 0) {
    return updateSocialProfile("instagram", url, followersCount);
}

// --- PROFILE UPDATE ACTION ---


export async function updateCreatorProfileAction(formData: FormData) {
    try {
        const userId = await getVerifiedUserIdFromCookies()
        if (!userId) return { success: false, error: "Unauthorized" }

        const displayName = formData.get("displayName") as string
        const niche = formData.get("niche") as string
        const bio = formData.get("bio") as string
        const profileImageFile = formData.get("profileImage") as File | null
        const bannerImageFile = formData.get("bannerImage") as File | null

        const updateData: any = {
            displayName,
            niche,
            bio
        }

        // Handle File Uploads via Base64 (to avoid EROFS on Vercel)
        if (profileImageFile && profileImageFile.size > 0 && profileImageFile.name) {
            const buffer = Buffer.from(await profileImageFile.arrayBuffer())
            const base64 = buffer.toString('base64')
            updateData.profileImageUrl = `data:${profileImageFile.type};base64,${base64}`
        }

        if (bannerImageFile && bannerImageFile.size > 0 && bannerImageFile.name) {
            const buffer = Buffer.from(await bannerImageFile.arrayBuffer())
            const base64 = buffer.toString('base64')
            updateData.backgroundImageUrl = `data:${bannerImageFile.type};base64,${base64}`
        }

        console.log("Updating creator profile for user:", userId, "with data:", JSON.stringify(updateData, null, 2))

        await db.creator.update({
            where: { userId },
            data: updateData
        })

        revalidatePath("/creator/profile")
        return { success: true }
    } catch (e: any) {
        console.error("Profile Update Error:", e)
        return { success: false, error: e.message }
    }
}
