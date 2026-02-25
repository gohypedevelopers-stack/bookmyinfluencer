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

        // Check if user already exists
        const existingOtpUser = await db.otpUser.findUnique({
            where: { email },
            include: { creator: true }
        })
        const existingUser = await db.user.findUnique({ where: { email } })

        if (existingUser) {
            throw new Error("User already exists. Please login.")
        }

        if (existingOtpUser && existingOtpUser.creator) {
            throw new Error("Creator account already exists. Please login.")
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Ensure the user has verified their email via OTP
        if (!existingOtpUser || !existingOtpUser.verifiedAt) {
            throw new Error("Phone/Email verification required. Please verify your email first.")
        }

        const newUser = existingOtpUser;

        // Create Creator profile linked to the OtpUser with BOTH registration + onboarding data
        await db.creator.create({
            data: {
                userId: newUser.id,
                fullName,
                phone: mobileNumber,
                instagramUrl: instagramUrl || null,
                youtubeUrl: youtubeUrl || null,
                // Onboarding data — set completed so middleware skips onboarding redirect
                onboardingCompleted: true,
                niche: niche || null,
                platforms: platforms || null,
                priceStory: formData.get("priceStory") ? parseInt(formData.get("priceStory") as string) : null,
                pricePost: formData.get("pricePost") ? parseInt(formData.get("pricePost") as string) : null,
                priceCollab: formData.get("priceCollab") ? parseInt(formData.get("priceCollab") as string) : null,
                price: formData.get("pricePost") ? parseInt(formData.get("pricePost") as string) : (parseInt(rates) || null),
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
            } as any
        })

        // Also create a User record for NextAuth login
        await db.user.create({
            data: {
                email,
                name: fullName,
                passwordHash,
                role: "INFLUENCER"
            }
        })

        return { success: true, email }
    } catch (error: any) {
        console.error("Registration error:", error)
        throw new Error(error.message || "Registration failed")
    }
}
