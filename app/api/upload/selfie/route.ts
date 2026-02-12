import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToR2 } from "@/lib/storage";
import { db } from "@/lib/db";
import { LivenessPrompt, LivenessResult } from "@prisma/client";

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

        // Upload to R2
        await uploadToR2(buffer, key, "image/jpeg");

        // Update DB - We check both systems
        // 1. Creator system (New)
        const creator = await db.creator.findUnique({
            where: { userId: userId },
            include: { kycSubmission: true }
        });

        if (creator) {
            if (creator.kycSubmission?.status === "APPROVED") {
                return NextResponse.json({ error: "KYC already approved" }, { status: 400 });
            }

            await db.creatorKYCSubmission.upsert({
                where: { creatorId: creator.id },
                update: {
                    selfieImageKey: key,
                    selfieCapturedAt: new Date(),
                    livenessPrompt: prompt,
                    livenessResult: result,
                    status: "PENDING",
                },
                create: {
                    creatorId: creator.id,
                    selfieImageKey: key,
                    selfieCapturedAt: new Date(),
                    livenessPrompt: prompt,
                    livenessResult: result,
                    status: "PENDING",
                },
            });

            // Update Creator verification status
            await db.creator.update({
                where: { id: creator.id },
                data: { verificationStatus: "PENDING" },
            });
        }

        // 2. Legacy InfluencerProfile system
        const profile = await db.influencerProfile.findUnique({
            where: { userId: userId },
            include: { kyc: true }
        });

        if (profile) {
            if (profile.kyc?.status === "APPROVED") {
                // Return success if already approved in legacy
                return NextResponse.json({ success: true, key: profile.kyc.selfieImageKey });
            }

            await db.kycSubmission.upsert({
                where: { profileId: profile.id },
                update: {
                    selfieImageKey: key,
                    selfieCapturedAt: new Date(),
                    livenessPrompt: prompt,
                    livenessResult: result,
                    status: "PENDING",
                },
                create: {
                    profileId: profile.id,
                    selfieImageKey: key,
                    selfieCapturedAt: new Date(),
                    livenessPrompt: prompt,
                    livenessResult: result,
                    status: "PENDING",
                },
            });
        }

        return NextResponse.json({ success: true, key });
    } catch (error) {
        console.error("Selfie upload error:", error);
        return NextResponse.json({ error: "Failed to upload selfie" }, { status: 500 });
    }
}
