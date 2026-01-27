'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DeliverableStatus, PayoutStatus } from "@prisma/client";
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
