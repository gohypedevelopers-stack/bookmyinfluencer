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
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        // Note: cast to `any` because prisma generate may not have updated the client types yet.
        // The columns exist in the DB (db push succeeded).
        const profileData: any = {
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
        };

        await db.brandProfile.upsert({
            where: { userId: session.user.id },
            update: profileData,
            create: {
                userId: session.user.id,
                ...profileData,
            }
        });

        revalidatePath("/brand/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Brand onboarding error:", error);
        return { error: "Failed to save onboarding data" };
    }
}

import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth";

export async function submitCreatorOnboarding(data: {
    fullName: string;
    platforms: string[];
    niche: string;
    followers: string;
    engagement: string;
    rates: string;
}) {
    const creatorId = await getAuthenticatedCreatorId();
    if (!creatorId) {
        return { error: "Unauthorized" };
    }

    try {
        // Update Creator model (linked to OtpUser)
        await db.creator.update({
            where: { id: creatorId },
            data: {
                fullName: data.fullName,
                niche: data.niche,
                platforms: JSON.stringify(data.platforms),
                onboardingCompleted: true,
                pricing: data.rates, // Mapping rates to pricing
                // Store self-reported metrics?
                // For now, these fields don't map directly to Creator columns except maybe constructing a JSON in a new field if needed.
                // But we have `CreatorSelfReportedMetric` model.
            }
        });

        // Also try to update legacy InfluencerProfile if it exists (via User linked to same email)
        // This is complex because we don't easily know the legacy User ID from OtpUser without email lookup.
        // But for now, updating Creator is the priority for the new flow.

        revalidatePath("/creator/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Creator onboarding error:", error);
        return { error: "Failed to save onboarding data" };
    }
}
