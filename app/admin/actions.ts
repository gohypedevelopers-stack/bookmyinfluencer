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
        const creator = await db.creator.findFirst({
            where: {
                user: { email: email }
            },
            include: {
                metrics: true,
                kycSubmission: true,
                user: true
            }
        });

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
