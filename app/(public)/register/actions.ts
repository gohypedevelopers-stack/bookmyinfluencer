"use server"

import { db } from "@/lib/db"
import { ensureCreatorAuthUser, syncCreatorProfileByEmail } from "@/lib/auth-sync"
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

        const parsedPriceStory = safeParseInt(formData.get("priceStory"));
        const parsedPricePost = safeParseInt(formData.get("pricePost"));
        const parsedPriceCollab = safeParseInt(formData.get("priceCollab"));
        const parsedRates = safeParseInt(rates);
        const fallbackPrice = parsedPricePost !== null ? parsedPricePost : parsedRates;

        await syncCreatorProfileByEmail(normalizedEmail, {
            fullName,
            phone: mobileNumber || null,
            niche: niche || null,
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
                        engagement: engagement || "",
                    }
                })
                : null,
        })

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
