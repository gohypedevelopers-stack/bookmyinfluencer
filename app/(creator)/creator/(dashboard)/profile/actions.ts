"use server"

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { revalidatePath } from "next/cache"

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

        // Basic validation
        let username = "";
        let providerId = "";

        if (provider === "instagram") {
            if (!url.includes("instagram.com/")) return { error: "Invalid Instagram URL" }
            username = url.split("instagram.com/")[1]?.split("/")[0] || "instagram_user"
            providerId = username
        } else if (provider === "youtube") {
            if (!url.includes("youtube.com/")) return { error: "Invalid YouTube URL" }
            // Handle @handle or channel/ID
            const parts = url.split("youtube.com/");
            username = parts[1]?.split("/")[0] || "youtube_user"
            if (username.startsWith("@")) {
                username = username.substring(1);
            }
            providerId = username; // Use handle as ID for manual
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
                        providerId: providerId || `manual_${provider}`,
                        type: "PUBLIC_API"
                    }
                }
            },
            // Also save the self-reported metric
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
                        followersCount: followersCount
                    },
                    update: {
                        followersCount: followersCount
                    }
                }
            },
            // Update the main metric snapshot
            metrics: {
                create: {
                    provider: provider,
                    followersCount: followersCount,
                    source: "self_reported",
                    date: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        };

        // Specific field updates if they exist in valid schema
        if (provider === "instagram") {
            updateData.instagramUrl = url;
            // updateData.lastInstagramFetchAt = new Date(); // Optional
        } else if (provider === "youtube") {
            updateData.youtubeUrl = url;
            // updateData.lastYoutubeFetchAt = new Date(); // Optional
        }

        await db.creator.update({
            where: { id: creator.id },
            data: updateData
        })

        revalidatePath("/creator/profile", "layout")
        // Also specific page just in case
        revalidatePath("/creator/profile/social-accounts")
        return { success: true }
    } catch (error) {
        console.error(`Error updating ${provider} URL:`, error)
        return { error: `Failed to update ${provider} URL` }
    }
}

// Keep this for backward compatibility if needed, or redirect to new one
export async function updateInstagramUrl(url: string, followersCount: number = 0) {
    return updateSocialProfile("instagram", url, followersCount);
}
