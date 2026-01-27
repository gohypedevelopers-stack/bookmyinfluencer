'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createAuditLog, createNotification } from "@/lib/audit";

export async function updateCandidateStatus(candidateId: string, newStatus: string) {
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

        const transaction = contract.transactions.find(t => t.status === 'PENDING') || contract.transactions[0];
        if (!transaction) return { success: false, error: "No pending transaction found" };

        await db.escrowTransaction.update({
            where: { id: transaction.id },
            data: { status: 'FUNDED' }
        });

        await db.contract.update({
            where: { id: contractId },
            data: { status: 'ACTIVE' }
        });

        if (contract.candidateId) {
            await db.campaignCandidate.update({
                where: { id: contract.candidateId },
                data: { status: 'HIRED' }
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
                status: 'DRAFT'
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

