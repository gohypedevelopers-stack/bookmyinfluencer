"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth";
import {
    estimateFollowersCountFromRange,
    normalizeSharedNiche,
    normalizeSharedPlatformId,
    parseEngagementRate,
} from "@/lib/onboarding-taxonomy";

export async function submitBrandOnboarding(data: {
    brandName: string;
    campaignType: string;
    budget: string;
    platforms: string[];
    creatorType: string;
    campaignGoals: string;
    minFollowers?: number;
    maxFollowers?: number;
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
            // Update existing profile â€” preserves all old data not included here
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
                    minPricePerPost: null,
                    maxPricePerPost: null,
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
                    minPricePerPost: null,
                    maxPricePerPost: null,
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

export async function submitCreatorOnboarding(data: {
    fullName: string;
    platforms: string[];
    niche: string;
    followers: string;
    engagement: string;
}) {
    const creatorId = await getAuthenticatedCreatorId();
    if (!creatorId) {
        return { error: "Unauthorized" };
    }

    try {
        const normalizedNiche = normalizeSharedNiche(data.niche);
        const estimatedFollowers = estimateFollowersCountFromRange(data.followers);
        const parsedEngagementRate = parseEngagementRate(data.engagement);
        const selectedProvider =
            data.platforms
                .map((platform) => normalizeSharedPlatformId(platform))
                .find((platform): platform is "instagram" | "youtube" => Boolean(platform))
            ?? "instagram";

        // Check if creator already exists
        const existing = await db.creator.findUnique({
            where: { userId: creatorId },
            select: { id: true }
        });

        if (existing) {
            // Update existing creator â€” preserves all old data not included here
            await db.creator.update({
                where: { userId: creatorId },
                data: {
                    fullName: data.fullName,
                    niche: normalizedNiche,
                    platforms: JSON.stringify(data.platforms),
                    onboardingCompleted: true,
                    pricing: null as any,
                    price: null as any,
                    priceStory: null as any,
                    pricePost: null as any,
                    priceCollab: null as any,
                    priceType: null as any,
                    rawSocialData: JSON.stringify({
                        selfReported: {
                            followers: data.followers,
                            followersEstimate: estimatedFollowers ?? null,
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
                    niche: normalizedNiche,
                    platforms: JSON.stringify(data.platforms),
                    onboardingCompleted: true,
                    pricing: null as any,
                    price: null as any,
                    priceStory: null as any,
                    pricePost: null as any,
                    priceCollab: null as any,
                    priceType: null as any,
                    rawSocialData: JSON.stringify({
                        selfReported: {
                            followers: data.followers,
                            followersEstimate: estimatedFollowers ?? null,
                            engagement: data.engagement,
                        }
                    }),
                } as any
            });
        }

        const otpUser = await db.otpUser.findUnique({
            where: { id: creatorId },
            select: { email: true },
        });

        if (estimatedFollowers !== null) {
            const creator = await db.creator.findUnique({
                where: { userId: creatorId },
                select: { id: true },
            });

            const authUser = otpUser?.email
                ? await db.user.findUnique({
                    where: { email: otpUser.email.toLowerCase() },
                    select: { id: true },
                })
                : null;

            if (creator) {
                await db.creatorSelfReportedMetric.upsert({
                    where: {
                        creatorId_provider: {
                            creatorId: creator.id,
                            provider: selectedProvider,
                        },
                    },
                    update: {
                        followersCount: estimatedFollowers,
                    },
                    create: {
                        creatorId: creator.id,
                        provider: selectedProvider,
                        followersCount: estimatedFollowers,
                    },
                });
            }

            if (authUser) {
                await db.influencerProfile.upsert({
                    where: { userId: authUser.id },
                    update: {
                        niche: normalizedNiche || "General",
                        followers: estimatedFollowers,
                        engagementRate: parsedEngagementRate ?? 0,
                        platforms: JSON.stringify(data.platforms),
                        onboardingCompleted: true,
                    },
                    create: {
                        userId: authUser.id,
                        niche: normalizedNiche || "General",
                        followers: estimatedFollowers,
                        engagementRate: parsedEngagementRate ?? 0,
                        platforms: JSON.stringify(data.platforms),
                        onboardingCompleted: true,
                    },
                });
            }
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

