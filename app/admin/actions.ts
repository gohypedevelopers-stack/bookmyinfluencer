'use server';

import { db } from "@/lib/db";
import { KYCStatus, PayoutStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
