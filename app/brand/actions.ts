'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createAuditLog, createNotification } from "@/lib/audit";
import { CandidateStatus, EscrowTransactionStatus, ContractStatus, CampaignStatus, DeliverableStatus } from "@prisma/client";
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
                `Escrow of ₹${transaction.amount} has been funded for your contract.`,
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
    const startDate = formData.get('startDate') ? new Date(formData.get('startDate') as string) : null; // Allow null for flexibility
    const endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string) : null;

    // New Fields
    const paymentType = formData.get('payment_type') as string || 'FIXED';
    const niche = formData.get('niche') as string;
    const location = formData.get('location') as string;
    const minFollowers = parseInt(formData.get('minFollowers') as string) || 0;

    // Images - filter out empty strings
    const images = (formData.getAll('images') as string[]).filter(url => url && url.length > 0);

    let brandId = formData.get('brandId') as string;

    if (!brandId) {
        return { error: "Brand ID missing" };
    }

    try {
        // Fallback to Raw SQL because Prisma Client is likely stale (file locked) and doesn't know about new columns
        // We generate a CUID-like ID manually
        const campaignId = 'cm' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

        // Ensure dates are ISO strings for SQL or Date objects if parameterized
        // Prisma $executeRaw handles standard types. 

        await db.$executeRaw`
            INSERT INTO "Campaign" (
                "id", "brandId", "title", "description", "requirements", "budget", 
                "startDate", "endDate", "status", 
                "paymentType", "niche", "location", "minFollowers", "images", "updatedAt"
            ) VALUES (
                ${campaignId}, ${brandId}, ${title}, ${description}, ${requirements}, ${budget}, 
                ${startDate}, ${endDate}, ${CampaignStatus.ACTIVE}::"CampaignStatus", 
                ${paymentType}, ${niche}, ${location}, ${minFollowers}, ${images}, NOW()
            )
        `;

        const campaign = { id: campaignId }; // MOCK return object

        await createAuditLog("CREATE_CAMPAIGN", "CAMPAIGN", campaign.id, undefined, { title, budget });

        revalidatePath('/brand/campaigns');
        return { success: true, campaignId: campaign.id };
    } catch (error) {
        console.error("Create Campaign Error", error);
        return { error: `Failed to create campaign: ${(error as Error).message}` };
    }
}

export async function deleteCampaign(campaignId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        const campaign = await db.campaign.delete({
            where: {
                id: campaignId,
                brand: { userId: session.user.id } // Ensure ownership
            }
        });

        await createAuditLog("DELETE_CAMPAIGN", "CAMPAIGN", campaignId, undefined, { title: campaign.title });

        revalidatePath('/brand/campaigns');
        return { success: true };
    } catch (error) {
        console.error("Delete Campaign Error", error);
        return { success: false, error: "Failed to delete campaign" };
    }
}

export async function updateCampaign(prevState: any, formData: FormData) {
    const campaignId = formData.get('campaignId') as string;
    if (!campaignId) return { error: "Campaign ID missing" };

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const requirements = formData.get('requirements') as string;
    const budget = parseFloat(formData.get('budget') as string) || 0;
    const startDate = formData.get('startDate') ? new Date(formData.get('startDate') as string) : null;
    const endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string) : null;

    const paymentType = formData.get('payment_type') as string || 'FIXED';
    const niche = formData.get('niche') as string;
    const location = formData.get('location') as string;
    const minFollowers = parseInt(formData.get('minFollowers') as string) || 0;

    const images = (formData.getAll('images') as string[]).filter(url => url && url.length > 0);

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { error: "Unauthorized" };

    try {
        // Use raw SQL update if needed, similar to create, or try update.
        // Assuming update works if create with raw SQL was needed only for new ID gen?
        // No, create was needed because client didn't know about columns. Update will fail too if client is stale.
        // So let's use raw SQL for update too.

        await db.$executeRaw`
            UPDATE "Campaign" SET
                "title" = ${title},
                "description" = ${description},
                "requirements" = ${requirements},
                "budget" = ${budget},
                "startDate" = ${startDate},
                "endDate" = ${endDate},
                "paymentType" = ${paymentType},
                "niche" = ${niche},
                "location" = ${location},
                "minFollowers" = ${minFollowers},
                "images" = ${images},
                "updatedAt" = NOW()
            WHERE "id" = ${campaignId} AND "brandId" = (SELECT "id" FROM "BrandProfile" WHERE "userId" = ${session.user.id})
        `;

        await createAuditLog("UPDATE_CAMPAIGN", "CAMPAIGN", campaignId, undefined, { title });

        revalidatePath('/brand/campaigns');
        revalidatePath(`/brand/campaigns/${campaignId}`);
        return { success: true, campaignId };
    } catch (error) {
        console.error("Update Campaign Error", error);
        return { error: `Failed to update campaign: ${(error as Error).message}` };
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
                priceRange: '₹100-500', // Placeholder
                thumbnail: c.backgroundImageUrl || "", // Use uploaded banner
                profileImage: c.profileImageUrl || c.user?.image, // Use uploaded profile
                saved: false
            };
        });

        // Client Side filtering for ranges if DB query is too complex for now
        let filtered = mapped;
        if (filter?.minFollowers) filtered = filtered.filter((c: any) => c.followersCount >= filter.minFollowers!);
        if (filter?.maxFollowers) filtered = filtered.filter((c: any) => c.followersCount <= filter.maxFollowers!);

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
        // 1. Resolve the correct User ID (NextAuth)
        // The influencerUserId passed usually corresponds to the Creator (OtpUser) ID in the new system.
        // We need to map this to the legacy 'User' table ID for InfluencerProfile relations.

        let targetUserId = influencerUserId;
        let creatorData: any = null;

        // Try to find if this is a v2 Creator
        const creator = await db.creator.findUnique({
            where: { userId: influencerUserId }, // influencerUserId is often OtpUser.id
            include: { user: true }
        });

        if (creator) {
            creatorData = creator;
            // Use email to link/find the NextAuth User
            const email = creator.email || (creator.user as any)?.email;

            if (email) {
                let nextAuthUser = await db.user.findUnique({ where: { email } });

                if (!nextAuthUser) {
                    // Create shadow NextAuth User if missing
                    nextAuthUser = await db.user.create({
                        data: {
                            email,
                            name: creator.displayName || creator.fullName || "Influencer",
                            role: 'INFLUENCER',
                            image: creator.profileImageUrl || creator.backgroundImageUrl
                        }
                    });
                }
                targetUserId = nextAuthUser.id;
            }
        }

        // 2. Find or Create InfluencerProfile linked to this (NextAuth) User
        let profile = await db.influencerProfile.findUnique({
            where: { userId: targetUserId }
        });

        if (!profile) {
            // Ensure we have a valid User ID before creating profile
            // If targetUserId is still the OtpId but no User exists... we technically fail FK constraint.
            // But strict migration implies we should have created the User above.

            // Create dummy/migrated profile to allow campaign linkage
            profile = await db.influencerProfile.create({
                data: {
                    userId: targetUserId, // This MUST exist in "User" table
                    niche: creatorData?.niche || 'General',
                    instagramHandle: creatorData?.instagramUrl,
                    bio: creatorData?.bio
                }
            });
        }

        // 3. Check if already invited
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

        // Notify
        // Since we have a User record now, we can notify the user
        // await createNotification(targetUserId, "New Invitation", "You have been invited to a campaign!", "OFFER");

        return { success: true };
    } catch (error) {
        console.error("Invite Error:", error);
        return { success: false, error: "Failed to invite. Please try again." };
    }
}

// --- DASHBOARD ACTIONS ---

export async function getBrandStats() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return {
        totalSpent: 0,
        activeEscrow: 0,
        completedCampaigns: 0
    };

    try {
        const brand = await db.brandProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                contracts: {
                    include: { transactions: true }
                },
                campaigns: true
            }
        });

        if (!brand) return { totalSpent: 0, activeEscrow: 0, completedCampaigns: 0 };

        // 1. Total Spent (Escrow Released + Funded?)
        let totalSpent = 0;
        let activeEscrow = 0;

        brand.contracts.forEach(contract => {
            contract.transactions.forEach(tx => {
                if (tx.status === EscrowTransactionStatus.RELEASED) {
                    totalSpent += tx.amount;
                } else if (tx.status === EscrowTransactionStatus.FUNDED) {
                    activeEscrow += tx.amount;
                    totalSpent += tx.amount; // Count funded as spent/committed
                }
            });
        });

        // 3. Completed Campaigns
        const completedCampaigns = brand.campaigns.filter(c => c.status === CampaignStatus.COMPLETED).length;

        return {
            totalSpent,
            activeEscrow,
            completedCampaigns
        };

    } catch (error) {
        console.error("Stats Error", error);
        return { totalSpent: 0, activeEscrow: 0, completedCampaigns: 0 };
    }
}

export async function getBrandDashboardActivity() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return [];

    try {
        // Fetch recent notifications as "Activity"
        const notifications = await db.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return notifications.map(n => ({
            id: n.id,
            type: n.type, // "OFFER", "MESSAGE", etc.
            title: n.title,
            subtitle: n.message,
            time: formatTimeAgo(n.createdAt),
            actionLabel: "View",
            actionLink: n.link || '#'
        }));

    } catch (error) {
        console.error("Activity Error", error);
        return [];
    }
}

function formatTimeAgo(date: Date) {
    const diff = (new Date().getTime() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

// --- NOTIFICATION & COLLAB ACTIONS ---

export async function getBrandNotifications() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return [];

    try {
        const notifications = await db.notification.findMany({
            where: {
                userId: session.user.id,
                read: false
            },
            orderBy: { createdAt: 'desc' }
        });
        return notifications;
    } catch (error) {
        console.error("Failed to fetch notifications", error);
        return [];
    }
}

export async function markNotificationRead(notificationId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false };

    try {
        await db.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        revalidatePath('/brand');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function handleCollabRequest(notificationId: string, action: 'ACCEPT' | 'REJECT') {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        const notification = await db.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification || !notification.link) return { success: false, error: "Invalid request" };

        // Extract candidateId from link logic (e.g. /brand/campaigns?candidateId=...)
        const urlParams = new URLSearchParams(notification.link.split('?')[1]);
        const candidateId = urlParams.get('candidateId');

        if (!candidateId) return { success: false, error: "Candidate not found in request" };

        const candidate = await db.campaignCandidate.findUnique({
            where: { id: candidateId },
            include: { campaign: { include: { brand: { include: { user: true } } } }, influencer: { include: { user: true } } }
        });

        if (!candidate) return { success: false, error: "Candidate record missing" };

        if (action === 'ACCEPT') {
            // 1. Update Status
            await db.campaignCandidate.update({
                where: { id: candidateId },
                data: { status: CandidateStatus.IN_NEGOTIATION }
            });

            // 2. Create/Get Chat Thread
            // Participants: Brand, Influencer, and maybe Admin? For now just Brand + Influencer
            // Check if thread exists
            let thread = await db.chatThread.findUnique({
                where: { candidateId }
            });

            if (!thread) {
                thread = await db.chatThread.create({
                    data: {
                        candidateId,
                        participants: `${session.user.id},${candidate.influencer.userId}` // Simple CSV for now as per schema
                    }
                });
            }

            // 3. Send Hello Message
            await db.message.create({
                data: {
                    threadId: thread.id,
                    senderId: session.user.id,
                    content: "Hello! We are excited to collaborate with you. Let's discuss the details."
                }
            });

            // 4. Notify Creator
            if (candidate.influencer.userId) {
                await createNotification(
                    candidate.influencer.userId,
                    "Request Accepted",
                    `${candidate.campaign.brand.companyName} has accepted your collaboration request! Check your messages.`,
                    "MESSAGE",
                    `/influencer/messages?threadId=${thread.id}`
                );
            }

        } else {
            // REJECT
            await db.campaignCandidate.update({
                where: { id: candidateId },
                data: { status: CandidateStatus.REJECTED }
            });
        }

        // Mark notification handled
        await markNotificationRead(notificationId);

        revalidatePath('/brand/campaigns');
        return { success: true };

    } catch (error) {
        return { success: false, error: "Action failed" };
    }
}

// --- ANALYTICS ACTIONS ---

export async function getCampaignAnalytics(campaignId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                candidates: {
                    where: { status: CandidateStatus.HIRED },
                    include: {
                        influencer: {
                            include: {
                                user: true
                            }
                        },
                        contract: {
                            include: { transactions: true }
                        }
                    }
                }
            }
        });

        if (!campaign) return { success: false, error: "Campaign not found" };

        // 1. Calculate Top Level Stats
        let totalReach = 0;
        let totalSpent = 0;
        let totalEngagement = 0; // Derived
        let activeCreators = 0;

        const candidates = campaign.candidates || [];

        const creatorsData = candidates.map((candidate) => {
            const influencer = candidate.influencer;

            // Use direct fields from InfluencerProfile
            const reach = influencer.followers || 0;
            const engagementRate = influencer.engagementRate || 0;

            // Est. Engagement = Reach * Rate
            const estEngagement = Math.floor(reach * (engagementRate / 100));

            // Calculate Spend for this candidate
            // SAFELY access transactions
            const transactions = candidate.contract?.transactions || [];

            const spent = transactions
                .filter(t => t.status === EscrowTransactionStatus.RELEASED || t.status === EscrowTransactionStatus.FUNDED)
                .reduce((acc, curr) => acc + curr.amount, 0) || 0;

            totalReach += reach;
            totalEngagement += estEngagement;
            totalSpent += spent;
            activeCreators++;

            return {
                id: influencer.id,
                userId: influencer.userId,
                name: influencer.user?.name || "Influencer",
                handle: influencer.instagramHandle || "creator",
                avatar: influencer.user?.image,
                platform: "Instagram", // Defaulting for now
                reach,
                engagementRate,
                spend: spent,
                roi: (Math.random() * 5 + 1).toFixed(1) + "x", // Mock ROI
                status: candidate.contract?.status === ContractStatus.COMPLETED ? "Completed" : "Active"
            };
        });

        const avgCPE = totalEngagement > 0 ? (totalSpent / totalEngagement).toFixed(2) : "0.00";
        // Est. Conversions (Mock logic: 0.5% of engagement)
        const conversions = Math.floor(totalEngagement * 0.005);

        // 2. Performance Graph Data (Mocked Time Series for Demo)
        // Generate last 30 days
        const performanceData = Array.from({ length: 15 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (14 - i) * 2); // Every 2 days
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                instagram: Math.floor(totalEngagement / 15 * (0.8 + Math.random() * 0.4)), // Randomize around avg
                youtube: Math.floor(totalEngagement / 40 * (0.8 + Math.random() * 0.4)),
            };
        });

        return {
            success: true,
            data: {
                summary: {
                    totalReach,
                    totalEngagement,
                    avgCPE,
                    conversions,
                    totalSpent,
                    budget: campaign.budget
                },
                performance: performanceData,
                creators: creatorsData
            }
        };

    } catch (error) {
        console.error("Analytics Error", error);
        return { success: false, error: "Failed to fetch analytics" };
    }
}

export async function getBrandOverallAnalytics() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        const brand = await db.brandProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                campaigns: {
                    include: {
                        candidates: {
                            where: { status: CandidateStatus.HIRED },
                            include: {
                                influencer: { include: { user: true } },
                                contract: { include: { transactions: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!brand) return { success: false, error: "Brand not found" };

        let totalReach = 0;
        let totalSpent = 0;
        let totalEngagement = 0;
        let activeCreators = 0;
        let totalBudget = 0;

        const allCreators: any[] = [];

        brand.campaigns.forEach(campaign => {
            if (campaign.status === CampaignStatus.ACTIVE) {
                totalBudget += campaign.budget || 0;
            }

            const candidates = campaign.candidates || [];

            candidates.forEach(candidate => {
                const influencer = candidate.influencer;
                const reach = influencer.followers || 0;
                const engagementRate = influencer.engagementRate || 0;
                const estEngagement = Math.floor(reach * (engagementRate / 100));

                const transactions = candidate.contract?.transactions || [];
                const spent = transactions
                    .filter(t => t.status === EscrowTransactionStatus.RELEASED || t.status === EscrowTransactionStatus.FUNDED)
                    .reduce((acc, curr) => acc + curr.amount, 0) || 0;

                totalReach += reach;
                totalEngagement += estEngagement;
                totalSpent += spent;
                activeCreators++;

                allCreators.push({
                    id: influencer.id,
                    userId: influencer.userId,
                    name: influencer.user?.name || "Influencer",
                    handle: influencer.instagramHandle || "creator",
                    avatar: influencer.user?.image,
                    platform: "Instagram",
                    reach,
                    engagementRate,
                    spend: spent,
                    roi: (Math.random() * 5 + 1).toFixed(1) + "x",
                    status: candidate.contract?.status === ContractStatus.COMPLETED ? "Completed" : "Active",
                    campaignTitle: campaign.title
                });
            });
        });



        const avgCPE = totalEngagement > 0 ? (totalSpent / totalEngagement).toFixed(2) : "0.00";
        const conversions = Math.floor(totalEngagement * 0.005);

        // Performance Data (Mocked Aggregated)
        const performanceData = Array.from({ length: 15 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (14 - i) * 2);
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                instagram: Math.floor(totalEngagement / 15 * (0.8 + Math.random() * 0.4)),
                youtube: Math.floor(totalEngagement / 40 * (0.8 + Math.random() * 0.4)),
            };
        });

        return {
            success: true,
            data: {
                summary: {
                    totalReach,
                    totalEngagement,
                    avgCPE,
                    conversions,
                    totalSpent,
                    budget: totalBudget
                },
                performance: performanceData,
                creators: allCreators.sort((a, b) => b.reach - a.reach).slice(0, 10) // Top 10 across all campaigns
            }
        };

    } catch (error) {
        console.error("Overall Analytics Error", error);
        return { success: false, error: "Failed to fetch analytics" };
    }
}

export async function createOffer(candidateId: string, amount: number, deliverables: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        // Upsert Offer
        const candidate = await db.campaignCandidate.findUnique({
            where: { id: candidateId },
            include: { offer: true, influencer: true, campaign: true }
        });

        if (!candidate) return { success: false, error: "Candidate not found" };

        if (candidate.offer) {
            // Update existing offer
            await db.offer.update({
                where: { id: candidate.offer.id },
                data: {
                    amount,
                    deliverablesDescription: deliverables,
                    status: "PENDING", // Reset to pending on update
                    history: JSON.stringify([...(candidate.offer.history ? JSON.parse(candidate.offer.history as string) : []), { action: "UPDATED", amount, date: new Date() }])
                }
            });
        } else {
            // Create new offer
            await db.offer.create({
                data: {
                    candidateId,
                    amount,
                    deliverablesDescription: deliverables,
                    status: "PENDING",
                    history: JSON.stringify([{ action: "CREATED", amount, date: new Date() }])
                }
            });
        }

        // Update Candidate Status
        await db.campaignCandidate.update({
            where: { id: candidateId },
            data: { status: CandidateStatus.IN_NEGOTIATION }
        });

        // Notify Influencer
        if (candidate.influencer.userId) {
            await createNotification(
                candidate.influencer.userId,
                "New Offer Received",
                `You have received an offer of ₹${amount} for ${candidate.campaign.title}.`,
                "OFFER",
                `/influencer/messages` // Should redirect to specific thread but general link for now
            );
        }

        revalidatePath('/brand/chat');
        return { success: true };

    } catch (error) {
        console.error("Create Offer Error", error);
        return { success: false, error: "Failed to create offer" };
    }
}

export async function finalizeOffer(candidateId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        const candidate = await db.campaignCandidate.findUnique({
            where: { id: candidateId },
            include: { offer: true, influencer: true, campaign: true }
        });

        if (!candidate || !candidate.offer) return { success: false, error: "Invalid offer state" };

        // 1. Create Contract
        const contract = await db.contract.create({
            data: {
                candidateId,
                brandId: candidate.campaign.brandId,
                influencerId: candidate.influencerId,
                totalAmount: candidate.offer.amount,
                platformFee: candidate.offer.amount * 0.10, // 10% fee
                taxAmount: 0,
                status: ContractStatus.DRAFT
            }
        });

        // 2. Create Initial Escrow Transaction (Pending)
        await db.escrowTransaction.create({
            data: {
                contractId: contract.id,
                amount: candidate.offer.amount,
                type: "DEPOSIT",
                status: EscrowTransactionStatus.PENDING
            }
        });

        // 3. Update Statuses
        await db.offer.update({
            where: { id: candidate.offer.id },
            data: { status: "ACCEPTED" }
        });

        await db.campaignCandidate.update({
            where: { id: candidateId },
            data: { status: CandidateStatus.HIRED }
        });

        // 4. Notify Influencer
        if (candidate.influencer.userId) {
            await createNotification(
                candidate.influencer.userId,
                "Offer Accepted!",
                `Congratulations! The offer for ${candidate.campaign.title} has been finalized. Contract is ready.`,
                "CONTRACT",
                `/influencer/contracts/${contract.id}`
            );
        }

        revalidatePath('/brand/chat');
        return { success: true, contractId: contract.id };

    } catch (error) {
        console.error("Finalize Offer Error", error);
        return { success: false, error: "Failed to finalize offer" };
    }
}

// --- CHECKOUT & PAYMENT ACTIONS ---

export async function getCheckoutData(influencerId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        // 1. Resolve the correct User ID (NextAuth) - same logic as inviteInfluencer
        let targetUserId = influencerId;
        let creatorData: any = null;

        const creator = await db.creator.findUnique({
            where: { userId: influencerId }, // influencerId is often OtpUser.id
            include: { user: true, socialAccounts: true }
        });

        if (creator) {
            creatorData = creator;
            const email = creator.email || (creator.user as any)?.email;

            if (email) {
                let nextAuthUser = await db.user.findUnique({ where: { email } });

                if (!nextAuthUser) {
                    nextAuthUser = await db.user.create({
                        data: {
                            email,
                            name: creator.displayName || creator.fullName || "Influencer",
                            role: 'INFLUENCER',
                            image: creator.profileImageUrl || creator.backgroundImageUrl
                        }
                    });
                }
                targetUserId = nextAuthUser.id;
            }
        }

        // 2. Find or Create InfluencerProfile linked to this (NextAuth) User
        let profile = await db.influencerProfile.findUnique({
            where: { userId: targetUserId },
            include: { user: true }
        });

        if (!profile && creatorData) {
            // Create InfluencerProfile if it doesn't exist
            profile = await db.influencerProfile.create({
                data: {
                    userId: targetUserId,
                    niche: creatorData.niche || 'General',
                    instagramHandle: creatorData.instagramUrl,
                    bio: creatorData.bio,
                    followers: creatorData.followers || 0,
                    pricing: creatorData.pricing || JSON.stringify([])
                },
                include: { user: true }
            });
        }

        if (!profile) return { success: false, error: "Influencer not found" };

        return {
            success: true,
            data: {
                id: profile.userId,
                name: profile.user.name || creatorData?.displayName || creatorData?.fullName || "Influencer",
                handle: profile.instagramHandle || creatorData?.instagramUrl || "@influencer",
                image: profile.user.image || creatorData?.profileImageUrl,
                verified: true,
                followers: profile.followers || creatorData?.followers || 0,
                pricing: profile.pricing ? JSON.parse(profile.pricing as string) : (creatorData?.pricing ? JSON.parse(creatorData.pricing) : [])
            }
        };

    } catch (error) {
        console.error("Checkout Data Error", error);
        return { success: false, error: "Failed to load" };
    }
}

export async function processDirectHire(influencerUserId: string, service: any, amount: number) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') return { success: false, error: 'Unauthorized' };

    try {
        const brand = await db.brandProfile.findUnique({ where: { userId: session.user.id } });
        // Use resolve logic for influencer profile ID
        let influencer = await db.influencerProfile.findUnique({ where: { userId: influencerUserId } });

        if (!influencer) {
            // Try valid ID lookup just in case passed ID is profile ID
            influencer = await db.influencerProfile.findUnique({ where: { id: influencerUserId } });
        }

        if (!brand || !influencer) return { success: false, error: "Profile missing" };

        // 1. Create Contract
        const contract = await db.contract.create({
            data: {
                brandId: brand.id,
                influencerId: influencer.id,
                totalAmount: amount,
                platformFee: amount * 0.05,
                taxAmount: amount * 0.18,
                status: ContractStatus.ACTIVE, // Direct hire, auto-active on payment
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
                terms: `Direct hire for ${service.title}`
            }
        });

        // 2. Create Funded Transaction
        const transaction = await db.escrowTransaction.create({
            data: {
                contractId: contract.id,
                amount: amount * 1.23, // Total + Fee + Tax roughly
                type: "DEPOSIT",
                status: EscrowTransactionStatus.FUNDED,
                paymentGatewayRef: "MOCK_PAY_" + Date.now()
            }
        });

        // 3. Create Deliverable Placeholder
        await db.deliverable.create({
            data: {
                contractId: contract.id,
                title: service.title,
                description: `Deliverable for ${service.title}`,
                status: DeliverableStatus.PENDING,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        await createAuditLog("DIRECT_HIRE", "CONTRACT", contract.id, undefined, { amount });

        // Notify Influencer
        if (influencer.userId) {
            await createNotification(
                influencer.userId,
                "New Direct Hire",
                `A brand has hired you directly for ${service.title}. Funds are in escrow.`,
                "OFFER",
                "/influencer/earnings"
            );
        }

        return { success: true, contractId: contract.id };

    } catch (error) {
        console.error("Hire Error", error);
        return { success: false, error: "Payment failed" };
    }
}

export async function getPaymentSuccessData(contractId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const contract = await db.contract.findUnique({
            where: { id: contractId },
            include: {
                transactions: true,
                influencer: { include: { user: true } },
                deliverables: true
            }
        });

        if (!contract) return { success: false, error: "Contract not found" };

        const transaction = contract.transactions.find(t => t.status === EscrowTransactionStatus.FUNDED);

        return {
            success: true,
            data: {
                transactionId: transaction?.id || "N/A",
                amount: transaction?.amount || 0,
                influencerName: contract.influencer.user.name,
                serviceTitle: contract.deliverables[0]?.title || "Campaign Service",
                date: contract.createdAt
            }
        };

    } catch (error) {
        return { success: false };
    }
}

