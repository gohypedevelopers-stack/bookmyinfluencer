'use server';

import { db } from "@/lib/db";
import { KYCStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";

export async function submitKYC(influencerId: string, data: any) {
    try {
        await db.kYCSubmission.upsert({
            where: { profileId: influencerId },
            update: {
                status: KYCStatus.PENDING,
                ...data,
                submittedAt: new Date()
            },
            create: {
                profileId: influencerId,
                status: KYCStatus.PENDING,
                ...data,
                submittedAt: new Date()
            }
        });

        // Trigger audit
        // await createAuditLog("SUBMIT_KYC", "KYC", influencerId, undefined, {});

        revalidatePath('/influencer/kyc');
        return { success: true };
    } catch (error) {
        console.error("KYC Submit Error", error);
        return { success: false, error: "Failed" };
    }
}
