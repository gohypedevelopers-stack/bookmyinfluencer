/**
 * count-rows.ts — Quick utility to verify database row counts.
 * Usage: npx tsx scripts/count-rows.ts
 * 
 * This script connects to the DATABASE_URL from .env and counts
 * rows in every critical table. Use it before and after deploys
 * to detect unexpected data loss.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("\n========================================");
    console.log("  DATABASE ROW COUNT REPORT");
    console.log("  Time:", new Date().toISOString());
    console.log("  ENV:", process.env.NODE_ENV || "not set");
    console.log("========================================\n");

    const counts: Record<string, number> = {};

    counts["User"] = await prisma.user.count();
    counts["OtpUser"] = await prisma.otpUser.count();
    counts["Creator"] = await prisma.creator.count();
    counts["BrandProfile"] = await prisma.brandProfile.count();
    counts["InfluencerProfile"] = await prisma.influencerProfile.count();
    counts["KYCSubmission"] = await prisma.kYCSubmission.count();
    counts["CreatorKYCSubmission"] = await prisma.creatorKYCSubmission.count();
    counts["Campaign"] = await prisma.campaign.count();
    counts["CampaignCandidate"] = await prisma.campaignCandidate.count();
    counts["Contract"] = await prisma.contract.count();
    counts["EscrowTransaction"] = await prisma.escrowTransaction.count();
    counts["ChatThread"] = await prisma.chatThread.count();
    counts["Message"] = await prisma.message.count();
    counts["Notification"] = await prisma.notification.count();
    counts["AuditLog"] = await prisma.auditLog.count();
    counts["CreatorMetric"] = await prisma.creatorMetric.count();
    counts["CreatorSocialAccount"] = await prisma.creatorSocialAccount.count();

    console.log("Table                   | Count");
    console.log("------------------------+------");
    for (const [table, count] of Object.entries(counts)) {
        console.log(`${table.padEnd(24)}| ${count}`);
    }

    console.log("\n========================================");
    console.log("  TOTAL ROWS:", Object.values(counts).reduce((a, b) => a + b, 0));
    console.log("========================================\n");
}

main()
    .catch((e) => {
        console.error("ERROR:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
