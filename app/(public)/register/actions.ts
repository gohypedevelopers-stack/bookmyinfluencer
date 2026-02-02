"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function registerUserAction(formData: FormData) {
    try {
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const fullName = formData.get("fullName") as string
        const mobileNumber = formData.get("mobileNumber") as string
        const instagramUrl = formData.get("instagramUrl") as string
        const youtubeUrl = formData.get("youtubeUrl") as string

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

        // Create Creator profile linked to the OtpUser
        await db.creator.create({
            data: {
                userId: newUser.id,
                fullName,
                phone: mobileNumber,
                instagramUrl: instagramUrl || null,
                youtubeUrl: youtubeUrl || null
            }
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
