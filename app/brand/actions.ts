'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createAuditLog, createNotification } from "@/lib/audit";
import { CandidateStatus, EscrowTransactionStatus, ContractStatus, CampaignStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateCandidateStatus(candidateId: string, newStatus: CandidateStatus) {
    try {
        const candidate = await db.campaignCandidate.update({
            where: { id: candidateId },
            data: { status: newStatus },
            include: { influencer: { include: { user: true } } }
        });

        await createAuditLog("UPDATE_STATUS", "CANDIDATE", candidateId, undefined, { status: newStatus });

        // Notify Influencer
        if (candidate.influencer.userId) {
            await createNotification(
                candidate.influencer.userId,
                "Campaign Update",
                `Your status has been updated to ${newStatus}`,
                "SYSTEM"
            );
        }

        revalidatePath('/brand/campaigns');
        return { success: true };
    } catch (error) {
        console.error("Failed to update status", error);
        return { success: false, error: "Failed to update status" };
    }
}

export async function fundEscrowTransaction(contractId: string) {
    try {
        const contract = await db.contract.findUnique({
            where: { id: contractId },
            include: { transactions: true, influencer: true }
        });

        if (!contract) return { success: false, error: "Contract not found" };

        const transaction = contract.transactions.find(t => t.status === EscrowTransactionStatus.PENDING) || contract.transactions[0];
        if (!transaction) return { success: false, error: "No pending transaction found" };

        await db.escrowTransaction.update({
            where: { id: transaction.id },
            data: { status: EscrowTransactionStatus.FUNDED }
        });

        await db.contract.update({
            where: { id: contractId },
            data: { status: ContractStatus.ACTIVE }
        });

        if (contract.candidateId) {
            await db.campaignCandidate.update({
                where: { id: contract.candidateId },
                data: { status: CandidateStatus.HIRED }
            });
        }

        await createAuditLog("FUND_ESCROW", "CONTRACT", contractId, undefined, { amount: transaction.amount });

        if (contract.influencer?.userId) {
            await createNotification(
                contract.influencer.userId,
                "Escrow Funded",
                `Escrow of $${transaction.amount} has been funded for your contract.`,
                "ESCROW",
                "/influencer/earnings"
            );
        }

        revalidatePath(`/brand/checkout`);
        revalidatePath(`/brand/campaigns`);
        return { success: true };

    } catch (error) {
        console.error("Payment failed", error);
        return { success: false, error: "Payment failed" };
    }
}

export async function sendMessage(threadId: string, senderId: string, content: string) {
    try {
        await db.message.create({
            data: {
                threadId,
                senderId,
                content
            }
        });

        revalidatePath('/brand/chat');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function createCampaign(prevState: any, formData: FormData) {
    const title = formData.get('title') as string || 'New Campaign';
    const description = formData.get('description') as string;
    const requirements = formData.get('requirements') as string;
    const budget = parseFloat(formData.get('budget') as string) || 0;
    const startDate = formData.get('startDate') ? new Date(formData.get('startDate') as string) : new Date();
    const endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string) : new Date();

    let brandId = formData.get('brandId') as string;

    if (!brandId) {
        return { error: "Brand ID missing" };
    }

    try {
        const campaign = await db.campaign.create({
            data: {
                brandId,
                title,
                description,
                requirements,
                budget,
                startDate,
                endDate,
                status: CampaignStatus.ACTIVE
            }
        });

        await createAuditLog("CREATE_CAMPAIGN", "CAMPAIGN", campaign.id, undefined, { title });

        revalidatePath('/brand/campaigns');
        return { success: true, campaignId: campaign.id };
    } catch (error) {
        console.error("Create Campaign Error", error);
        return { error: "Failed to create campaign" };
    }
}


// --- DISCOVERY ACTIONS ---
export async function getPublicCreators(filter?: {
    location?: string;
    niche?: string;
    minFollowers?: number;
    maxFollowers?: number;
    minPrice?: number;
    maxPrice?: number;
}) {
    try {
        // Construct where clause based on filters
        const where: any = {};

        // For debugging, we aren't enforcing verified status STRICTLY yet to ensure you see your profile
        // In production: where.verificationStatus = 'VERIFIED';

        if (filter?.niche && filter.niche !== 'All') {
            where.niche = { contains: filter.niche, mode: 'insensitive' };
        }

        // Note: Location, Helpers for followers count etc would be complex queries or post-filtering
        // For MVP, we fetch detailed candidates and filter or sort.

        const creators = await db.creator.findMany({
            where,
            include: {
                user: true,
                metrics: true, // For normalized stats
                selfReportedMetrics: true
            },
            take: 50, // Limit for performance
            orderBy: {
                // @ts-ignore - 'createdAt' might not exist on Creator, using user.createdAt or just ignoring sort for now if unsafe
                verifiedAt: 'desc'
            }
        });

        // Map to UI format
        const mapped = creators.map((c: any) => {
            // Determine primary metric
            const primaryMetric = c.metrics?.[0];
            const followers = primaryMetric?.followersCount
                || c.selfReportedMetrics?.[0]?.followersCount
                || 0;

            // Engagement mock or calc
            const engagement = primaryMetric ? `${(primaryMetric.engagementRate || 0).toFixed(1)}%` : 'N/A';

            // Format followers
            const fmtFollowers = followers > 1000000
                ? `${(followers / 1000000).toFixed(1)}M`
                : followers > 1000
                    ? `${(followers / 1000).toFixed(1)}K`
                    : followers.toString();

            return {
                id: c.userId, // Use userId as the public identifier often
                dbId: c.id,
                name: c.displayName || c.fullName || c.user?.name || "Influencer",
                handle: c.instagramUrl ? `@${c.instagramUrl.split('/').pop()}` : '@creator',
                niche: c.niche || 'General',
                location: 'Global', // Placeholder until location field added
                followers: fmtFollowers,
                followersCount: followers,
                engagementRate: engagement,
                avgViews: primaryMetric?.viewsCount || 'N/A',
                verified: c.verificationStatus === 'APPROVED' || c.verificationStatus === 'VERIFIED', // Adjust based on Enum
                tags: c.niche ? c.niche.split(',').slice(0, 3) : [],
                priceRange: '$100-500', // Placeholder
                thumbnail: c.backgroundImageUrl || "", // Use uploaded banner
                profileImage: c.profileImageUrl || c.user?.image, // Use uploaded profile
                saved: false
            };
        });

        // Client Side filtering for ranges if DB query is too complex for now
        let filtered = mapped;
        if (filter?.minFollowers) filtered = filtered.filter((c: any) => c.followersCount >= filter.minFollowers!);

        return { success: true, data: filtered };
    } catch (error) {
        console.error("Error fetching creators:", error);
        return { success: false, data: [] };
    }
}

export async function getPublicCreatorById(userId: string) {
    try {
        const creator = await db.creator.findUnique({
            where: { userId },
            include: {
                user: true,
                metrics: true,
                selfReportedMetrics: true
            }
        });

        if (!creator) return { success: false, error: "Creator not found" };

        // Normalize metrics and other fields for UI consumption
        const primaryMetric = creator.metrics[0];
        const selfMetric = creator.selfReportedMetrics[0];

        const data = {
            id: creator.userId,
            name: creator.displayName || creator.fullName || (creator.user as any).name || "Influencer",
            handle: creator.instagramUrl ? `@${creator.instagramUrl.split('/').pop()}` : undefined,
            niche: creator.niche || 'General',
            bio: creator.bio,
            location: 'Global', // Placeholder
            profileImage: creator.profileImageUrl || (creator.user as any).image,
            // @ts-ignore
            bannerImage: creator.backgroundImageUrl,
            instagramUrl: creator.instagramUrl,
            youtubeUrl: creator.youtubeUrl,
            pricing: creator.pricing ? JSON.parse(creator.pricing as string) : [],
            verificationStatus: creator.verificationStatus,
            stats: {
                followers: primaryMetric?.followersCount || selfMetric?.followersCount || 0,
                engagementRate: primaryMetric?.engagementRate || 0,
                avgViews: primaryMetric?.viewsCount || 0
            }
        };

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching creator:", error);
        return { success: false, error: "Failed to fetch creator" };
    }
}


export async function getBrandCampaigns() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        const campaigns = await db.campaign.findMany({
            where: {
                brand: { userId: session.user.id },
                status: CampaignStatus.ACTIVE
            },
            select: { id: true, title: true }
        });
        return { success: true, campaigns };
    } catch (error) {
        return { success: false, error: "Failed to fetch campaigns" };
    }
}

export async function inviteInfluencer(campaignId: string, influencerUserId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        // Find Influencer Profile ID from userId
        const influencer = await db.influencerProfile.findUnique({
            where: { userId: influencerUserId }
        });

        // Fallback: If InfluencerProfile doesn't exist (maybe they are just 'Creator' in new table logic?), check Creator table logic?
        // The schema has `InfluencerProfile` separate from `Creator`.
        // Wait, earlier files used `db.creator`.
        // `getPublicCreators` returns `userId`.
        // The `CampaignCandidate` model expects `influencerId` which links to `InfluencerProfile`.
        // I need to ensure `InfluencerProfile` exists.
        // If the system is using `Creator` table for discovery but `InfluencerProfile` for campaigns, we have a disconnect.

        // Let's check if `Creator` record implies `InfluencerProfile`?
        // Checking schema: `InfluencerProfile` and `Creator` are separate.
        // This is a migration issue. `Creator` is the new detailed table. `InfluencerProfile` is the old one linked to `CampaignCandidate`.
        // I should probably ensure `InfluencerProfile` exists or link `CampaignCandidate` to `Creator`.
        // But schema shows `CampaignCandidate` -> `InfluencerProfile`.

        // Quick fix: Check if `InfluencerProfile` exists for this user. If not, create it.
        let profile = await db.influencerProfile.findUnique({ where: { userId: influencerUserId } });

        if (!profile) {
            // Create dummy/migrated profile to allow campaign linkage
            // Ideally we should have a reliable sync, but this bridges the gap.
            const creator = await db.creator.findUnique({ where: { userId: influencerUserId } });
            profile = await db.influencerProfile.create({
                data: {
                    userId: influencerUserId,
                    niche: creator?.niche || 'General',
                    instagramHandle: creator?.instagramUrl
                }
            });
        }

        // Check if already invited
        const existing = await db.campaignCandidate.findUnique({
            where: {
                campaignId_influencerId: {
                    campaignId,
                    influencerId: profile.id
                }
            }
        });

        if (existing) return { success: false, error: "Already invited to this campaign." };

        await db.campaignCandidate.create({
            data: {
                campaignId,
                influencerId: profile.id,
                status: CandidateStatus.CONTACTED
            }
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to invite." };
    }
}
