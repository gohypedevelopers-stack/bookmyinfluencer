import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToR2 } from "@/lib/storage";
import { db } from "@/lib/db";
// Manually defining types to bypass Prisma generation issues during dev
type LivenessPrompt = "SMILE" | "BLINK";
type LivenessResult = "PASSED" | "FAILED" | "NOT_CHECKED";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const formData = await req.formData();
        const file = formData.get("file") as Blob;
        const prompt = formData.get("prompt") as LivenessPrompt;
        const result = formData.get("result") as LivenessResult;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const key = `kyc/selfie/${userId}/${timestamp}.jpg`;

        // Upload to R2 - Fallback to mock succeed in dev if R2 is not configured
        if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID) {
            console.warn("⚠️ R2 Storage not configured. Using mock success for development.");
        } else {
            await uploadToR2(buffer, key, "image/jpeg");
        }

        // Update DB - We check both systems
        // 1. Creator system (New)
        const otpUser = await db.otpUser.findUnique({
            where: { email: session.user.email as string }
        });

        const creator = otpUser ? await (db.creator as any).findUnique({
            where: { userId: otpUser.id },
            include: { kycSubmission: true }
        }) : null;

        if (creator) {
            if (creator.kycSubmission?.status === "APPROVED") {
                return NextResponse.json({ error: "KYC already approved" }, { status: 400 });
            }

            await (db as any).creatorKYCSubmission.upsert({
                where: { creatorId: creator.id },
                update: {
                    status: "PENDING",
                    selfieImageKey: key,
                    selfieCapturedAt: new Date(),
                    livenessPrompt: prompt,
                    livenessResult: result
                },
                create: {
                    creatorId: creator.id,
                    status: "PENDING",
                    selfieImageKey: key,
                    selfieCapturedAt: new Date(),
                    livenessPrompt: prompt,
                    livenessResult: result
                },
            });

            // Update Creator verification status
            await (db.creator as any).update({
                where: { id: creator.id },
                data: { verificationStatus: "PENDING" },
            });
        }

        // 2. Legacy InfluencerProfile system
        const profile = await (db.influencerProfile as any).findUnique({
            where: { userId: userId },
            include: { kyc: true }
        });

        if (profile) {
            if (profile.kyc?.status === "APPROVED") {
                // Return success if already approved in legacy
                return NextResponse.json({ success: true, key: profile.kyc.selfieImageKey });
            }

            await (db as any).kYCSubmission.upsert({
                where: { profileId: profile.id },
                update: {
                    status: "PENDING",
                    selfieImageKey: key,
                    selfieCapturedAt: new Date(),
                    livenessPrompt: prompt,
                    livenessResult: result
                },
                create: {
                    profileId: profile.id,
                    status: "PENDING",
                    selfieImageKey: key,
                    selfieCapturedAt: new Date(),
                    livenessPrompt: prompt,
                    livenessResult: result
                },
            });
        }

        return NextResponse.json({ success: true, key });
    } catch (error: any) {
        console.error("Selfie upload error:", error);
        return NextResponse.json({ error: error?.message || "Failed to upload selfie" }, { status: 500 });
    }
}
