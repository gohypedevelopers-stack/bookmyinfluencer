/*
  Warnings:

  - You are about to drop the column `status` on the `ChatThread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatThread" DROP COLUMN "status",
ALTER COLUMN "initiatedBy" DROP NOT NULL;

-- DropEnum
DROP TYPE "ThreadStatus";
