'use server';

import { db } from "@/lib/db";
import { KYCStatus, PayoutStatus } from "@/lib/enums";
import { revalidatePath } from "next/cache";
import { getR2SignedUrl } from "@/lib/storage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/audit";

export async function updateKYCStatus(submissionId: string, status: KYCStatus) {
    try {
        await db.kYCSubmission.update({
            where: { id: submissionId },
            data: {
                status,
                reviewedAt: new Date()
            }
        });
        revalidatePath('/admin/kyc');
        return { success: true };
    } catch (error) {
        console.error("KYC Update Error", error);
        return { success: false, error: "Failed" };
    }
}

export async function updatePayoutStatus(payoutId: string, status: PayoutStatus) {
    try {
        await db.payoutRequest.update({
            where: { id: payoutId },
            data: {
                status,
                processedAt: new Date()
            }
        });
        revalidatePath('/admin/payouts');
        return { success: true };
    } catch (error) {
        console.error("Payout Update Error", error);
        return { success: false, error: "Failed" };
    }
}

export async function deleteUser(userId: string) {
    try {
        console.log(`[ADMIN_ACTION] deleteUser called for userId: ${userId}`);

        // Audit log BEFORE delete so we have a record even if it fails
        await db.auditLog.create({
            data: {
                action: 'DELETE_USER',
                entity: 'User',
                entityId: userId,
                details: JSON.stringify({ timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
            }
        });

        await db.user.delete({
            where: { id: userId }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error("Delete user error", error);
        return { success: false, error: error.message || "Failed to delete user" };
    }
}

export async function updateUserRole(userId: string, role: any) {
    try {
        await db.user.update({
            where: { id: userId },
            data: { role }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Update role error", error);
        return { success: false, error: "Failed to update role" };
    }
}

export async function getFullProfileByEmail(email: string) {
    try {
        const user = await db.user.findUnique({
            where: { email },
            include: {
                influencerProfile: {
                    include: {
                        kyc: true
                    }
                }
            }
        });

        // Use a more relaxed search for Creator: email on User or email on Creator or similar
        const creator = await (db.creator as any).findFirst({
            where: {
                user: { email: email }
            },
            include: {
                metrics: true,
                kycSubmission: true,
                user: true
            }
        });

        // Fallback: If kycSubmission exists but missing our new fields (due to stale types), fetch via raw query
        if (creator && creator.id) {
            try {
                const rawKyc = await db.$queryRawUnsafe(`SELECT * FROM creator_kyc_submissions WHERE creator_id = $1`, creator.id) as any[];
                if (rawKyc && rawKyc.length > 0) {
                    const k = rawKyc[0];
                    // Overwrite/Attach fields manually since Prisma might filter them
                    creator.kycSubmission = {
                        ...creator.kycSubmission,
                        selfieImageKey: k.selfie_image_key,
                        livenessPrompt: k.liveness_prompt,
                        livenessResult: k.liveness_result,
                        selfieCapturedAt: k.selfie_captured_at,
                        submittedAt: k.submitted_at,
                        reviewedAt: k.reviewed_at,
                        status: k.status
                    };
                }
            } catch (rawErr) {
                console.error("Raw KYC Fetch Error", rawErr);
            }
        }

        return { success: true, user: user ? JSON.parse(JSON.stringify(user)) : null, creator: creator ? JSON.parse(JSON.stringify(creator)) : null };
    } catch (error) {
        console.error("Get profile error", error);
        return { success: false, error: "Failed to fetch profile" };
    }
}

export async function verifyCreator(creatorId: string, status: KYCStatus) {
    try {
        await db.creator.update({
            where: { id: creatorId },
            data: {
                verificationStatus: status,
                verifiedAt: status === 'APPROVED' ? new Date() : null
            }
        });

        const kyc = await db.creatorKYCSubmission.findUnique({
            where: { creatorId }
        });

        if (kyc) {
            await db.creatorKYCSubmission.update({
                where: { id: kyc.id },
                data: { status }
            });
        }

        revalidatePath('/admin/kyc');
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Verify creator error", error);
        return { success: false, error: "Failed to verify creator" };
    }
}

export async function getSignedSelfieUrl(key: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    try {
        const url = await getR2SignedUrl(key, 300); // 5 minutes expiry
        return { success: true, url };
    } catch (error) {
        console.error("Signed URL Error", error);
        return { success: false, error: "Failed to generate URL" };
    }
}

export async function getAllCampaignsForAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

    try {
        const campaigns = await db.campaign.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                budget: true,
                createdAt: true,
                niche: true,
                brand: { select: { id: true, companyName: true, userId: true, user: { select: { name: true, email: true, image: true } } } },
                assignment: { select: { managerId: true, manager: { select: { id: true, name: true, email: true } } } },
                _count: { select: { candidates: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        return { success: true, data: campaigns };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getManagerUsers() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

    try {
        const managers = await db.user.findMany({
            where: { role: "MANAGER" },
            select: { id: true, name: true, email: true, image: true }
        });
        return { success: true, data: managers };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Helper to get all candidates for a campaign
export async function assignManagerToCampaign(campaignId: string, managerId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

    try {
        // 1. Create/Update Assignment
        await db.campaignAssignment.upsert({
            where: { campaignId },
            update: { managerId, assignedAt: new Date() },
            create: {
                campaignId,
                managerId
            }
        });

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: { title: true, brand: { select: { userId: true } } }
        });

        if (!campaign) throw new Error("Campaign not found");

        const brandUserId = campaign.brand.userId;
        const manager = await db.user.findUnique({ where: { id: managerId } });

        // 2. Audit Log
        await db.auditLog.create({
            data: {
                action: 'MANAGER_ASSIGNED',
                entity: 'Campaign',
                entityId: campaignId,
                details: JSON.stringify({ managerId: managerId, assignedBy: session.user.email }),
                userId: session.user.id
            }
        });

        // 3. Notifications
        // To Manager
        await createNotification(
            managerId,
            "New Campaign Assigned",
            `You have been assigned to manage campaign: ${campaign.title}`,
            "CAMPAIGN_ASSIGNMENT",
            `/manager/campaigns/${campaignId}`
        );

        // To Brand
        await createNotification(
            brandUserId,
            "Manager Assigned",
            `Your campaign "${campaign.title}" is now being managed by ${manager?.name || 'a dedicated manager'}.`,
            "CAMPAIGN_UPDATE"
        );

        // 4. Update Chat Threads (Make them Trio)
        // Find all candidates for this campaign
        const candidates = await db.campaignCandidate.findMany({
            where: { campaignId },
            include: { influencer: { select: { userId: true } }, chatThread: true }
        });

        for (const candidate of candidates) {
            // Notify Creator
            if (candidate.influencer.userId) {
                await createNotification(
                    candidate.influencer.userId,
                    "Manager Joined",
                    `A manager (${manager?.name}) has joined the campaign "${campaign.title}".`,
                    "CAMPAIGN_UPDATE"
                );
            }

            // Update Thread Participants
            if (candidate.chatThread) {
                const currentParticipants = candidate.chatThread.participants.split(',');
                if (!currentParticipants.includes(managerId)) {
                    const newParticipants = [...currentParticipants, managerId].join(',');
                    await db.chatThread.update({
                        where: { id: candidate.chatThread.id },
                        data: { participants: newParticipants }
                    });

                    // System message in chat
                    await db.message.create({
                        data: {
                            threadId: candidate.chatThread.id,
                            senderId: managerId, // Or system/admin? Let's use manager so they "announce" themselves or fake system
                            content: `System: Manager ${manager?.name} has joined the chat.`,
                            status: 'SENT',
                            // Use manager as sender, or create a SYSTEM user? 
                            // Using ManagerId allows them to see it as their message.
                            // Actually better to have a generic message.
                        }
                    });
                }
            }
        }

        revalidatePath('/admin/campaigns');
        return { success: true };
    } catch (error: any) {
        console.error("Assign Manager Error:", error);
        return { success: false, error: error.message };
    }
}


export async function getAdminCampaignDetails(campaignId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

    try {
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                brand: { select: { id: true, companyName: true, userId: true, user: { select: { id: true, name: true, email: true, image: true } } } },
                assignment: { include: { manager: { select: { id: true, name: true, email: true } } } },
                payouts: { select: { id: true, amount: true, paidAt: true, method: true, utr: true }, orderBy: { paidAt: 'desc' }, take: 20 },
                candidates: {
                    include: {
                        influencer: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
                        contract: {
                            include: {
                                transactions: { select: { id: true, amount: true, status: true, createdAt: true } },
                                deliverables: true
                            }
                        },
                        // Messages NOT included here — load per-thread via getAdminThreadMessages
                        chatThread: { select: { id: true, participants: true, updatedAt: true } },
                        offer: true
                    }
                }
            }
        });

        if (!campaign) return { success: false, error: "Campaign not found" };

        // Fetch Audit Logs for this campaign (capped)
        const auditLogs = await db.auditLog.findMany({
            where: { entity: "Campaign", entityId: campaignId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Payout Records (capped at 50)
        const payoutRecords = await db.payoutRecord.findMany({
            where: { campaignId },
            select: { id: true, amount: true, paidAt: true, method: true, utr: true, creator: { select: { id: true, user: { select: { name: true, email: true } } } } },
            orderBy: { paidAt: 'desc' },
            take: 50
        });

        return {
            success: true,
            data: { campaign, auditLogs, payoutRecords }
        };
    } catch (error: any) {
        console.error("Get Campaign Details Error:", error);
        return { success: false, error: error.message };
    }
}

export async function sendAdminSystemMessage(threadId: string, content: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

    try {
        await db.message.create({
            data: {
                threadId,
                senderId: session.user.id, // Admin as sender
                content: `[ADMIN]: ${content}`,
                status: 'SENT'
            }
        });

        // Trigger Pusher update if needed (omitted for now to keep simple, relies on polling or refresh)
        // Ideally should call pusher

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function recordManualPayout(data: {
    campaignId: string;
    creatorId: string;
    amount: number;
    transactionReference: string;
    paymentMethod: string;
    notes?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

    try {
        // Check for duplicate UTR
        const existing = await db.payoutRecord.findFirst({
            where: { utr: data.transactionReference }
        });
        if (existing) return { success: false, error: "Transaction reference (UTR) already exists" };

        await db.payoutRecord.create({
            data: {
                campaignId: data.campaignId,
                creatorId: data.creatorId,
                amount: data.amount,
                utr: data.transactionReference,
                method: data.paymentMethod,
                processedBy: session.user.id,
                paidAt: new Date(),
                // notes: data.notes // Add if schema supports
            }
        });

        const influencer = await db.influencerProfile.findUnique({
            where: { id: data.creatorId },
            select: { userId: true }
        });

        if (influencer) {
            await createNotification(
                influencer.userId,
                "Payout Recorded",
                `A manual payout of ${data.amount} has been recorded. Ref: ${data.transactionReference}`,
                "PAYOUT_PROCESSED"
            );
        }

        revalidatePath(`/admin/campaigns/${data.campaignId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
