"use server"

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/audit";

export async function getManagerStats() {
    const session = await getServerSession(authOptions);
    if (!session || !['MANAGER', 'ADMIN'].includes(session.user?.role as string)) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Use slim queries — avoid pulling full campaign+contract+deliverable objects
        const assignments = await db.campaignAssignment.findMany({
            where: { managerId: session.user.id },
            select: { campaignId: true }
        });
        const campaignIds = assignments.map(a => a.campaignId);

        if (campaignIds.length === 0) {
            return { success: true, data: { activeCampaigns: 0, pendingApprovals: 0, completedCampaigns: 0 } };
        }

        const [activeCampaigns, completedCampaigns, pendingApprovals] = await Promise.all([
            db.campaign.count({ where: { id: { in: campaignIds }, status: 'ACTIVE' } }),
            db.campaign.count({ where: { id: { in: campaignIds }, status: 'COMPLETED' } }),
            db.deliverable.count({
                where: {
                    status: 'SUBMITTED',
                    contract: { candidate: { campaignId: { in: campaignIds } } }
                }
            })
        ]);

        return { success: true, data: { activeCampaigns, pendingApprovals, completedCampaigns } };
    } catch (error: any) {
        console.error('Manager Stats Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getManagerCampaigns() {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const assignments = await db.campaignAssignment.findMany({
            where: { managerId: session.user.id },
            select: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        budget: true,
                        niche: true,
                        createdAt: true,
                        brand: { select: { id: true, companyName: true, user: { select: { name: true, image: true } } } },
                        _count: { select: { candidates: true } }
                    }
                }
            },
            orderBy: { assignedAt: 'desc' }
        });

        const campaigns = assignments.map(a => a.campaign);
        return { success: true, data: campaigns };
    } catch (error: any) {
        console.error("Manager Campaigns Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getManagerCampaignDetails(id: string) {
    const session = await getServerSession(authOptions);
    console.log("[MANAGER_DEBUG] getManagerCampaignDetails called", { id, userId: session?.user?.id, role: session?.user?.role });

    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        console.log("[MANAGER_DEBUG] Unauthorized");
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Validation: Check assignment if not Admin
        if (session.user.role !== "ADMIN") {
            const assignment = await db.campaignAssignment.findUnique({
                where: { campaignId: id }
            });

            console.log("[MANAGER_DEBUG] Assignment check", assignment);

            if (!assignment || assignment.managerId !== session.user.id) {
                console.log("[MANAGER_DEBUG] Manager mismatched or not assigned", { expected: assignment?.managerId, actual: session.user.id });
                return { success: false, error: "Not Assigned to this campaign" };
            }
        }

        const campaign = await db.campaign.findUnique({
            where: { id },
            include: {
                brand: { select: { id: true, companyName: true, userId: true, user: { select: { id: true, name: true, email: true, image: true } } } },
                assignment: { include: { manager: { select: { id: true, name: true, email: true } } } },
                payouts: { select: { id: true, amount: true, paidAt: true, method: true, utr: true }, orderBy: { paidAt: 'desc' }, take: 20 },
                candidates: {
                    include: {
                        influencer: {
                            select: {
                                id: true, userId: true, followers: true, engagementRate: true, platforms: true,
                                user: { select: { id: true, name: true, email: true, image: true } },
                                kyc: { select: { id: true, status: true } }
                            }
                        },
                        contract: {
                            include: {
                                deliverables: true,
                                transactions: { select: { id: true, amount: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 20 }
                            }
                        },
                        // messages not embedded — load per-thread lazily
                        chatThread: { select: { id: true, participants: true, updatedAt: true } },
                        offer: true
                    }
                }
            }
        });

        console.log("[MANAGER_DEBUG] Fetched Campaign", {
            found: !!campaign,
            candidatesCount: (campaign as any)?.candidates?.length
        });

        // Fetch Audit Logs for this campaign
        const auditLogs = await db.auditLog.findMany({
            where: {
                entity: "Campaign",
                entityId: id // campaignId
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return {
            success: true,
            data: {
                campaign,
                auditLogs
            }
        };
    } catch (error: any) {
        console.error("[MANAGER_DEBUG] Fetch Details Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateDeliverableStatus(deliverableId: string, status: "APPROVED" | "REJECTED", feedback?: string) {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const deliverable = await db.deliverable.findUnique({
            where: { id: deliverableId },
            include: {
                contract: {
                    include: {
                        influencer: { select: { userId: true } },
                        candidate: { include: { campaign: { select: { id: true, title: true, brand: { select: { userId: true } } } } } }
                    }
                }
            }
        });

        if (!deliverable) throw new Error("Deliverable not found");

        await db.deliverable.update({
            where: { id: deliverableId },
            data: { status, feedback }
        });

        // Audit Log
        await db.auditLog.create({
            data: {
                action: status === 'APPROVED' ? 'DELIVERABLE_APPROVED' : 'DELIVERABLE_REJECTED',
                entity: 'Deliverable',
                entityId: deliverableId,
                userId: session.user.id,
                details: JSON.stringify({ status, feedback })
            }
        });

        // Notification for Rejection (Creator)
        if (status === 'REJECTED' && deliverable.contract.influencer.userId) {
            await createNotification(
                deliverable.contract.influencer.userId,
                "Changes Requested",
                `Feedback for "${deliverable.title}": ${feedback || 'Please review requirements.'}`,
                "DELIVERABLE_UPDATE",
                `/creator/dashboard`
            );
        }

        // Notification for Approval (Brand)
        if (status === 'APPROVED' && deliverable.contract.candidate?.campaign?.brand?.userId) {
            await createNotification(
                deliverable.contract.candidate.campaign.brand.userId,
                "Deliverable Approved",
                `Work for "${deliverable.title}" has been approved.`,
                "DELIVERABLE_UPDATE",
                `/brand/campaigns/${deliverable.contract.candidate.campaign.id}`
            );
        }

        revalidatePath('/manager/campaigns');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getManagerPayouts() {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const payouts = await db.payoutRecord.findMany({
            where: {
                OR: [
                    { processedBy: session.user.id },
                    { campaign: { assignment: { managerId: session.user.id } } }
                ]
            },
            include: {
                campaign: { select: { title: true, brand: { select: { companyName: true } } } },
                creator: { select: { id: true, userId: true, user: { select: { name: true, email: true, image: true } } } }
            },
            orderBy: { paidAt: 'desc' },
            take: 100
        });

        return { success: true, data: payouts };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
// --- CHAT ACTIONS ---
export async function getManagerThreads() {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const threads = await db.chatThread.findMany({
            where: {
                participants: { contains: session.user.id }
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { id: true, content: true, createdAt: true, senderId: true, sender: { select: { id: true, name: true, image: true } } }
                },
                candidate: {
                    select: {
                        id: true,
                        influencer: { select: { id: true, userId: true, user: { select: { id: true, name: true, image: true } } } },
                        campaign: { select: { id: true, title: true, brand: { select: { id: true, companyName: true, userId: true, user: { select: { id: true, name: true, image: true } } } } } },
                        contract: { select: { id: true, status: true } },
                        offer: { select: { id: true, amount: true, status: true } }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const mappedThreads = threads.map(t => ({
            id: t.id,
            candidateId: t.candidateId,
            lastMessage: t.messages[0] || null,
            updatedAt: t.updatedAt,
            title: t.candidate?.campaign?.title || "Unknown Campaign",
            influencer: t.candidate?.influencer,
            brand: t.candidate?.campaign?.brand,
            roles: {
                brandUser: t.candidate?.campaign?.brand?.user,
                influencerUser: t.candidate?.influencer?.user
            },
            contract: t.candidate?.contract,
            offer: t.candidate?.offer
        }));

        return { success: true, data: mappedThreads };
    } catch (error: any) {
        console.error("Manager Threads Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getManagerMessages(threadId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Verify participation
        const thread = await db.chatThread.findFirst({
            where: {
                id: threadId,
                participants: { contains: session.user.id }
            }
        });

        if (!thread) return { success: false, error: "Thread not found" };

        const messages = await db.message.findMany({
            where: { threadId },
            select: { id: true, content: true, senderId: true, createdAt: true, read: true, status: true, attachmentUrl: true, attachmentType: true, sender: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: 'asc' },
            take: 50  // Last 50 messages; client can load more
        });

        return { success: true, data: messages };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
