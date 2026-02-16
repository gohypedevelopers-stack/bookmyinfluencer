"use server"

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        if (session.user.role !== "ADMIN") {
            const assignment = await db.campaignAssignment.findFirst({
                where: {
                    campaignId: id,
                    managerId: session.user.id
                }
            });

            if (!assignment) {
                return { success: false, error: "Not Assigned" };
            }
        }

        const campaign = await db.campaign.findUnique({
            where: { id },
            include: {
                payouts: true,
                brand: { include: { user: true } },
                candidates: {
                    include: {
                        influencer: { include: { user: true } },
                        contract: {
                            include: {
                                deliverables: true,
                                transactions: true,
                                brand: true
                            }
                        }
                    }
                }
                // Removed as any cast
            }
        });

        if (!campaign) return { success: false, error: "Campaign not found" };

        return { success: true, data: campaign };
    } catch (error: any) {
        console.error("Fetch Details Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateDeliverableStatus(deliverableId: string, status: "APPROVED" | "REJECTED", feedback?: string) {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.deliverable.update({
            where: { id: deliverableId },
            data: { status, feedback }
        });

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
