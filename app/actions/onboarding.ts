"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitBrandOnboarding(data: {
    brandName: string;
    campaignType: string;
    budget: string;
    platforms: string[];
    creatorType: string;
    campaignGoals: string;
    minFollowers?: number;
    maxFollowers?: number;
    minPricePerPost?: number;
    maxPricePerPost?: number;
    priceType?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        const userId = session.user.id;

        // Check if profile already exists
        const existing = await db.brandProfile.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (existing) {
            // Update existing profile — preserves all old data not included here
            await db.brandProfile.update({
                where: { userId },
                data: {
                    companyName: data.brandName,
                    campaignType: data.campaignType,
                    campaignBudget: data.budget,
                    targetPlatforms: JSON.stringify(data.platforms),
                    preferredCreatorType: data.creatorType,
                    campaignGoals: data.campaignGoals,
                    onboardingCompleted: true,
                    minFollowers: data.minFollowers ?? null,
                    maxFollowers: data.maxFollowers ?? null,
                    minPricePerPost: data.minPricePerPost ?? null,
                    maxPricePerPost: data.maxPricePerPost ?? null,
                    priceType: data.priceType ?? "Per Post",
                }
            });
        } else {
            // Create new profile
            await db.brandProfile.create({
                data: {
                    userId,
                    companyName: data.brandName,
                    campaignType: data.campaignType,
                    campaignBudget: data.budget,
                    targetPlatforms: JSON.stringify(data.platforms),
                    preferredCreatorType: data.creatorType,
                    campaignGoals: data.campaignGoals,
                    onboardingCompleted: true,
                    minFollowers: data.minFollowers ?? null,
                    maxFollowers: data.maxFollowers ?? null,
                    minPricePerPost: data.minPricePerPost ?? null,
                    maxPricePerPost: data.maxPricePerPost ?? null,
                    priceType: data.priceType ?? "Per Post",
                }
            });
        }

        revalidatePath("/brand/dashboard");
        return { success: true };
    } catch (error: any) {
        const msg = error?.message || String(error);
        console.error("Brand onboarding error:", msg);
        return { error: `Brand save failed: ${msg.substring(0, 300)}` };
    }
}

import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth";

export async function submitCreatorOnboarding(data: {
    fullName: string;
    platforms: string[];
    niche: string;
    followers: string;
    engagement: string;
    minimumPrice: string;
    rates: string;
    priceStory?: string;
    pricePost?: string;
    priceCollab?: string;
    priceType?: string;
}) {
    const creatorId = await getAuthenticatedCreatorId();
    if (!creatorId) {
        return { error: "Unauthorized" };
    }

    try {
        // Check if creator already exists
        const existing = await db.creator.findUnique({
            where: { userId: creatorId },
            select: { id: true }
        });

        if (existing) {
            // Update existing creator — preserves all old data not included here
            await db.creator.update({
                where: { userId: creatorId },
                data: {
                    fullName: data.fullName,
                    niche: data.niche,
                    platforms: JSON.stringify(data.platforms),
                    onboardingCompleted: true,
                    pricing: JSON.stringify({ minimumPrice: data.minimumPrice, rates: data.rates }),
                    price: (parseInt(data.pricePost || data.rates || '0', 10) || 0) as any,
                    priceStory: (parseInt(data.priceStory || '0', 10) || null) as any,
                    pricePost: (parseInt(data.pricePost || '0', 10) || null) as any,
                    priceCollab: (parseInt(data.priceCollab || '0', 10) || null) as any,
                    priceType: (data.priceType || 'Per Post') as any,
                    rawSocialData: JSON.stringify({
                        selfReported: {
                            followers: data.followers,
                            engagement: data.engagement,
                        }
                    }),
                } as any
            });
        } else {
            // Create new creator record
            await db.creator.create({
                data: {
                    userId: creatorId,
                    fullName: data.fullName,
                    niche: data.niche,
                    platforms: JSON.stringify(data.platforms),
                    onboardingCompleted: true,
                    pricing: JSON.stringify({ minimumPrice: data.minimumPrice, rates: data.rates }),
                    price: (parseInt(data.pricePost || data.rates || '0', 10) || 0) as any,
                    priceStory: (parseInt(data.priceStory || '0', 10) || null) as any,
                    pricePost: (parseInt(data.pricePost || '0', 10) || null) as any,
                    priceCollab: (parseInt(data.priceCollab || '0', 10) || null) as any,
                    priceType: (data.priceType || 'Per Post') as any,
                    rawSocialData: JSON.stringify({
                        selfReported: {
                            followers: data.followers,
                            engagement: data.engagement,
                        }
                    }),
                } as any
            });
        }

        revalidatePath("/creator/dashboard");
        return { success: true };
    } catch (error: any) {
        const msg = error?.message || String(error);
        console.error("Creator onboarding error:", msg);
        console.error("Creator ID used:", creatorId);
        return { error: `Creator save failed: ${msg.substring(0, 300)}` };
    }
}
