"use server"

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireManagerSession() {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function getManagerStats() {
    try {
        const session = await requireManagerSession();

        const assignments = await db.campaignAssignment.findMany({
            where: session.user.role === "ADMIN" ? undefined : { managerId: session.user.id },
            select: { campaignId: true },
        });

        const campaignIds = assignments.map((assignment) => assignment.campaignId);
        if (campaignIds.length === 0) {
            return { success: true, data: { activeCampaigns: 0, pendingApprovals: 0, completedCampaigns: 0 } };
        }

        const [activeCampaigns, completedCampaigns, pendingApprovals] = await Promise.all([
            db.campaign.count({ where: { id: { in: campaignIds }, status: "ACTIVE" } }),
            db.campaign.count({ where: { id: { in: campaignIds }, status: "COMPLETED" } }),
            db.campaignCandidate.count({
                where: {
                    campaignId: { in: campaignIds },
                    managerReviewStatus: "SUBMITTED",
                },
            }),
        ]);

        return { success: true, data: { activeCampaigns, pendingApprovals, completedCampaigns } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getManagerCampaigns() {
    try {
        const session = await requireManagerSession();

        const assignments = await db.campaignAssignment.findMany({
            where: session.user.role === "ADMIN" ? undefined : { managerId: session.user.id },
            select: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        budget: true,
                        niche: true,
                        paymentStatus: true,
                        createdAt: true,
                        brand: { select: { id: true, companyName: true, user: { select: { name: true, image: true } } } },
                        _count: { select: { candidates: true } },
                    },
                },
            },
            orderBy: { assignedAt: "desc" },
        });

        return { success: true, data: assignments.map((assignment) => assignment.campaign) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getManagerCampaignDetails(id: string) {
    try {
        const session = await requireManagerSession();

        if (session.user.role !== "ADMIN") {
            const assignment = await db.campaignAssignment.findUnique({ where: { campaignId: id } });
            if (!assignment || assignment.managerId !== session.user.id) {
                return { success: false, error: "Not Assigned to this campaign" };
            }
        }

        const campaign = await db.campaign.findUnique({
            where: { id },
            include: {
                brand: { select: { id: true, companyName: true, userId: true, user: { select: { id: true, name: true, email: true, image: true } } } },
                assignment: { include: { manager: { select: { id: true, name: true, email: true } } } },
                candidates: {
                    include: {
                        influencer: {
                            select: {
                                id: true,
                                followers: true,
                                engagementRate: true,
                                niche: true,
                                location: true,
                                platforms: true,
                                userId: true,
                                user: { select: { id: true, name: true, email: true, image: true } },
                            },
                        },
                        chatThread: {
                            include: {
                                messages: {
                                    include: {
                                        sender: { select: { id: true, name: true } },
                                    },
                                    orderBy: { createdAt: "desc" },
                                    take: 5,
                                },
                            },
                        },
                    },
                    orderBy: [{ managerReviewStatus: "asc" }, { updatedAt: "desc" }],
                },
            },
        });

        if (!campaign) {
            return { success: false, error: "Campaign not found" };
        }

        const auditLogs = await db.auditLog.findMany({
            where: { entity: "Campaign", entityId: id },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        let brandConversation = {
            threadId: null as string | null,
            messages: [] as Array<{
                id: string;
                senderId: string;
                senderName: string;
                content: string;
                createdAt: string;
            }>,
        };

        const brandThread = await db.chatThread.findFirst({
            where: {
                initiatedBy: `campaign:${id}:brand-manager`,
            },
            include: {
                messages: {
                    include: {
                        sender: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: "asc" },
                    take: 150,
                },
            },
        });

        if (brandThread) {
            brandConversation = {
                threadId: brandThread.id,
                messages: brandThread.messages.map((message) => ({
                    id: message.id,
                    senderId: message.senderId,
                    senderName: message.sender.name || "User",
                    content: message.content || "",
                    createdAt: message.createdAt.toISOString(),
                })),
            };
        }

        return { success: true, data: { campaign, auditLogs, brandConversation } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendManagerBrandMessage(campaignId: string, content: string) {
    try {
        const session = await requireManagerSession();
        const trimmed = String(content || "").trim();
        if (!trimmed) {
            return { success: false, error: "Message is required." };
        }

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: {
                id: true,
                title: true,
                assignment: { select: { managerId: true } },
                brand: { select: { userId: true } },
            },
        });

        if (!campaign) {
            return { success: false, error: "Campaign not found." };
        }

        if (session.user.role !== "ADMIN" && campaign.assignment?.managerId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        if (!campaign.assignment?.managerId || !campaign.brand.userId) {
            return { success: false, error: "Manager or brand is missing." };
        }

        const threadKey = `campaign:${campaignId}:brand-manager`;
        let thread = await db.chatThread.findFirst({
            where: {
                initiatedBy: threadKey,
            },
            select: { id: true },
        });

        if (!thread) {
            thread = await db.chatThread.create({
                data: {
                    participants: `${campaign.brand.userId},${campaign.assignment.managerId}`,
                    initiatedBy: threadKey,
                },
                select: { id: true },
            });
        }

        await db.message.create({
            data: {
                threadId: thread.id,
                senderId: session.user.id,
                content: trimmed,
                status: "SENT",
            },
        });

        await db.notification.create({
            data: {
                userId: campaign.brand.userId,
                type: "MESSAGE",
                title: "Project manager message",
                message: `New update on ${campaign.title}.`,
                link: `/brand/campaigns/${campaignId}`,
            },
        });

        revalidatePath(`/manager/campaigns/${campaignId}`);
        revalidatePath(`/brand/campaigns/${campaignId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendManagerCreatorMessage(candidateId: string, content: string) {
    try {
        const session = await requireManagerSession();
        const trimmed = String(content || "").trim();
        if (!trimmed) return { success: false, error: "Message is required." };

        const candidate = await db.campaignCandidate.findUnique({
            where: { id: candidateId },
            include: {
                campaign: {
                    include: {
                        assignment: true,
                        brand: { select: { companyName: true } },
                    },
                },
                influencer: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!candidate) return { success: false, error: "Candidate not found." };
        if (session.user.role !== "ADMIN" && candidate.campaign.assignment?.managerId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }
        if (!candidate.influencer.userId) {
            return { success: false, error: "Creator user is missing." };
        }

        let thread = await db.chatThread.findUnique({
            where: { candidateId: candidate.id },
            select: { id: true },
        });

        if (!thread) {
            thread = await db.chatThread.create({
                data: {
                    candidateId: candidate.id,
                    participants: `${candidate.campaign.assignment?.managerId || session.user.id},${candidate.influencer.userId}`,
                    initiatedBy: `candidate:${candidate.id}:manager-creator`,
                },
                select: { id: true },
            });
        }

        await db.message.create({
            data: {
                threadId: thread.id,
                senderId: session.user.id,
                content: trimmed,
                status: "SENT",
            },
        });

        await db.notification.create({
            data: {
                userId: candidate.influencer.userId,
                type: "MESSAGE",
                title: "Project manager update",
                message: `${candidate.campaign.brand.companyName} campaign has a new manager update.`,
                link: "/creator/campaigns",
            },
        });

        revalidatePath(`/manager/campaigns/${candidate.campaignId}`);
        revalidatePath("/creator/campaigns");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function reviewCandidateSubmission(candidateId: string, decision: "APPROVE" | "CHANGES_REQUESTED", notes?: string) {
    try {
        const session = await requireManagerSession();

        const candidate = await db.campaignCandidate.findUnique({
            where: { id: candidateId },
            include: {
                campaign: {
                    include: {
                        assignment: true,
                        brand: { select: { userId: true, companyName: true } },
                    },
                },
                influencer: { select: { userId: true, user: { select: { name: true } } } },
            },
        });

        if (!candidate) {
            return { success: false, error: "Submission not found" };
        }

        if (session.user.role !== "ADMIN" && candidate.campaign.assignment?.managerId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const updateData =
            decision === "APPROVE"
                ? {
                    managerReviewStatus: "READY_FOR_BRAND_REVIEW",
                    managerReviewNotes: notes || null,
                    managerReviewedAt: new Date(),
                    readyForBrandReviewAt: new Date(),
                    status: "COMPLETED",
                }
                : {
                    managerReviewStatus: "CHANGES_REQUESTED",
                    managerReviewNotes: notes || "Please revise and resubmit.",
                    managerReviewedAt: new Date(),
                    status: "HIRED",
                };

        await db.campaignCandidate.update({
            where: { id: candidateId },
            data: updateData,
        });

        if (decision === "APPROVE") {
            const remaining = await db.campaignCandidate.count({
                where: {
                    campaignId: candidate.campaignId,
                    creatorDecision: "ACCEPTED",
                    managerReviewStatus: { not: "READY_FOR_BRAND_REVIEW" },
                },
            });

            if (remaining === 0) {
                await db.campaign.update({
                    where: { id: candidate.campaignId },
                    data: { status: "COMPLETED" },
                });
            }
        }

        await db.auditLog.create({
            data: {
                userId: session.user.id,
                action: decision === "APPROVE" ? "CONTENT_APPROVED" : "CONTENT_CHANGES_REQUESTED",
                entity: "CampaignCandidate",
                entityId: candidate.id,
                details: JSON.stringify({ decision, notes: notes || null }),
            },
        });

        if (candidate.influencer.userId) {
            await db.notification.create({
                data: {
                    userId: candidate.influencer.userId,
                    type: "DELIVERABLE_UPDATE",
                    title: decision === "APPROVE" ? "Content approved" : "Changes requested",
                    message: decision === "APPROVE"
                        ? `Your submission for ${candidate.campaign.title} was approved by the manager.`
                        : `Manager requested updates for ${candidate.campaign.title}.`,
                    link: "/creator/campaigns",
                },
            });
        }

        if (decision === "APPROVE" && candidate.campaign.brand.userId) {
            await db.notification.create({
                data: {
                    userId: candidate.campaign.brand.userId,
                    type: "DELIVERABLE_UPDATE",
                    title: "Submission ready for your review",
                    message: `${candidate.influencer.user?.name || "Creator"} submission is approved by manager and ready for review.`,
                    link: `/brand/campaigns/${candidate.campaign.id}`,
                },
            });
        }

        revalidatePath(`/manager/campaigns/${candidate.campaign.id}`);
        revalidatePath("/manager/campaigns");
        revalidatePath("/creator/campaigns");
        revalidatePath(`/brand/campaigns/${candidate.campaign.id}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getManagerPayouts() {
    try {
        const session = await requireManagerSession();
        const whereClause =
            session.user.role === "ADMIN"
                ? {}
                : {
                    OR: [
                        { processedBy: session.user.id },
                        { campaign: { assignment: { managerId: session.user.id } } },
                    ],
                };

        const payouts = await db.payoutRecord.findMany({
            where: whereClause,
            include: {
                campaign: { select: { title: true, brand: { select: { companyName: true } } } },
                creator: { select: { id: true, user: { select: { name: true, email: true, image: true } } } },
            },
            orderBy: { paidAt: "desc" },
            take: 100,
        });

        return { success: true, data: payouts };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getManagerThreads() {
    await requireManagerSession();
    return { success: true, data: [] };
}

export async function getManagerMessages(threadId: string) {
    await requireManagerSession();
    void threadId;
    return { success: true, data: [] };
}

