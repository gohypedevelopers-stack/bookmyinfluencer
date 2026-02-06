/*
  Warnings:

  - You are about to drop the column `submitted_for_verification_at` on the `creators` table. All the data in the column will be lost.
  - The `verification_status` column on the `creators` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `initiatedBy` to the `ChatThread` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ThreadStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "minFollowers" INTEGER DEFAULT 0,
ADD COLUMN     "niche" TEXT,
ADD COLUMN     "paymentType" TEXT DEFAULT 'FIXED';

-- AlterTable
ALTER TABLE "ChatThread" ADD COLUMN     "initiatedBy" TEXT NOT NULL,
ADD COLUMN     "status" "ThreadStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "creators" DROP COLUMN "submitted_for_verification_at",
ADD COLUMN     "background_image_url" TEXT,
ADD COLUMN     "payment_history" TEXT,
ADD COLUMN     "payout_methods" TEXT,
DROP COLUMN "verification_status",
ADD COLUMN     "verification_status" "KYCStatus" NOT NULL DEFAULT 'NOT_SUBMITTED';

-- DropEnum
DROP TYPE "VerificationStatus";
