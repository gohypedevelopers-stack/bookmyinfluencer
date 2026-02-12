'use server';

import { db } from "@/lib/db";
import { KYCStatus, PayoutStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getR2SignedUrl } from "@/lib/storage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
