"use server"

import { db } from "@/lib/db"
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

        // Check if user already exists
        let existingOtpUser = await db.otpUser.findUnique({
            where: { email: normalizedEmail },
            include: { creator: true }
        })

        if (!existingOtpUser || !existingOtpUser.verifiedAt) {
            // If the user skipped verification from the UI or didn't exist, we auto-create one
            // to allow registration to proceed (since UI allows bypassing).
            existingOtpUser = await db.otpUser.upsert({
                where: { email: normalizedEmail },
                update: { verifiedAt: new Date() },
                create: {
                    email: normalizedEmail,
                    verifiedAt: new Date(),
                    createdAt: new Date(),
                },
                include: { creator: true }
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)
        const newUser = existingOtpUser;

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

        // Create or Update Creator profile
        await db.creator.upsert({
            where: { userId: newUser.id },
            update: {
                fullName,
                phone: mobileNumber,
                instagramUrl: instagramUrl || null,
                youtubeUrl: youtubeUrl || null,
                onboardingCompleted: true,
                niche: niche || null,
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
            },
            create: {
                userId: newUser.id,
                fullName,
                phone: mobileNumber,
                instagramUrl: instagramUrl || null,
                youtubeUrl: youtubeUrl || null,
                onboardingCompleted: true,
                niche: niche || null,
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
            }
        });

        // Create or Update User record for NextAuth login
        await db.user.upsert({
            where: { email: normalizedEmail },
            update: {
                name: fullName,
                passwordHash,
                role: "INFLUENCER"
            },
            create: {
                email: normalizedEmail,
                name: fullName,
                passwordHash,
                role: "INFLUENCER"
            }
        });

        return { success: true, email }
    } catch (error: any) {
        console.error("Registration error:", error)
        return { success: false, error: error.message || "Registration failed" }
    }
}
