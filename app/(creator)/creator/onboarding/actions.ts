"use server"

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { normalizeSharedNiche } from "@/lib/onboarding-taxonomy"

export async function completeOnboarding(payload?: {
    niche: string
    platforms: string[]
}) {
    try {
        const userId = await getAuthenticatedCreatorId()
        console.log("completeOnboarding called", { userId, payload })

        if (!userId) {
            redirect("/login")
        }

        // Check if the verified onboarding user exists in the OTP auth table.
        const existingUser = await db.otpUser.findUnique({
            where: { id: userId }
        })

        if (!existingUser) {
            console.error("[Onboarding] Missing verified OTP user for creator onboarding", { userId })
            throw new Error("Verified creator session not found. Please verify your email again.")
        }

        // Check if creator profile exists to determine if we should reset status
        const existingCreator = await db.creator.findUnique({
            where: { userId },
            select: { verificationStatus: true }
        });

        const shouldResetStatus = !existingCreator || existingCreator.verificationStatus === 'REJECTED' || existingCreator.verificationStatus === 'NOT_SUBMITTED';
        const normalizedNiche = normalizeSharedNiche(payload?.niche);

        // Prepare update data - ONLY update status if needed
        const updateData: any = {
            niche: normalizedNiche || payload?.niche,
            pricing: null,
            price: null,
            priceStory: null,
            pricePost: null,
            priceCollab: null,
            priceType: null,
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
                niche: normalizedNiche || payload?.niche,
                pricing: null,
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

