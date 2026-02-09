"use server"

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"

export async function completeOnboarding(payload?: {
    niche: string
    platforms: string[]
    pricing: any
}) {
    try {
        const userId = await getVerifiedUserIdFromCookies()
        console.log("completeOnboarding called", { userId, payload })

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
                verificationStatus: 'PENDING', // Set status to PENDING
                kycSubmission: {
                    upsert: {
                        create: {
                            status: 'PENDING',
                            submittedAt: new Date(),
                        },
                        update: {
                            status: 'PENDING',
                            submittedAt: new Date(),
                        }
                    }
                }
            },
            create: {
                userId,
                niche: payload?.niche,
                pricing: JSON.stringify(payload?.pricing),
                verificationStatus: 'PENDING',
                kycSubmission: {
                    create: {
                        status: 'PENDING',
                        submittedAt: new Date(),
                    }
                }
            },
        })

        redirect("/creator/onboarding/verification")
    } catch (error) {
        console.error("completeOnboarding Error:", error)
        throw error
    }
}
