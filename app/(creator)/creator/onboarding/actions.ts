"use server"

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"

export async function completeOnboarding(payload?: {
    niche: string
    platforms: string[]
    pricing: any
}) {
    const userId = await getVerifiedUserIdFromCookies()

    if (!userId) {
        redirect("/verify")
    }

    // Check if the user exists in the database
    // If not, create it (handles legacy sessions with invalid userIds)
    const existingUser = await db.otpUser.findUnique({
        where: { id: userId }
    })

    if (!existingUser) {
        // Create a placeholder user for this session
        await db.otpUser.create({
            data: {
                id: userId,
                email: `user-${userId.substring(0, 8)}@placeholder.local`,
                verifiedAt: new Date(),
            }
        })
    }

    // Create or Update the creator profile
    await db.creator.upsert({
        where: { userId },
        update: {
            niche: payload?.niche,
            pricing: JSON.stringify(payload?.pricing),
        },
        create: {
            userId,
            niche: payload?.niche,
            pricing: JSON.stringify(payload?.pricing),
        },
    })

    redirect("/creator/onboarding/verification")
}
