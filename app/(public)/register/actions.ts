"use server"

import { db } from "@/lib/db"
import { ensureCreatorAuthUser, syncCreatorProfileByEmail } from "@/lib/auth-sync"
import {
    estimateFollowersCountFromRange,
    normalizeSharedNiche,
    normalizeSharedPlatformId,
    parseEngagementRate,
} from "@/lib/onboarding-taxonomy"
import bcrypt from "bcryptjs"

export async function registerUserAction(formData: FormData) {
    try {
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const fullName = formData.get("fullName") as string
        const mobileNumber = formData.get("mobileNumber") as string
        const primaryPlatform = formData.get("primaryPlatform") as string
        const instagramUrl = formData.get("instagramUrl") as string
        const youtubeUrl = formData.get("youtubeUrl") as string

        // Onboarding data
        const platforms = formData.get("platforms") as string // JSON string array
        const niche = formData.get("niche") as string
        const followers = formData.get("followers") as string
        const engagement = formData.get("engagement") as string
        const minimumPrice = formData.get("minimumPrice") as string
        const rates = formData.get("rates") as string

        // Validate required fields
        if (!email || !password || !fullName) {
            throw new Error("Missing required fields")
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)
        const verifiedAt = new Date()
        const { otpUser } = await ensureCreatorAuthUser({
            email: normalizedEmail,
            name: fullName,
            passwordHash,
            otpVerifiedAt: verifiedAt,
        })

        const safeParseInt = (val: any) => {
            if (!val || typeof val !== 'string') return null;
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? null : parsed;
        };

        const normalizedNiche = normalizeSharedNiche(niche);
        const estimatedFollowers = estimateFollowersCountFromRange(followers);
        const parsedEngagementRate = parseEngagementRate(engagement);
        const parsedPlatforms = (() => {
            try {
                const parsed = JSON.parse(platforms || "[]");
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        })();
        const selectedProvider =
            parsedPlatforms
                .map((platform) => normalizeSharedPlatformId(String(platform)))
                .find((platform): platform is "instagram" | "youtube" => Boolean(platform))
            ?? normalizeSharedPlatformId(primaryPlatform)
            ?? "instagram";

        const parsedPriceStory = safeParseInt(formData.get("priceStory"));
        const parsedPricePost = safeParseInt(formData.get("pricePost"));
        const parsedPriceCollab = safeParseInt(formData.get("priceCollab"));
        const parsedRates = safeParseInt(rates);
        const fallbackPrice = parsedPricePost !== null ? parsedPricePost : parsedRates;
        const location = formData.get("location") as string;

        const syncResult = await syncCreatorProfileByEmail(normalizedEmail, {
            fullName,
            phone: mobileNumber || null,
            niche: normalizedNiche || null,
            location: location || null,
            instagramUrl: instagramUrl || null,
            youtubeUrl: youtubeUrl || null,
            onboardingCompleted: true,
            platforms: platforms || null,
            priceStory: parsedPriceStory,
            pricePost: parsedPricePost,
            priceCollab: parsedPriceCollab,
            price: fallbackPrice,
            priceType: formData.get("priceType") as string || "Per Post",
            pricing: (minimumPrice || rates)
                ? JSON.stringify({ minimumPrice: minimumPrice || "", rates: rates || "" })
                : null,
            rawSocialData: (followers || engagement)
                ? JSON.stringify({
                    selfReported: {
                        followers: followers || "",
                        followersEstimate: estimatedFollowers ?? null,
                        engagement: engagement || "",
                    }
                })
                : null,
            followersCount: estimatedFollowers,
            engagementRate: parsedEngagementRate,
        })

        if (estimatedFollowers !== null) {
            await db.creatorSelfReportedMetric.upsert({
                where: {
                    creatorId_provider: {
                        creatorId: syncResult.creator.id,
                        provider: selectedProvider,
                    },
                },
                update: {
                    followersCount: estimatedFollowers,
                },
                create: {
                    creatorId: syncResult.creator.id,
                    provider: selectedProvider,
                    followersCount: estimatedFollowers,
                },
            })
        }

        console.info("[REGISTER] Creator registration synced", {
            email: normalizedEmail,
            otpUserId: otpUser.id,
        })

        return { success: true, email }
    } catch (error: any) {
        console.error("Registration error:", error)

        return { success: false, error: error.message || "Registration failed" }
    }
}
