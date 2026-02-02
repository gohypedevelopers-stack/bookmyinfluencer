/*
  Warnings:

  - The `verification_status` column on the `creators` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "EscrowTransaction" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "Offer" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "PayoutRequest" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "creators" ADD COLUMN     "submitted_for_verification_at" TIMESTAMP(3),
DROP COLUMN "verification_status",
ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING';
