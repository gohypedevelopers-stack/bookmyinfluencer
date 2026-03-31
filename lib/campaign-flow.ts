import { db } from "@/lib/db";

export const MICRO_FOLLOWER_MIN = 10_000;
export const MICRO_FOLLOWER_MAX = 500_000;
export const DEFAULT_ENGAGEMENT_MIN = 5;
export const DEFAULT_ENGAGEMENT_MAX = 10;
export const FOLLOWER_RANGE_PREFIX = "RANGE_";

export function calculateInternalPricing(followers: number) {
    const safeFollowers = Math.max(0, Math.floor(followers || 0));
    return {
        brandCharge: safeFollowers, // â‚¹1 per follower
        creatorPayout: Number((safeFollowers * 0.1).toFixed(2)), // 10% of followers
    };
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function stdDev(values: number[]) {
    if (!values.length) return 0;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
}

function formatArray(values: string[]) {
    return values.filter(Boolean).join(", ");
}

function desiredMatchCount(totalBudget: number, targetFollowersPerCreator: number) {
    const safeBudget = Math.max(0, Math.floor(totalBudget || 0));
    const safeTargetFollowers = Math.max(1_000, Math.floor(targetFollowersPerCreator || MICRO_FOLLOWER_MIN));
    if (!safeBudget || safeBudget < safeTargetFollowers) return 0;
    const maxByBudget = Math.floor(safeBudget / safeTargetFollowers);
    return clamp(maxByBudget, 1, 50);
}

export function parseFollowerRangeWindow(influencerType?: string | null, minFollowers?: number | null) {
    const typeValue = String(influencerType || "").trim();
    const rangeMatch = typeValue.match(/^RANGE_(\d+)_(\d+)$/i);
    if (rangeMatch) {
        const parsedMin = Number(rangeMatch[1] || 0);
        const parsedMax = Number(rangeMatch[2] || 0);
        const boundedMin = Math.max(MICRO_FOLLOWER_MIN, Math.min(parsedMin, parsedMax));
        const boundedMax = Math.min(
            MICRO_FOLLOWER_MAX,
            Math.max(boundedMin, Math.max(parsedMin, parsedMax))
        );
        return {
            min: boundedMin,
            max: boundedMax,
            targetFollowers: boundedMax > 0 ? boundedMax : Math.max(1_000, boundedMin),
        };
    }

    if (typeValue.toUpperCase() === "MACRO") {
        return {
            min: 100_000,
            max: 500_000,
            targetFollowers: 200_000,
        };
    }

    if (typeValue.toUpperCase() === "MICRO") {
        return {
            min: 10_000,
            max: 100_000,
            targetFollowers: 10_000,
        };
    }

    const fallbackFollowers = clamp(
        Math.floor(Number(minFollowers || MICRO_FOLLOWER_MIN)),
        MICRO_FOLLOWER_MIN,
        MICRO_FOLLOWER_MAX
    );
    return {
        min: fallbackFollowers,
        max: MICRO_FOLLOWER_MAX,
        targetFollowers: fallbackFollowers,
    };
}

function evaluateQuality({
    engagementRate,
    engagementSeries,
}: {
    engagementRate: number;
    engagementSeries: number[];
}) {
    const safeEngagement = Math.max(0, engagementRate || 0);
    const avgEngagement = engagementSeries.length
        ? engagementSeries.reduce((sum, value) => sum + value, 0) / engagementSeries.length
        : safeEngagement;
    const deviation = stdDev(engagementSeries.length ? engagementSeries : [safeEngagement]);
    const volatilityRatio = avgEngagement > 0 ? deviation / avgEngagement : 1;

    const engagementPreference = clamp(1 - Math.abs(avgEngagement - 7.5) / 10, 0, 1);
    const consistency = clamp(1 - volatilityRatio, 0, 1);
    const suspicious =
        avgEngagement < 1 ||
        avgEngagement > 15 ||
        consistency < 0.35 ||
        safeEngagement <= 0;

    const qualityScore = clamp(
        engagementPreference * 55 + consistency * 35 + (suspicious ? -15 : 10),
        0,
        100
    );

    return {
        avgEngagement: Number(avgEngagement.toFixed(2)),
        consistency: Number(consistency.toFixed(2)),
        suspicious,
        qualityScore: Number(qualityScore.toFixed(2)),
    };
}

function scoreCandidate({
    qualityScore,
    campaignNiche,
    campaignLocation,
    campaignPlatform,
    profileNiche,
    profileLocation,
    profilePlatforms,
}: {
    qualityScore: number;
    campaignNiche?: string | null;
    campaignLocation?: string | null;
    campaignPlatform?: string | null;
    profileNiche?: string | null;
    profileLocation?: string | null;
    profilePlatforms?: string | null;
}) {
    const nicheMatch =
        campaignNiche && profileNiche
            ? profileNiche.toLowerCase().includes(campaignNiche.toLowerCase())
            : false;
    const locationMatch =
        campaignLocation && profileLocation
            ? profileLocation.toLowerCase().includes(campaignLocation.toLowerCase())
            : false;
    const platformMatch =
        campaignPlatform && profilePlatforms
            ? profilePlatforms.toLowerCase().includes(campaignPlatform.toLowerCase())
            : false;

    return Number(
        (
            qualityScore +
            (nicheMatch ? 10 : 0) +
            (locationMatch ? 8 : 0) +
            (platformMatch ? 8 : 0)
        ).toFixed(2)
    );
}

type CampaignWithCandidates = Awaited<
    ReturnType<typeof db.campaign.findUnique>
>;

async function getCampaignForBrand(campaignId: string, brandUserId: string) {
    return db.campaign.findFirst({
        where: {
            id: campaignId,
            brand: { userId: brandUserId },
        },
        include: {
            candidates: true,
        },
    });
}

async function buildRankedPool(campaign: NonNullable<CampaignWithCandidates>) {
    const engagementMin = campaign.engagementMin ?? DEFAULT_ENGAGEMENT_MIN;
    const engagementMax = campaign.engagementMax ?? DEFAULT_ENGAGEMENT_MAX;
    const followerRange = parseFollowerRangeWindow(campaign.influencerType, campaign.minFollowers);

    const baseProfiles = await db.influencerProfile.findMany({
        where: {
            followers: {
                gte: followerRange.min,
                lte: followerRange.max,
            },
            ...(campaign.niche
                ? { niche: { contains: campaign.niche } }
                : {}),
            ...(campaign.location
                ? { location: { contains: campaign.location } }
                : {}),
            ...(campaign.platform
                ? { platforms: { contains: campaign.platform } }
                : {}),
            engagementRate: {
                gte: Math.max(0, engagementMin - 2),
                lte: engagementMax + 5,
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                },
            },
        },
        take: 250,
    });

    const emails = baseProfiles.map((profile) => profile.user?.email).filter((email): email is string => Boolean(email));
    const creators = emails.length
        ? await db.creator.findMany({
            where: { email: { in: emails } },
            include: {
                metrics: { orderBy: { date: "desc" }, take: 6 },
                selfReportedMetrics: { orderBy: { updatedAt: "desc" }, take: 1 },
            },
        })
        : [];

    const creatorByEmail = new Map(creators.map((creator) => [creator.email?.toLowerCase() || "", creator]));

    return baseProfiles
        .map((profile) => {
            const email = profile.user?.email?.toLowerCase() || "";
            const creator = creatorByEmail.get(email);
            const engagementSeries = creator?.metrics?.map((metric) => metric.engagementRate).filter((value) => Number.isFinite(value)) || [];
            const quality = evaluateQuality({
                engagementRate: profile.engagementRate || creator?.metrics?.[0]?.engagementRate || 0,
                engagementSeries,
            });

            const pricing = calculateInternalPricing(profile.followers || 0);
            const matchScore = scoreCandidate({
                qualityScore: quality.qualityScore,
                campaignNiche: campaign.niche,
                campaignLocation: campaign.location,
                campaignPlatform: campaign.platform,
                profileNiche: profile.niche,
                profileLocation: profile.location,
                profilePlatforms: profile.platforms,
            });

            return {
                profile,
                matchScore,
                qualityScore: quality.qualityScore,
                suspicious: quality.suspicious,
                consistency: quality.consistency,
                avgEngagement: quality.avgEngagement,
                pricing,
                engagementRate: profile.engagementRate || quality.avgEngagement,
            };
        })
        .sort((left, right) => right.matchScore - left.matchScore);
}

export async function ensureCampaignSuggestions(campaignId: string, brandUserId: string) {
    const campaign = await getCampaignForBrand(campaignId, brandUserId);
    if (!campaign) {
        throw new Error("Campaign not found");
    }

    const followerRange = parseFollowerRangeWindow(campaign.influencerType, campaign.minFollowers);
    const targetCount = desiredMatchCount(campaign.budget || 0, followerRange.targetFollowers);
    if (targetCount <= 0) return;

    const activeCandidates = campaign.candidates.filter((candidate) =>
        ["PENDING", "ACCEPTED"].includes(candidate.brandDecision)
    );
    const missing = Math.max(0, targetCount - activeCandidates.length);
    if (!missing) return;

    const rankedPool = await buildRankedPool(campaign);
    const candidateByInfluencer = new Map(
        campaign.candidates.map((candidate) => [candidate.influencerId, candidate])
    );

    let remainingBudget = campaign.budget || 0;
    const acceptedSpend = campaign.candidates
        .filter((candidate) => candidate.brandDecision === "ACCEPTED")
        .reduce((sum, candidate) => sum + (candidate.estimatedBrandCharge || 0), 0);
    remainingBudget = Math.max(0, remainingBudget - acceptedSpend);

    const recordsToCreate: Array<{
        campaignId: string;
        influencerId: string;
        status: string;
        brandDecision: string;
        creatorDecision: string;
        shuffleCount: number;
        matchScore: number;
        qualityScore: number;
        fakeEngagementFlag: boolean;
        estimatedBrandCharge: number;
        estimatedCreatorPayout: number;
        managerReviewStatus: string;
        notes: string;
    }> = [];
    const recordsToRecycle: Array<{
        id: string;
        status: string;
        brandDecision: string;
        creatorDecision: string;
        matchScore: number;
        qualityScore: number;
        fakeEngagementFlag: boolean;
        estimatedBrandCharge: number;
        estimatedCreatorPayout: number;
        managerReviewStatus: string;
        notes: string;
    }> = [];
    const recycledCandidateIds = new Set<string>();

    for (const candidate of rankedPool) {
        if (recordsToCreate.length + recordsToRecycle.length >= missing) break;
        if (remainingBudget < candidate.pricing.brandCharge) continue;

        const existing = candidateByInfluencer.get(candidate.profile.id);
        if (existing) {
            if (
                existing.brandDecision === "REJECTED" &&
                !recycledCandidateIds.has(existing.id)
            ) {
                recordsToRecycle.push({
                    id: existing.id,
                    status: "CONTACTED",
                    brandDecision: "PENDING",
                    creatorDecision: "PENDING",
                    matchScore: candidate.matchScore,
                    qualityScore: candidate.qualityScore,
                    fakeEngagementFlag: candidate.suspicious,
                    estimatedBrandCharge: candidate.pricing.brandCharge,
                    estimatedCreatorPayout: candidate.pricing.creatorPayout,
                    managerReviewStatus: "PENDING",
                    notes: JSON.stringify({
                        reason: "AUTO_MATCH_RECYCLE",
                        avgEngagement: candidate.avgEngagement,
                        consistency: candidate.consistency,
                        engagementRate: candidate.engagementRate,
                    }),
                });
                recycledCandidateIds.add(existing.id);
                remainingBudget -= candidate.pricing.brandCharge;
            }
            continue;
        }

        recordsToCreate.push({
            campaignId: campaign.id,
            influencerId: candidate.profile.id,
            status: "CONTACTED",
            brandDecision: "PENDING",
            creatorDecision: "PENDING",
            shuffleCount: 0,
            matchScore: candidate.matchScore,
            qualityScore: candidate.qualityScore,
            fakeEngagementFlag: candidate.suspicious,
            estimatedBrandCharge: candidate.pricing.brandCharge,
            estimatedCreatorPayout: candidate.pricing.creatorPayout,
            managerReviewStatus: "PENDING",
            notes: JSON.stringify({
                reason: "AUTO_MATCH",
                avgEngagement: candidate.avgEngagement,
                consistency: candidate.consistency,
                engagementRate: candidate.engagementRate,
            }),
        });

        remainingBudget -= candidate.pricing.brandCharge;
    }

    if (recordsToCreate.length) {
        await db.campaignCandidate.createMany({ data: recordsToCreate });
    }
    if (recordsToRecycle.length) {
        await Promise.all(
            recordsToRecycle.map((record) =>
                db.campaignCandidate.update({
                    where: { id: record.id },
                    data: {
                        status: record.status,
                        brandDecision: record.brandDecision,
                        creatorDecision: record.creatorDecision,
                        matchScore: record.matchScore,
                        qualityScore: record.qualityScore,
                        fakeEngagementFlag: record.fakeEngagementFlag,
                        estimatedBrandCharge: record.estimatedBrandCharge,
                        estimatedCreatorPayout: record.estimatedCreatorPayout,
                        managerReviewStatus: record.managerReviewStatus,
                        notes: record.notes,
                    },
                })
            )
        );
    }
}

export async function assignManagerIfMissing(campaignId: string) {
    const existing = await db.campaignAssignment.findUnique({ where: { campaignId } });
    if (existing) return existing;

    const manager = await db.user.findFirst({
        where: {
            role: "MANAGER",
        },
        orderBy: { createdAt: "asc" },
    });

    if (!manager) return null;

    return db.campaignAssignment.create({
        data: {
            campaignId,
            managerId: manager.id,
        },
    });
}

export function summarizeCampaignFlow(campaign: {
    budget: number | null;
    candidates: Array<{
        brandDecision: string;
        estimatedBrandCharge: number;
        estimatedCreatorPayout: number;
    }>;
}) {
    const accepted = campaign.candidates.filter((candidate) => candidate.brandDecision === "ACCEPTED");
    const pending = campaign.candidates.filter((candidate) => candidate.brandDecision === "PENDING");
    const rejected = campaign.candidates.filter((candidate) => candidate.brandDecision === "REJECTED");
    const selectedSpend = accepted.reduce((sum, candidate) => sum + (candidate.estimatedBrandCharge || 0), 0);
    const estimatedPayout = accepted.reduce((sum, candidate) => sum + (candidate.estimatedCreatorPayout || 0), 0);

    return {
        acceptedCount: accepted.length,
        pendingCount: pending.length,
        rejectedCount: rejected.length,
        selectedSpend,
        estimatedPayout,
        remainingBudget: Math.max(0, (campaign.budget || 0) - selectedSpend),
    };
}

export function isMicroFollowerCount(count: number) {
    return count >= MICRO_FOLLOWER_MIN && count <= MICRO_FOLLOWER_MAX;
}

export function formatInternalPricingNote(followers: number) {
    const pricing = calculateInternalPricing(followers);
    return formatArray([
        `brand_charge=${pricing.brandCharge}`,
        `creator_payout=${pricing.creatorPayout}`,
    ]);
}

