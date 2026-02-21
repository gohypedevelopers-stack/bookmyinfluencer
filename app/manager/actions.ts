"use server"

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/audit";

export async function getManagerStats() {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const stats = {
            activeCampaigns: 0,
            pendingApprovals: 0,
            completedCampaigns: 0
        };

        const assignments = await db.campaignAssignment.findMany({
            where: { managerId: session.user.id },
            include: { campaign: true }
        });

        const campaignIds = assignments.map(a => a.campaignId);

        if (campaignIds.length > 0) {
            const campaigns = await db.campaign.findMany({
                where: { id: { in: campaignIds } },
                include: { candidates: { include: { contract: { include: { deliverables: true } } } } }
            });

            stats.activeCampaigns = campaigns.filter(c => c.status === "ACTIVE").length;
            stats.completedCampaigns = campaigns.filter(c => c.status === "COMPLETED").length;

            for (const camp of campaigns) {
                for (const cand of camp.candidates) {
                    if (cand.contract?.deliverables) {
                        const pending = cand.contract.deliverables.filter(d => d.status === "SUBMITTED").length;
                        stats.pendingApprovals += pending;
                    }
                }
            }
        }

        return { success: true, data: stats };
    } catch (error: any) {
        console.error("Manager Stats Error:", error);
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
            include: {
                campaign: {
                    include: {
                        brand: { include: { user: true } },
                        candidates: {
                            include: {
                                influencer: { include: { user: true } },
                                contract: true
                            }
                        }
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
                brand: { include: { user: true } },
                assignment: { include: { manager: true } },
                payouts: true, // Campaign level payouts
                candidates: {
                    include: {
                        influencer: { include: { user: true, kyc: true } },
                        contract: {
                            include: {
                                deliverables: true,
                                transactions: { orderBy: { createdAt: 'desc' } }
                            }
                        },
                        chatThread: true,
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
                creator: { include: { user: { select: { name: true, email: true } } } }
            },
            orderBy: { paidAt: 'desc' }
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
                    include: { sender: true }
                },
                candidate: {
                    include: {
                        influencer: { include: { user: true } },
                        campaign: { include: { brand: { include: { user: true } } } },
                        contract: true,
                        offer: true
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
            include: { sender: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: 'asc' }
        });

        return { success: true, data: messages };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
