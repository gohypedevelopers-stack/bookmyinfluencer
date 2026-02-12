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

        // Check if creator profile exists to determine if we should reset status
        const existingCreator = await db.creator.findUnique({
            where: { userId },
            select: { verificationStatus: true }
        });

        const shouldResetStatus = !existingCreator || existingCreator.verificationStatus === 'REJECTED' || existingCreator.verificationStatus === 'NOT_SUBMITTED';

        // Prepare update data - ONLY update status if needed
        const updateData: any = {
            niche: payload?.niche,
            pricing: JSON.stringify(payload?.pricing),
        };

        if (shouldResetStatus) {
            updateData.verificationStatus = 'PENDING';
            updateData.kycSubmission = {
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
            };
        }

        // Create or Update the creator profile
        await db.creator.upsert({
            where: { userId },
            update: updateData,
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

        // Log the action
        console.log(`[Onboarding] Completed for user ${userId}. Status reset: ${shouldResetStatus}`);

        redirect("/creator/onboarding/verification")
    } catch (error) {
        console.error("completeOnboarding Error:", error)
        throw error
    }
}
