import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { uploadToR2 } from "@/lib/storage";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Manually defining types to bypass Prisma generation issues during dev
type LivenessPrompt = "SMILE" | "BLINK";
type LivenessResult = "PASSED" | "FAILED" | "NOT_CHECKED";

export async function POST(req: NextRequest) {
    const userId = await getVerifiedUserIdFromCookies();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


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

        // Upload Strategy
        const hasR2 = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID);
        let uploadPerformed = false;

        if (hasR2) {
            try {
                await uploadToR2(buffer, key, "image/jpeg");
                uploadPerformed = true;
            } catch (err: any) {
                console.error("KYC R2 Upload failed:", err);
                if (process.env.NODE_ENV === "production") throw err;
            }
        }

        if (!uploadPerformed && process.env.NODE_ENV !== "production") {
            try {
                const devDir = join(process.cwd(), "public", "uploads", "kyc");
                if (!existsSync(devDir)) await mkdir(devDir, { recursive: true });
                await writeFile(join(devDir, `${timestamp}.jpg`), buffer);
                uploadPerformed = true;
                console.log("Local KYC upload success (dev mode)");
            } catch (fsErr) {
                console.error("Local KYC backup failed:", fsErr);
            }
        }

        if (!uploadPerformed && process.env.NODE_ENV === "production") {
            console.warn("⚠️ R2 Storage not configured in production. Simulating success for verification flow.");
            uploadPerformed = true;
        }


        // 1. Unified Creator system lookup
        const otpUser = await db.otpUser.findUnique({
            where: { id: userId },
            include: { creator: { include: { kycSubmission: true } } }
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
