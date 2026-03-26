"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    FOLLOWER_RANGE_PREFIX,
    DEFAULT_ENGAGEMENT_MAX,
    DEFAULT_ENGAGEMENT_MIN,
    MICRO_FOLLOWER_MIN,
    assignManagerIfMissing,
    calculateInternalPricing,
    ensureCampaignSuggestions,
    parseFollowerRangeWindow,
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

const CREATOR_RESPONSE_WINDOW_HOURS = 24;

function parseFollowerBand(formData: FormData) {
    const followerMin = Math.max(0, parseNumber(formData.get("followerMin"), 10_000));
    const followerMax = Math.max(followerMin, parseNumber(formData.get("followerMax"), Math.max(followerMin, 20_000)));
    const influencerType = `${FOLLOWER_RANGE_PREFIX}${followerMin}_${followerMax}`;
    return {
        followerMin,
        followerMax,
        targetFollowers: followerMax,
        influencerType,
    };
}

function getTargetCreatorCount(budget: number, targetFollowers: number) {
    const safeBudget = Math.max(0, Math.floor(Number(budget || 0)));
    const safeTarget = Math.max(1_000, Math.floor(Number(targetFollowers || MICRO_FOLLOWER_MIN)));
    if (!safeBudget || safeBudget < safeTarget) return 0;
    return Math.max(1, Math.floor(safeBudget / safeTarget));
}

function olderThanHours(date: Date, hours: number) {
    return date.getTime() <= Date.now() - hours * 60 * 60 * 1000;
}

async function getCampaignForPaidQueue(campaignId: string, brandUserId: string) {
    return db.campaign.findFirst({
        where: {
            id: campaignId,
            brand: { userId: brandUserId },
        },
        include: {
            brand: {
                select: {
                    userId: true,
                    companyName: true,
                },
            },
            candidates: {
                include: {
                    influencer: {
                        select: {
                            id: true,
                            userId: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            assignment: {
                select: { managerId: true },
            },
        },
    });
}

async function getReplacementInfluencerProfile(args: {
    campaign: NonNullable<Awaited<ReturnType<typeof getCampaignForPaidQueue>>>;
    excludeInfluencerIds: string[];
}) {
    const { campaign, excludeInfluencerIds } = args;
    const followerRange = parseFollowerRangeWindow(campaign.influencerType, campaign.minFollowers);

    return db.influencerProfile.findFirst({
        where: {
            id: { notIn: excludeInfluencerIds },
            followers: {
                gte: followerRange.min,
                lte: followerRange.max,
            },
            ...(campaign.niche ? { niche: { contains: campaign.niche } } : {}),
            ...(campaign.location ? { location: { contains: campaign.location } } : {}),
            ...(campaign.platform ? { platforms: { contains: campaign.platform } } : {}),
            engagementRate: {
                gte: Math.max(0, (campaign.engagementMin ?? DEFAULT_ENGAGEMENT_MIN) - 2),
                lte: (campaign.engagementMax ?? DEFAULT_ENGAGEMENT_MAX) + 5,
            },
        },
        orderBy: [
            { engagementRate: "desc" },
            { followers: "desc" },
        ],
    });
}

async function ensureBrandManagerThread(args: {
    campaignId: string;
    brandUserId: string;
    managerId: string;
}) {
    const { campaignId, brandUserId, managerId } = args;
    const threadKey = `campaign:${campaignId}:brand-manager`;

    const existing = await db.chatThread.findFirst({
        where: {
            initiatedBy: threadKey,
            participants: { contains: brandUserId },
        },
        select: { id: true },
    });

    if (existing) return existing.id;

    const created = await db.chatThread.create({
        data: {
            candidateId: null,
            participants: `${brandUserId},${managerId}`,
            initiatedBy: threadKey,
        },
        select: { id: true },
    });

    await db.message.create({
        data: {
            threadId: created.id,
            senderId: managerId,
            content: "Campaign activated. Share updates here and I will coordinate with creators separately.",
            status: "SENT",
        },
    });

    return created.id;
}

async function ensureManagerCreatorThread(args: {
    candidateId: string;
    managerId: string;
    creatorUserId: string;
}) {
    const { candidateId, managerId, creatorUserId } = args;

    const existing = await db.chatThread.findUnique({
        where: { candidateId },
        select: { id: true },
    });
    if (existing) return existing.id;

    const created = await db.chatThread.create({
        data: {
            candidateId,
            participants: `${managerId},${creatorUserId}`,
            initiatedBy: `candidate:${candidateId}:manager-creator`,
        },
        select: { id: true },
    });

    await db.message.create({
        data: {
            threadId: created.id,
            senderId: managerId,
            content: "Hi! I am your project manager. Share updates here, and I will handle brand communication.",
            status: "SENT",
        },
    });

    return created.id;
}

async function refreshPaidCampaignQueue(campaignId: string, brandUserId: string) {
    const campaign = await getCampaignForPaidQueue(campaignId, brandUserId);
    if (!campaign || campaign.paymentStatus !== "PAID") {
        return { expiredCount: 0, createdCount: 0, targetCreatorCount: 0 };
    }

    const followerRange = parseFollowerRangeWindow(campaign.influencerType, campaign.minFollowers);
    const targetCreatorCount = getTargetCreatorCount(campaign.budget || 0, followerRange.targetFollowers);
    if (!targetCreatorCount) {
        return { expiredCount: 0, createdCount: 0, targetCreatorCount };
    }

    const stalePending = campaign.candidates.filter(
        (candidate) =>
            candidate.brandDecision === "ACCEPTED" &&
            candidate.creatorDecision === "PENDING" &&
            olderThanHours(candidate.updatedAt, CREATOR_RESPONSE_WINDOW_HOURS)
    );

    if (stalePending.length > 0) {
        await Promise.all(
            stalePending.map((candidate) =>
                db.campaignCandidate.update({
                    where: { id: candidate.id },
                    data: {
                        brandDecision: "SHUFFLED",
                        creatorDecision: "EXPIRED",
                        status: "REJECTED",
                        managerReviewStatus: "PENDING",
                        managerReviewNotes: "Auto-shuffled after 24h without creator response.",
                        shuffleCount: { increment: 1 },
                    },
                })
            )
        );
    }

    const refreshedCampaign = await getCampaignForPaidQueue(campaignId, brandUserId);
    if (!refreshedCampaign) {
        return { expiredCount: stalePending.length, createdCount: 0, targetCreatorCount };
    }

    let activeSlots = refreshedCampaign.candidates.filter(
        (candidate) =>
            candidate.brandDecision === "ACCEPTED" &&
            ["PENDING", "ACCEPTED"].includes(candidate.creatorDecision || "")
    ).length;
    let createdCount = 0;
    const exclusions = new Set(refreshedCampaign.candidates.map((candidate) => candidate.influencerId));

    while (activeSlots < targetCreatorCount) {
        const replacement = await getReplacementInfluencerProfile({
            campaign: refreshedCampaign,
            excludeInfluencerIds: [...exclusions],
        });

        if (!replacement) {
            break;
        }

        const pricing = calculateInternalPricing(replacement.followers || 0);
        const newCandidate = await db.campaignCandidate.create({
            data: {
                campaignId: refreshedCampaign.id,
                influencerId: replacement.id,
                status: "CONTACTED",
                brandDecision: "ACCEPTED",
                creatorDecision: "PENDING",
                shuffleCount: 0,
                matchScore: replacement.engagementRate || 0,
                qualityScore: replacement.engagementRate || 0,
                fakeEngagementFlag: false,
                estimatedBrandCharge: pricing.brandCharge,
                estimatedCreatorPayout: pricing.creatorPayout,
                managerReviewStatus: "PENDING",
                notes: JSON.stringify({
                    reason: "PAID_QUEUE_TOP_UP",
                }),
            },
            include: {
                influencer: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (newCandidate.influencer.userId) {
            await db.notification.create({
                data: {
                    userId: newCandidate.influencer.userId,
                    type: "CAMPAIGN_INVITATION",
                    title: "New paid campaign invitation",
                    message: `You have 24 hours to accept "${refreshedCampaign.title}".`,
                    link: "/creator/campaigns",
                },
            });
        }

        if (refreshedCampaign.assignment?.managerId && newCandidate.influencer.userId) {
            await ensureManagerCreatorThread({
                candidateId: newCandidate.id,
                managerId: refreshedCampaign.assignment.managerId,
                creatorUserId: newCandidate.influencer.userId,
            });
        }

        exclusions.add(replacement.id);
        activeSlots += 1;
        createdCount += 1;
    }

    return {
        expiredCount: stalePending.length,
        createdCount,
        targetCreatorCount,
    };
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
        const followerBand = parseFollowerBand(formData);
        if (budget < followerBand.targetFollowers) {
            return {
                success: false,
                error: `Budget must be at least Rs.${followerBand.targetFollowers.toLocaleString()} for selected follower band.`,
            };
        }

        const title = String(formData.get("title") || "").trim() || "New Campaign";
        const description = String(formData.get("description") || "").trim();
        const requirements = String(formData.get("requirements") || "").trim();
        const niche = String(formData.get("niche") || "").trim() || null;
        const location = String(formData.get("location") || "").trim() || null;
        const platform = String(formData.get("platform") || "").trim() || null;
        const influencerType = followerBand.influencerType;
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
                minFollowers: followerBand.targetFollowers,
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
        const followerBand = parseFollowerBand(formData);
        if (budget < followerBand.targetFollowers) {
            return {
                success: false,
                error: `Budget must be at least Rs.${followerBand.targetFollowers.toLocaleString()} for selected follower band.`,
            };
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
                influencerType: followerBand.influencerType,
                minFollowers: followerBand.targetFollowers,
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
    const campaignHeader = await db.campaign.findFirst({
        where: {
            id: campaignId,
            brand: { userId: session.user.id },
        },
        select: {
            id: true,
            paymentStatus: true,
        },
    });

    if (!campaignHeader) {
        return { success: false, error: "Campaign not found" };
    }

    if (campaignHeader.paymentStatus === "PAID") {
        await refreshPaidCampaignQueue(campaignId, session.user.id);
    } else {
        await ensureCampaignSuggestions(campaignId, session.user.id);
    }

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
    const followerRange = parseFollowerRangeWindow(campaign.influencerType, campaign.minFollowers);
    const targetCreatorCount = getTargetCreatorCount(campaign.budget || 0, followerRange.targetFollowers);

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
            followerMin: followerRange.min,
            followerMax: followerRange.max,
            followerLabel: `${Math.floor(followerRange.min / 1000)}K-${Math.floor(followerRange.max / 1000)}K`,
            engagementMin: campaign.engagementMin ?? DEFAULT_ENGAGEMENT_MIN,
            engagementMax: campaign.engagementMax ?? DEFAULT_ENGAGEMENT_MAX,
        },
        summary: {
            ...summary,
            targetCreatorCount,
        },
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

export async function shuffleAcceptedCampaignInfluencer(campaignId: string, candidateId: string) {
    const session = await requireBrandSession();

    const candidate = await db.campaignCandidate.findFirst({
        where: {
            id: candidateId,
            campaignId,
            campaign: { brand: { userId: session.user.id } },
        },
        include: {
            campaign: {
                select: {
                    id: true,
                    title: true,
                    paymentStatus: true,
                    assignment: { select: { managerId: true } },
                    brand: { select: { userId: true } },
                },
            },
            influencer: {
                select: {
                    id: true,
                    userId: true,
                    user: { select: { name: true } },
                },
            },
        },
    });

    if (!candidate) return { success: false, error: "Creator not found for shuffle." };
    if (candidate.campaign.paymentStatus !== "PAID") {
        return { success: false, error: "Shuffle after payment is available once campaign is paid." };
    }
    if (candidate.brandDecision !== "ACCEPTED") {
        return { success: false, error: "Only accepted creators can be shuffled." };
    }

    await db.campaignCandidate.update({
        where: { id: candidate.id },
        data: {
            brandDecision: "SHUFFLED",
            creatorDecision: "DECLINED",
            status: "REJECTED",
            managerReviewStatus: "PENDING",
            managerReviewNotes: "Replaced by brand shuffle request.",
            shuffleCount: { increment: 1 },
        },
    });

    if (candidate.influencer.userId) {
        await db.notification.create({
            data: {
                userId: candidate.influencer.userId,
                type: "CAMPAIGN_UPDATE",
                title: "Campaign assignment reshuffled",
                message: `"${candidate.campaign.title}" assignment has been rotated by brand.`,
                link: "/creator/campaigns",
            },
        });
    }

    if (candidate.campaign.assignment?.managerId) {
        await db.notification.create({
            data: {
                userId: candidate.campaign.assignment.managerId,
                type: "CAMPAIGN_UPDATE",
                title: "Creator shuffled",
                message: `${candidate.influencer.user?.name || "Creator"} was shuffled out. Finding replacement now.`,
                link: `/manager/campaigns/${candidate.campaign.id}`,
            },
        });
    }

    await refreshPaidCampaignQueue(campaignId, session.user.id);

    revalidatePath(`/brand/campaigns/${campaignId}/match`);
    revalidatePath(`/brand/campaigns/${campaignId}`);
    revalidatePath(`/creator/campaigns`);
    revalidatePath(`/manager/campaigns/${campaignId}`);
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
    const followerRange = parseFollowerRangeWindow(campaign.influencerType, campaign.minFollowers);
    const targetCreatorCount = getTargetCreatorCount(campaign.budget || 0, followerRange.targetFollowers);
    if (targetCreatorCount > 0 && campaign.candidates.length < targetCreatorCount) {
        return {
            success: false,
            error: `Accept at least ${targetCreatorCount} creators before payment for this follower target.`,
        };
    }

    let managerId: string | null = null;

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
        managerId = assignment?.managerId || null;

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

    if (managerId) {
        await ensureBrandManagerThread({
            campaignId: campaign.id,
            brandUserId: campaign.brand.userId,
            managerId,
        });

        for (const candidate of campaign.candidates) {
            if (!candidate.influencer.userId) continue;
            await ensureManagerCreatorThread({
                candidateId: candidate.id,
                managerId,
                creatorUserId: candidate.influencer.userId,
            });
        }
    }

    await refreshPaidCampaignQueue(campaign.id, session.user.id);

    revalidatePath(`/brand/campaigns/${campaign.id}`);
    revalidatePath(`/brand/campaigns/${campaign.id}/match`);
    revalidatePath(`/brand/campaigns/${campaign.id}/payment`);
    revalidatePath(`/creator/campaigns`);
    revalidatePath(`/manager/campaigns`);
    return { success: true };
}

export async function getBrandManagerConversation(campaignId: string) {
    const session = await requireBrandSession();

    const campaign = await db.campaign.findFirst({
        where: {
            id: campaignId,
            brand: { userId: session.user.id },
        },
        select: {
            id: true,
            paymentStatus: true,
            brand: { select: { userId: true } },
            assignment: {
                select: {
                    managerId: true,
                    manager: { select: { id: true, name: true } },
                },
            },
        },
    });

    if (!campaign) return { success: false, error: "Campaign not found." };
    if (campaign.paymentStatus !== "PAID") {
        return {
            success: true,
            locked: true,
            managerName: campaign.assignment?.manager?.name || "Project Manager",
            messages: [],
        };
    }
    if (!campaign.assignment?.managerId) {
        return { success: false, error: "Manager is not assigned yet." };
    }

    const threadId = await ensureBrandManagerThread({
        campaignId: campaign.id,
        brandUserId: campaign.brand.userId,
        managerId: campaign.assignment.managerId,
    });

    const messages = await db.message.findMany({
        where: { threadId },
        include: {
            sender: {
                select: { id: true, name: true },
            },
        },
        orderBy: { createdAt: "asc" },
        take: 150,
    });

    return {
        success: true,
        locked: false,
        threadId,
        managerName: campaign.assignment.manager?.name || "Project Manager",
        messages: messages.map((message) => ({
            id: message.id,
            content: message.content || "",
            createdAt: message.createdAt.toISOString(),
            senderId: message.senderId,
            senderName: message.sender.name || "User",
            isMe: message.senderId === session.user.id,
        })),
    };
}

export async function sendBrandManagerConversationMessage(campaignId: string, content: string) {
    const session = await requireBrandSession();
    const trimmed = String(content || "").trim();
    if (!trimmed) return { success: false, error: "Message is required." };

    const campaign = await db.campaign.findFirst({
        where: {
            id: campaignId,
            brand: { userId: session.user.id },
        },
        select: {
            id: true,
            paymentStatus: true,
            title: true,
            brand: { select: { userId: true } },
            assignment: { select: { managerId: true } },
        },
    });

    if (!campaign) return { success: false, error: "Campaign not found." };
    if (campaign.paymentStatus !== "PAID") {
        return { success: false, error: "Chat starts after payment confirmation." };
    }
    if (!campaign.assignment?.managerId) {
        return { success: false, error: "Manager is not assigned yet." };
    }

    const threadId = await ensureBrandManagerThread({
        campaignId: campaign.id,
        brandUserId: campaign.brand.userId,
        managerId: campaign.assignment.managerId,
    });

    await db.message.create({
        data: {
            threadId,
            senderId: session.user.id,
            content: trimmed,
            status: "SENT",
        },
    });

    await db.notification.create({
        data: {
            userId: campaign.assignment.managerId,
            type: "MESSAGE",
            title: "New brand message",
            message: `Brand sent an update for ${campaign.title}.`,
            link: `/manager/campaigns/${campaign.id}`,
        },
    });

    revalidatePath(`/brand/campaigns/${campaign.id}`);
    revalidatePath(`/manager/campaigns/${campaign.id}`);
    return { success: true };
}

export async function refillPaidCampaignInvitations(campaignId: string) {
    const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: {
            id: true,
            brand: { select: { userId: true } },
        },
    });

    if (!campaign) return { success: false, error: "Campaign not found." };
    await refreshPaidCampaignQueue(campaign.id, campaign.brand.userId);
    return { success: true };
}


