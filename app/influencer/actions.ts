'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DeliverableStatus, PayoutStatus, CandidateStatus, CampaignStatus } from "@/lib/enums";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function getInfluencerCampaigns() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INFLUENCER') return { success: false, error: 'Unauthorized' };

    try {
        // Need to find the InfluencerProfile ID first
        const profile = await db.influencerProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!profile) return { success: false, error: "Profile not found" };

        const campaigns = await db.campaignCandidate.findMany({
            where: {
                influencerId: profile.id
            },
            include: {
                campaign: {
                    include: {
                        brand: true
                    }
                },
                offer: true,
                contract: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return { success: true, campaigns };
    } catch (error) {
        console.error("Fetch Campaigns Error", error);
        return { success: false, error: "Failed to fetch campaigns" };
    }
}

export async function updateCampaignInvitation(candidateId: string, action: 'ACCEPT' | 'REJECT') {
    try {
        const status = action === 'ACCEPT' ? CandidateStatus.IN_NEGOTIATION : CandidateStatus.REJECTED;

        await db.campaignCandidate.update({
            where: { id: candidateId },
            data: { status }
        });

        revalidatePath('/influencer/campaigns');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update invitation" };
    }
}

import { createAuditLog } from "@/lib/audit";

export async function submitDeliverable(deliverableId: string, submissionUrl: string) {
    try {
        await db.deliverable.update({
            where: { id: deliverableId },
            data: {
                status: DeliverableStatus.SUBMITTED,
                submissionUrl,
                submittedAt: new Date()
            }
        });

        await createAuditLog("SUBMIT_DELIVERABLE", "DELIVERABLE", deliverableId, undefined, { url: submissionUrl });

        revalidatePath('/influencer/earnings');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed" };
    }
}

export async function requestPayout(influencerId: string, amount: number) {
    try {
        const payout = await db.payoutRequest.create({
            data: {
                influencerId,
                amount,
                status: PayoutStatus.REQUESTED
            }
        });

        await createAuditLog("REQUEST_PAYOUT", "PAYOUT", payout.id, undefined, { amount });

        revalidatePath('/influencer/earnings');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed" };
    }
}
