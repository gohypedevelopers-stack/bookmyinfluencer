"use server"

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { revalidatePath } from "next/cache"

import { runApifyActor } from "@/lib/apify";
import { normalizeYoutubeMetrics, parseYoutubeChannel } from "@/lib/metrics-util";

// Generic function to update any social profile (Instagram, YouTube)
export async function updateSocialProfile(provider: "instagram" | "youtube", url: string, followersCount: number = 0) {
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
            username = url.split("instagram.com/")[1]?.split("/")[0] || "instagram_user"
            providerId = username
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
        } else if (provider === "youtube") {
            updateData.youtubeUrl = url;
            if (socialType === "OAUTH") {
                updateData.lastYoutubeFetchAt = new Date();
                if (username) updateData.autoDisplayName = username.substring(0, 100);
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

export async function disconnectSocialProfile(provider: "instagram" | "youtube") {
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

// Keep this for backward compatibility if needed, or redirect to new one
export async function updateInstagramUrl(url: string, followersCount: number = 0) {
    return updateSocialProfile("instagram", url, followersCount);
}

// --- PROFILE UPDATE ACTION ---
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

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

        // Handle File Uploads
        const uploadDir = join(process.cwd(), "public", "uploads")
        await mkdir(uploadDir, { recursive: true })

        if (profileImageFile && profileImageFile.size > 0 && profileImageFile.name) {
            const buffer = Buffer.from(await profileImageFile.arrayBuffer())
            const filename = `profile-${userId}-${Date.now()}-${profileImageFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`
            const filepath = join(uploadDir, filename)
            await writeFile(filepath, buffer)
            updateData.profileImageUrl = `/uploads/${filename}`
        }

        // Separate backgroundImageUrl to allow raw update if Prisma Client is stale
        let bannerUrlFn: string | undefined;

        if (bannerImageFile && bannerImageFile.size > 0 && bannerImageFile.name) {
            const buffer = Buffer.from(await bannerImageFile.arrayBuffer())
            const filename = `banner-${userId}-${Date.now()}-${bannerImageFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`
            const filepath = join(uploadDir, filename)
            await writeFile(filepath, buffer)
            // Do NOT add to updateData directly to avoid "Unknown argument"
            bannerUrlFn = `/uploads/${filename}`
        }

        await db.creator.update({
            where: { userId },
            data: updateData
        })

        // Execute Raw SQL for background_image_url if we have one
        // This bypasses Prisma Client validation if the schema hasn't been regenerated
        if (bannerUrlFn) {
            // Using $executeRawUnsafe because tagged template with dynamic string from file upload could be tricky
            // But here we are passing strict string. 
            // Better to use $executeRaw with parameter.
            // Note: background_image_url is the column name in DB. userId is user_id.
            const { Prisma } = await import("@prisma/client")
            // We need to use Prisma.sql to tag the query if using $executeRaw
            // Or simpler: use $executeRawUnsafe
            await db.$executeRawUnsafe(
                `UPDATE "creators" SET "background_image_url" = $1 WHERE "user_id" = $2`,
                bannerUrlFn,
                userId
            )
        }

        revalidatePath("/creator/profile")
        return { success: true }
    } catch (e: any) {
        console.error("Profile Update Error:", e)
        return { success: false, error: e.message }
    }
}
