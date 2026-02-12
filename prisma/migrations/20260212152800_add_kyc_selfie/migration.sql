-- CreateEnum
CREATE TYPE "LivenessPrompt" AS ENUM ('SMILE', 'BLINK');

-- CreateEnum
CREATE TYPE "LivenessResult" AS ENUM ('PASSED', 'FAILED', 'NOT_CHECKED');

-- AlterTable
ALTER TABLE "KYCSubmission" ADD COLUMN "livenessPrompt" "LivenessPrompt",
ADD COLUMN "livenessResult" "LivenessResult",
ADD COLUMN "selfieCapturedAt" TIMESTAMP(3),
ADD COLUMN "selfieImageKey" TEXT,
ADD COLUMN "verifiedByAdminAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "creator_kyc_submissions" ADD COLUMN "liveness_prompt" "LivenessPrompt",
ADD COLUMN "liveness_result" "LivenessResult",
ADD COLUMN "selfie_captured_at" TIMESTAMP(3),
ADD COLUMN "selfie_image_key" TEXT,
ADD COLUMN "verified_by_admin_at" TIMESTAMP(3);
