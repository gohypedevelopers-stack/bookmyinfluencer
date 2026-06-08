"use server"

import { db } from "@/lib/db"
import { ensureCreatorAuthUser, syncCreatorProfileByEmail } from "@/lib/auth-sync"
import { authOptions } from "@/lib/auth"
import { verifySession } from "@/lib/session"
import bcrypt from "bcryptjs"
import {
    estimateFollowersCountFromRange,
    normalizeSharedNiche,
    normalizeSharedPlatformId,
    parseEngagementRate,
} from "@/lib/onboarding-taxonomy"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"

function normalizeEmail(value: FormDataEntryValue | null) {
    return typeof value === "string" ? value.trim().toLowerCase() : ""
}

function stringValue(value: FormDataEntryValue | null) {
    return typeof value === "string" ? value : ""
}

function safeParseInt(val: FormDataEntryValue | null | string) {
    if (!val || typeof val !== "string") return null
    const parsed = parseInt(val, 10)
    return isNaN(parsed) ? null : parsed
}

function parseCreatorOnboardingForm(formData: FormData, fallbackName = "Creator") {
    const platforms = stringValue(formData.get("platforms"))
    const niche = stringValue(formData.get("niche"))
    const followers = stringValue(formData.get("followers"))
    const engagement = stringValue(formData.get("engagement"))
    const minimumPrice = stringValue(formData.get("minimumPrice"))
    const rates = stringValue(formData.get("rates"))
    const primaryPlatform = stringValue(formData.get("primaryPlatform"))

    const normalizedNiche = normalizeSharedNiche(niche)
    const estimatedFollowers = estimateFollowersCountFromRange(followers)
    const parsedEngagementRate = parseEngagementRate(engagement)
    const parsedPlatforms = (() => {
        try {
            const parsed = JSON.parse(platforms || "[]")
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    })()
    const selectedProvider =
        parsedPlatforms
            .map((platform) => normalizeSharedPlatformId(String(platform)))
            .find((platform): platform is "instagram" | "youtube" => Boolean(platform))
        ?? normalizeSharedPlatformId(primaryPlatform)
        ?? "instagram"

    const parsedPriceStory = safeParseInt(formData.get("priceStory"))
    const parsedPricePost = safeParseInt(formData.get("pricePost"))
    const parsedPriceCollab = safeParseInt(formData.get("priceCollab"))
    const parsedRates = safeParseInt(rates)
    const fallbackPrice = parsedPricePost !== null ? parsedPricePost : parsedRates

    return {
        fullName: stringValue(formData.get("fullName")) || fallbackName,
        mobileNumber: stringValue(formData.get("mobileNumber")),
        instagramUrl: stringValue(formData.get("instagramUrl")),
        youtubeUrl: stringValue(formData.get("youtubeUrl")),
        location: stringValue(formData.get("location")),
        platforms,
        minimumPrice,
        rates,
        followers,
        engagement,
        normalizedNiche,
        estimatedFollowers,
        parsedEngagementRate,
        selectedProvider,
        parsedPriceStory,
        parsedPricePost,
        parsedPriceCollab,
        fallbackPrice,
    }
}

async function saveCreatorSelfReportedMetric(
    creatorId: string,
    provider: "instagram" | "youtube",
    followersCount: number | null,
) {
    if (followersCount === null) return

    await db.creatorSelfReportedMetric.upsert({
        where: {
            creatorId_provider: {
                creatorId,
                provider,
            },
        },
        update: {
            followersCount,
        },
        create: {
            creatorId,
            provider,
            followersCount,
        },
    })
}

export async function registerUserAction(formData: FormData) {
    try {
        const email = normalizeEmail(formData.get("email"))
        const parsed = parseCreatorOnboardingForm(formData)

        // Validate required fields
        if (!email || !parsed.fullName) {
            throw new Error("Missing required fields")
        }

        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value
        const payload = token ? verifySession(token) : null

        if (!payload?.userId) {
            throw new Error("Please verify your email before continuing")
        }

        const verifiedUser = await db.otpUser.findUnique({
            where: { id: payload.userId },
            select: { email: true },
        })

        if (verifiedUser?.email !== email) {
            throw new Error("Verified email does not match this registration")
        }

        const password = stringValue(formData.get("password"))
        let passwordHash: string | null = null
        if (password) {
            passwordHash = await bcrypt.hash(password, 10)
        }

        const verifiedAt = new Date()
        const { otpUser } = await ensureCreatorAuthUser({
            email,
            name: parsed.fullName,
            passwordHash,
            otpVerifiedAt: verifiedAt,
        })

        const syncResult = await syncCreatorProfileByEmail(email, {
            fullName: parsed.fullName,
            phone: parsed.mobileNumber || null,
            niche: parsed.normalizedNiche || null,
            location: parsed.location || null,
            instagramUrl: parsed.instagramUrl || null,
            youtubeUrl: parsed.youtubeUrl || null,
            onboardingCompleted: true,
            platforms: parsed.platforms || null,
            priceStory: parsed.parsedPriceStory,
            pricePost: parsed.parsedPricePost,
            priceCollab: parsed.parsedPriceCollab,
            price: parsed.fallbackPrice,
            priceType: formData.get("priceType") as string || "Per Post",
            pricing: (parsed.minimumPrice || parsed.rates)
                ? JSON.stringify({ minimumPrice: parsed.minimumPrice || "", rates: parsed.rates || "" })
                : null,
            rawSocialData: (parsed.followers || parsed.engagement)
                ? JSON.stringify({
                    selfReported: {
                        followers: parsed.followers || "",
                        followersEstimate: parsed.estimatedFollowers ?? null,
                        engagement: parsed.engagement || "",
                    }
                })
                : null,
            followersCount: parsed.estimatedFollowers,
            engagementRate: parsed.parsedEngagementRate,
        })

        await saveCreatorSelfReportedMetric(syncResult.creator.id, parsed.selectedProvider, parsed.estimatedFollowers)

        console.info("[REGISTER] Creator registration synced", {
            email,
            otpUserId: otpUser.id,
        })

        return { success: true, email }
    } catch (error: any) {
        console.error("Registration error:", error)

        return { success: false, error: error.message || "Registration failed" }
    }
}

export async function completeGoogleCreatorOnboarding(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)
        const sessionEmail = session?.user?.email?.trim().toLowerCase()

        if (!sessionEmail || session?.user?.role !== "INFLUENCER") {
            return { success: false, error: "Creator session not found. Please sign in again." }
        }

        const submittedEmail = normalizeEmail(formData.get("email"))
        if (submittedEmail && submittedEmail !== sessionEmail) {
            return { success: false, error: "Signed-in Google account does not match this registration." }
        }

        const parsed = parseCreatorOnboardingForm(formData, session.user.name || "Creator")

        await ensureCreatorAuthUser({
            email: sessionEmail,
            name: parsed.fullName,
            otpVerifiedAt: new Date(),
        })

        const syncResult = await syncCreatorProfileByEmail(sessionEmail, {
            fullName: parsed.fullName,
            phone: parsed.mobileNumber || null,
            niche: parsed.normalizedNiche || null,
            location: parsed.location || null,
            instagramUrl: parsed.instagramUrl || null,
            youtubeUrl: parsed.youtubeUrl || null,
            onboardingCompleted: true,
            platforms: parsed.platforms || null,
            priceStory: parsed.parsedPriceStory,
            pricePost: parsed.parsedPricePost,
            priceCollab: parsed.parsedPriceCollab,
            price: parsed.fallbackPrice,
            priceType: formData.get("priceType") as string || "Per Post",
            pricing: (parsed.minimumPrice || parsed.rates)
                ? JSON.stringify({ minimumPrice: parsed.minimumPrice || "", rates: parsed.rates || "" })
                : null,
            rawSocialData: (parsed.followers || parsed.engagement)
                ? JSON.stringify({
                    selfReported: {
                        followers: parsed.followers || "",
                        followersEstimate: parsed.estimatedFollowers ?? null,
                        engagement: parsed.engagement || "",
                    }
                })
                : null,
            followersCount: parsed.estimatedFollowers,
            engagementRate: parsed.parsedEngagementRate,
        })

        await saveCreatorSelfReportedMetric(syncResult.creator.id, parsed.selectedProvider, parsed.estimatedFollowers)

        console.info("[REGISTER] Google creator onboarding completed", {
            email: sessionEmail,
            creatorId: syncResult.creator.id,
        })

        return { success: true, email: sessionEmail }
    } catch (error: any) {
        console.error("Google creator onboarding error:", error)

        return { success: false, error: error.message || "Failed to complete setup" }
    }
}
