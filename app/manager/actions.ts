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

        return { success: true, data: { campaign, auditLogs } };
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

