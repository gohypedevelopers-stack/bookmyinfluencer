import { Prisma } from "@prisma/client";
import { db, DEFAULT_TX_OPTIONS } from "@/lib/db";
import { getMatchedInfluencers, normalizeCategory } from "@/services/influencerMatcher";

export const REQUEST_EXPIRY_HOURS = 24;
export const REQUEST_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    EXPIRED: "expired",
    ARCHIVED: "archived",
};

function addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function serializeDate(value) {
    return value ? value.toISOString() : null;
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function formatFollowers(value) {
    const amount = Number(value || 0);

    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    }

    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K`;
    }

    return `${amount}`;
}

function buildCountSummary(requests) {
    return requests.reduce(
        (summary, request) => {
            summary[request.status] = (summary[request.status] || 0) + 1;
            return summary;
        },
        {
            [REQUEST_STATUS.PENDING]: 0,
            [REQUEST_STATUS.ACCEPTED]: 0,
            [REQUEST_STATUS.REJECTED]: 0,
            [REQUEST_STATUS.EXPIRED]: 0,
            [REQUEST_STATUS.ARCHIVED]: 0,
        },
    );
}

function mapRequest(request) {
    return {
        id: request.id,
        status: request.status,
        sentAt: serializeDate(request.sentAt),
        expiresAt: serializeDate(request.expiresAt),
        respondedAt: serializeDate(request.respondedAt),
        acceptedAt: serializeDate(request.acceptedAt),
        expiredAt: serializeDate(request.expiredAt),
        archivedAt: serializeDate(request.archivedAt),
        rejectionReason: request.rejectionReason || null,
        influencer: {
            id: request.influencer.id,
            displayName: request.influencer.displayName,
            category: request.influencer.category || "general",
            followersCount: request.influencer.followersCount,
            followersLabel: formatFollowers(request.influencer.followersCount),
            engagementRate: Number(request.influencer.engagementRate || 0),
            profileImageUrl: request.influencer.profileImageUrl || null,
            platforms: request.influencer.platforms || null,
        },
    };
}

async function getCampaignWithRequests(campaignId) {
    return db.brandCampaign.findUnique({
        where: { id: campaignId },
        include: {
            requests: {
                include: {
                    influencer: true,
                },
                orderBy: {
                    sentAt: "desc",
                },
            },
        },
    });
}

async function getPendingRequestForUpdate(requestId) {
    const request = await db.collaborationRequest.findUnique({
        where: { id: requestId },
        select: {
            id: true,
            campaignId: true,
            status: true,
        },
    });

    if (!request) {
        throw new Error(`Collaboration request ${requestId} not found`);
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
        throw new Error(`Collaboration request ${requestId} is already ${request.status}`);
    }

    return request;
}

export async function topUpCollaborationRequests(campaignId) {
    const campaign = await db.brandCampaign.findUnique({
        where: { id: campaignId },
        include: {
            requests: {
                select: {
                    influencerId: true,
                    status: true,
                },
            },
        },
    });

    if (!campaign) {
        throw new Error(`Brand campaign ${campaignId} not found`);
    }

    const acceptedCount = campaign.requests.filter((request) => request.status === REQUEST_STATUS.ACCEPTED).length;
    const pendingCount = campaign.requests.filter((request) => request.status === REQUEST_STATUS.PENDING).length;
    const remainingAcceptedSlots = Math.max(campaign.targetAcceptedCount - acceptedCount, 0);
    const desiredPendingCount = Math.min(campaign.activeRequestLimit, remainingAcceptedSlots);
    const requestCountToCreate = Math.max(desiredPendingCount - pendingCount, 0);

    if (!requestCountToCreate) {
        if (!campaign.matchingTriggeredAt) {
            await db.brandCampaign.update({
                where: { id: campaignId },
                data: {
                    matchingTriggeredAt: new Date(),
                },
            });
        }

        return {
            createdCount: 0,
            pendingCount,
            acceptedCount,
        };
    }

    const sentAt = new Date();

    const matchedInfluencers = await getMatchedInfluencers({
        category: campaign.categoryLabel || campaign.category,
        minFollowers: campaign.minFollowers,
        maxFollowers: campaign.maxFollowers,
        limit: requestCountToCreate,
        excludeInfluencerIds: campaign.requests.map((request) => request.influencerId),
    });

    if (!matchedInfluencers.length) {
        await db.brandCampaign.update({
            where: { id: campaignId },
            data: {
                matchingTriggeredAt: sentAt,
            },
        });

        return {
            createdCount: 0,
            pendingCount,
            acceptedCount,
        };
    }
    const expiresAt = addHours(sentAt, REQUEST_EXPIRY_HOURS);
    let createdCount = 0;

    for (const influencer of matchedInfluencers) {
        try {
            await db.collaborationRequest.create({
                data: {
                    campaignId,
                    influencerId: influencer.id,
                    status: REQUEST_STATUS.PENDING,
                    sentAt,
                    expiresAt,
                },
            });
            createdCount += 1;
        } catch (error) {
            if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
                throw error;
            }
        }
    }

    await db.brandCampaign.update({
        where: { id: campaignId },
        data: {
            matchingTriggeredAt: sentAt,
        },
    });

    return {
        createdCount,
        pendingCount: pendingCount + createdCount,
        acceptedCount,
    };
}

function buildWorkflowSummaryFromCampaign(campaign) {
    const counts = buildCountSummary(campaign.requests);

    return {
        campaign: {
            id: campaign.id,
            title: campaign.title || "Brand Campaign",
            summary: campaign.summary || "",
            totalBudget: Number(campaign.totalBudget || 0),
            totalBudgetLabel: formatCurrency(campaign.totalBudget),
            category: campaign.category,
            categoryLabel: campaign.categoryLabel || campaign.category,
            minFollowers: campaign.minFollowers,
            maxFollowers: campaign.maxFollowers,
            followerRangeLabel: `${formatFollowers(campaign.minFollowers)} - ${formatFollowers(campaign.maxFollowers)}`,
            status: campaign.status,
            targetAcceptedCount: campaign.targetAcceptedCount,
            activeRequestLimit: campaign.activeRequestLimit,
            createdAt: serializeDate(campaign.createdAt),
            matchingTriggeredAt: serializeDate(campaign.matchingTriggeredAt),
        },
        counts: {
            ...counts,
            sent: campaign.requests.length,
            remainingAcceptedSlots: Math.max(campaign.targetAcceptedCount - counts[REQUEST_STATUS.ACCEPTED], 0),
        },
        sentRequests: campaign.requests.map(mapRequest),
        acceptedInfluencers: campaign.requests
            .filter((request) => request.status === REQUEST_STATUS.ACCEPTED)
            .map((request) => mapRequest(request).influencer),
    };
}

export async function getBrandCampaignWorkflowSummary(campaignId) {
    const campaign = await getCampaignWithRequests(campaignId);
    if (!campaign) {
        throw new Error(`Brand campaign ${campaignId} not found`);
    }

    return buildWorkflowSummaryFromCampaign(campaign);
}

export async function getBrandCampaignQueueDashboard(userId) {
    const brand = await db.brandProfile.findUnique({
        where: { userId },
        select: {
            id: true,
            companyName: true,
            brandCampaigns: {
                include: {
                    requests: {
                        include: {
                            influencer: true,
                        },
                        orderBy: {
                            sentAt: "desc",
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!brand) {
        throw new Error(`Brand profile for user ${userId} not found`);
    }

    const campaignIdsNeedingCoverage = brand.brandCampaigns
        .filter((campaign) => String(campaign.status || "").toLowerCase() === "active")
        .map((campaign) => {
            const counts = buildCountSummary(campaign.requests);
            const acceptedCount = counts[REQUEST_STATUS.ACCEPTED] || 0;
            const pendingCount = counts[REQUEST_STATUS.PENDING] || 0;
            const remainingAcceptedSlots = Math.max(campaign.targetAcceptedCount - acceptedCount, 0);
            const desiredPendingCount = Math.min(campaign.activeRequestLimit, remainingAcceptedSlots);
            return pendingCount < desiredPendingCount ? campaign.id : null;
        })
        .filter(Boolean);

    if (campaignIdsNeedingCoverage.length > 0) {
        for (const campaignId of campaignIdsNeedingCoverage) {
            await topUpCollaborationRequests(campaignId);
        }
    }

    const refreshedBrand =
        campaignIdsNeedingCoverage.length > 0
            ? await db.brandProfile.findUnique({
                where: { userId },
                select: {
                    id: true,
                    companyName: true,
                    brandCampaigns: {
                        include: {
                            requests: {
                                include: {
                                    influencer: true,
                                },
                                orderBy: {
                                    sentAt: "desc",
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            })
            : brand;

    const sourceBrand = refreshedBrand || brand;
    const campaigns = sourceBrand.brandCampaigns.map(buildWorkflowSummaryFromCampaign);
    const totals = campaigns.reduce(
        (summary, campaign) => {
            summary.campaigns += 1;
            summary.sent += campaign.counts.sent;
            summary.pending += campaign.counts.pending;
            summary.accepted += campaign.counts.accepted;
            summary.expired += campaign.counts.expired;
            summary.rejected += campaign.counts.rejected;
            summary.remainingAcceptedSlots += campaign.counts.remainingAcceptedSlots;
            return summary;
        },
        {
            campaigns: 0,
            sent: 0,
            pending: 0,
            accepted: 0,
            expired: 0,
            rejected: 0,
            remainingAcceptedSlots: 0,
        },
    );

    return {
        brand: {
            id: sourceBrand.id,
            companyName: sourceBrand.companyName,
        },
        totals,
        campaigns,
    };
}

export async function createBrandCampaignWorkflow({
    brandId,
    totalBudget,
    category,
    minFollowers,
    maxFollowers,
    summary,
    title,
}) {
    const normalizedCategory = normalizeCategory(category);

    const campaign = await db.brandCampaign.create({
        data: {
            brandId,
            title: title || "Brand Campaign",
            summary: summary || null,
            totalBudget: Number(totalBudget || 0),
            category: normalizedCategory,
            categoryLabel: category || normalizedCategory,
            minFollowers: Math.max(0, Number(minFollowers || 0)),
            maxFollowers: Math.max(Number(maxFollowers || 0), Number(minFollowers || 0)),
            status: "active",
        },
    });

    await topUpCollaborationRequests(campaign.id);
    return getBrandCampaignWorkflowSummary(campaign.id);
}

export async function expirePendingRequestsAndRefill() {
    const now = new Date();
    const expiredRequests = await db.collaborationRequest.findMany({
        where: {
            status: REQUEST_STATUS.PENDING,
            expiresAt: {
                lte: now,
            },
        },
        select: {
            id: true,
            campaignId: true,
        },
    });

    if (!expiredRequests.length) {
        return {
            expiredCount: 0,
            refilledCampaignIds: [],
        };
    }

    await db.$transaction(
        expiredRequests.map((request) =>
            db.collaborationRequest.update({
                where: { id: request.id },
                data: {
                    status: REQUEST_STATUS.EXPIRED,
                    respondedAt: now,
                    expiredAt: now,
                    archivedAt: now,
                },
            }),
        ),
        DEFAULT_TX_OPTIONS
    );

    const refilledCampaignIds = [...new Set(expiredRequests.map((request) => request.campaignId))];
    for (const campaignId of refilledCampaignIds) {
        await topUpCollaborationRequests(campaignId);
    }

    return {
        expiredCount: expiredRequests.length,
        refilledCampaignIds,
    };
}

export async function acceptCollaborationRequest(requestId) {
    const request = await getPendingRequestForUpdate(requestId);
    const respondedAt = new Date();

    await db.collaborationRequest.update({
        where: { id: request.id },
        data: {
            status: REQUEST_STATUS.ACCEPTED,
            respondedAt,
            acceptedAt: respondedAt,
        },
    });

    return getBrandCampaignWorkflowSummary(request.campaignId);
}

export async function rejectCollaborationRequest(requestId, rejectionReason = "rejected_by_influencer") {
    const request = await getPendingRequestForUpdate(requestId);
    const respondedAt = new Date();

    await db.collaborationRequest.update({
        where: { id: request.id },
        data: {
            status: REQUEST_STATUS.REJECTED,
            respondedAt,
            archivedAt: respondedAt,
            rejectionReason,
        },
    });

    await topUpCollaborationRequests(request.campaignId);
    return getBrandCampaignWorkflowSummary(request.campaignId);
}
