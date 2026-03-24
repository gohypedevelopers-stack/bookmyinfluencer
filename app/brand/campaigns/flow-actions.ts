"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    DEFAULT_ENGAGEMENT_MAX,
    DEFAULT_ENGAGEMENT_MIN,
    MICRO_FOLLOWER_MIN,
    assignManagerIfMissing,
    ensureCampaignSuggestions,
    summarizeCampaignFlow,
} from "@/lib/campaign-flow";

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
    if (!value || typeof value !== "string") return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDate(value: FormDataEntryValue | null) {
    if (!value || typeof value !== "string") return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

async function requireBrandSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !["BRAND", "ADMIN"].includes(session.user.role as string)) {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function createCampaignFlow(_: any, formData: FormData) {
    try {
        const session = await requireBrandSession();
        const brand = await db.brandProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });
        if (!brand) return { success: false, error: "Brand profile not found" };

        const budget = parseNumber(formData.get("budget"), 0);
        if (budget < MICRO_FOLLOWER_MIN) {
            return { success: false, error: "Budget must be at least â‚¹10,000." };
        }

        const title = String(formData.get("title") || "").trim() || "New Campaign";
        const description = String(formData.get("description") || "").trim();
        const requirements = String(formData.get("requirements") || "").trim();
        const niche = String(formData.get("niche") || "").trim() || null;
        const location = String(formData.get("location") || "").trim() || null;
        const platform = String(formData.get("platform") || "").trim() || null;
        const influencerType = "MICRO";
        const engagementMin = Math.max(0, parseNumber(formData.get("engagementMin"), DEFAULT_ENGAGEMENT_MIN));
        const engagementMax = Math.max(engagementMin, parseNumber(formData.get("engagementMax"), DEFAULT_ENGAGEMENT_MAX));

        const campaign = await db.campaign.create({
            data: {
                brandId: brand.id,
                title,
                description: description || null,
                requirements: requirements || null,
                budget,
                niche,
                location,
                platform,
                influencerType,
                engagementMin,
                engagementMax,
                paymentType: "UPFRONT",
                minFollowers: MICRO_FOLLOWER_MIN,
                status: "DRAFT",
                paymentStatus: "PENDING",
                startDate: parseDate(formData.get("startDate")),
                endDate: parseDate(formData.get("endDate")),
                images: "[]",
            },
        });

        await ensureCampaignSuggestions(campaign.id, session.user.id);
        revalidatePath("/brand/campaigns");
        return { success: true, campaignId: campaign.id };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to create campaign" };
    }
}

export async function updateCampaignFlow(_: any, formData: FormData) {
    try {
        const session = await requireBrandSession();
        const campaignId = String(formData.get("campaignId") || "");
        if (!campaignId) return { success: false, error: "Campaign ID is required." };

        const campaign = await db.campaign.findFirst({
            where: {
                id: campaignId,
                brand: { userId: session.user.id },
            },
            select: { id: true, paymentStatus: true },
        });

        if (!campaign) return { success: false, error: "Campaign not found." };
        if (campaign.paymentStatus === "PAID") {
            return { success: false, error: "Paid campaigns cannot be edited." };
        }

        const budget = parseNumber(formData.get("budget"), 0);
        if (budget < MICRO_FOLLOWER_MIN) {
            return { success: false, error: "Budget must be at least â‚¹10,000." };
        }

        const engagementMin = Math.max(0, parseNumber(formData.get("engagementMin"), DEFAULT_ENGAGEMENT_MIN));
        const engagementMax = Math.max(engagementMin, parseNumber(formData.get("engagementMax"), DEFAULT_ENGAGEMENT_MAX));

        await db.campaign.update({
            where: { id: campaign.id },
            data: {
                title: String(formData.get("title") || "").trim() || "Updated Campaign",
                description: String(formData.get("description") || "").trim() || null,
                requirements: String(formData.get("requirements") || "").trim() || null,
                budget,
                niche: String(formData.get("niche") || "").trim() || null,
                location: String(formData.get("location") || "").trim() || null,
                platform: String(formData.get("platform") || "").trim() || null,
                engagementMin,
                engagementMax,
                influencerType: "MICRO",
                minFollowers: MICRO_FOLLOWER_MIN,
                startDate: parseDate(formData.get("startDate")),
                endDate: parseDate(formData.get("endDate")),
            },
        });

        await db.campaignCandidate.deleteMany({
            where: {
                campaignId: campaign.id,
                brandDecision: "PENDING",
                creatorDecision: "PENDING",
            },
        });

        await ensureCampaignSuggestions(campaign.id, session.user.id);
        revalidatePath(`/brand/campaigns/${campaign.id}/match`);
        return { success: true, campaignId: campaign.id };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update campaign" };
    }
}

export async function getCampaignMatchState(campaignId: string) {
    const session = await requireBrandSession();
    await ensureCampaignSuggestions(campaignId, session.user.id);

    const campaign = await db.campaign.findFirst({
        where: {
            id: campaignId,
            brand: { userId: session.user.id },
        },
        include: {
            candidates: {
                include: {
                    influencer: {
                        include: {
                            user: { select: { id: true, name: true, image: true } },
                        },
                    },
                },
                orderBy: [{ brandDecision: "asc" }, { matchScore: "desc" }, { createdAt: "desc" }],
            },
        },
    });

    if (!campaign) {
        return { success: false, error: "Campaign not found" };
    }

    const summary = summarizeCampaignFlow(campaign);

    const matches = campaign.candidates.map((candidate) => ({
        id: candidate.id,
        brandDecision: candidate.brandDecision,
        creatorDecision: candidate.creatorDecision,
        status: candidate.status,
        shuffleCount: candidate.shuffleCount,
        matchScore: candidate.matchScore,
        qualityScore: candidate.qualityScore,
        fakeEngagementFlag: candidate.fakeEngagementFlag,
        followerCount: candidate.influencer.followers,
        engagementRate: candidate.influencer.engagementRate,
        niche: candidate.influencer.niche,
        location: candidate.influencer.location,
        platforms: candidate.influencer.platforms,
        name: candidate.influencer.user?.name || "Creator",
        image: candidate.influencer.user?.image || null,
    }));

    return {
        success: true,
        campaign: {
            id: campaign.id,
            title: campaign.title,
            budget: campaign.budget || 0,
            paymentStatus: campaign.paymentStatus,
            status: campaign.status,
            niche: campaign.niche,
            location: campaign.location,
            platform: campaign.platform,
            engagementMin: campaign.engagementMin ?? DEFAULT_ENGAGEMENT_MIN,
            engagementMax: campaign.engagementMax ?? DEFAULT_ENGAGEMENT_MAX,
        },
        summary,
        matches,
    };
}

export async function decideCampaignMatch(campaignId: string, candidateId: string, decision: "ACCEPT" | "REJECT") {
    const session = await requireBrandSession();

    const candidate = await db.campaignCandidate.findFirst({
        where: {
            id: candidateId,
            campaignId,
            campaign: { brand: { userId: session.user.id } },
        },
        include: {
            campaign: { select: { id: true, paymentStatus: true } },
        },
    });

    if (!candidate) return { success: false, error: "Match not found." };
    if (candidate.campaign.paymentStatus === "PAID") {
        return { success: false, error: "Campaign is already paid and locked." };
    }

    if (decision === "ACCEPT") {
        await db.campaignCandidate.update({
            where: { id: candidate.id },
            data: {
                brandDecision: "ACCEPTED",
                status: "IN_NEGOTIATION",
            },
        });
    } else {
        await db.campaignCandidate.update({
            where: { id: candidate.id },
            data: {
                brandDecision: "REJECTED",
                status: "REJECTED",
                shuffleCount: { increment: 1 },
            },
        });
        await ensureCampaignSuggestions(campaignId, session.user.id);
    }

    revalidatePath(`/brand/campaigns/${campaignId}/match`);
    return { success: true };
}

export async function activateCampaignPayment(campaignId: string) {
    const session = await requireBrandSession();

    const campaign = await db.campaign.findFirst({
        where: {
            id: campaignId,
            brand: { userId: session.user.id },
        },
        include: {
            candidates: {
                where: { brandDecision: "ACCEPTED" },
                include: {
                    influencer: { select: { id: true, userId: true, followers: true } },
                },
            },
            brand: { select: { userId: true, companyName: true } },
        },
    });

    if (!campaign) return { success: false, error: "Campaign not found." };
    if (!campaign.candidates.length) {
        return { success: false, error: "Accept at least one influencer before payment." };
    }

    await db.$transaction(async (tx) => {
        await tx.campaign.update({
            where: { id: campaign.id },
            data: {
                paymentStatus: "PAID",
                paidAt: new Date(),
                status: "ACTIVE",
                paymentType: "UPFRONT",
            },
        });

        await tx.campaignCandidate.updateMany({
            where: {
                campaignId: campaign.id,
                brandDecision: "ACCEPTED",
            },
            data: {
                creatorDecision: "PENDING",
                status: "CONTACTED",
                managerReviewStatus: "PENDING",
            },
        });

        const assignment = await assignManagerIfMissing(campaign.id);

        if (assignment?.managerId) {
            await tx.notification.create({
                data: {
                    userId: assignment.managerId,
                    type: "CAMPAIGN_ASSIGNMENT",
                    title: "New campaign assigned",
                    message: `${campaign.brand.companyName} campaign is paid and ready for execution.`,
                    link: `/manager/campaigns/${campaign.id}`,
                },
            });
        }

        await tx.notification.create({
            data: {
                userId: campaign.brand.userId,
                type: "PAYMENT",
                title: "Campaign payment confirmed",
                message: "Your campaign is now active and assigned to a project manager.",
                link: `/brand/campaigns/${campaign.id}`,
            },
        });

        for (const candidate of campaign.candidates) {
            if (!candidate.influencer.userId) continue;
            await tx.notification.create({
                data: {
                    userId: candidate.influencer.userId,
                    type: "CAMPAIGN_INVITATION",
                    title: "New campaign invitation",
                    message: `You have a paid campaign invitation to review and accept.`,
                    link: `/creator/campaigns`,
                },
            });
        }
    });

    revalidatePath(`/brand/campaigns/${campaign.id}`);
    revalidatePath(`/brand/campaigns/${campaign.id}/payment`);
    revalidatePath(`/creator/campaigns`);
    revalidatePath(`/manager/campaigns`);
    return { success: true };
}

