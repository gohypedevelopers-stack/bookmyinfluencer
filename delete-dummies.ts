import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();

    try {
        console.log("Starting cleanup of all dummy Creators, Brands, and Users...");

        // Fetch all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                influencerProfile: { select: { id: true } },
                brandProfile: { select: { id: true } },
            }
        });

        // Determine who is "dummy"
        const dummyUsers = users.filter(user => {
            const email = user.email.toLowerCase();
            return (
                email.includes('.demo@') ||
                email.includes('test@') ||
                email.includes('demo@') ||
                email.includes('example.com') ||
                email.includes('archived.local') ||
                email === 'admin@bookmyinfluencers.com' // Duplicate admin
            );
        });

        console.log(`Found ${dummyUsers.length} dummy users to remove.`);

        for (const user of dummyUsers) {
            console.log(`\nRemoving dummy user: ${user.email} (Role: ${user.role}, Name: ${user.name})`);

            const userId = user.id;
            const influencerProfileId = user.influencerProfile?.id;
            const brandProfileId = user.brandProfile?.id;

            // Find OtpUser & Creator by email
            const otpUser = await prisma.otpUser.findFirst({
                where: { email: { equals: user.email, mode: 'insensitive' } }
            });
            const creator = await prisma.creator.findFirst({
                where: { email: { equals: user.email, mode: 'insensitive' } }
            });

            const creatorId = creator?.id;

            // Helper to execute Prisma calls with safety try-catch
            const safeDelete = async (label: string, deleteFn: () => Promise<any>) => {
                try {
                    await deleteFn();
                } catch (e: any) {
                    // Suppress known errors or log gently
                }
            };

            // 1. Delete Messages related to the user
            await safeDelete("Messages by senderId", () => prisma.message.deleteMany({ where: { senderId: userId } }));

            // 2. Delete Chat Threads containing user ID in participants
            await safeDelete("ChatThreads containing userId", () => prisma.chatThread.deleteMany({
                where: { participants: { contains: userId } }
            }));

            // 3. Delete dispute records
            await safeDelete("Disputes", () => prisma.dispute.deleteMany({
                where: { OR: [{ raisedById: userId }, { resolvedById: userId }] }
            }));

            // 4. Delete saved influencer lists
            if (influencerProfileId) {
                await safeDelete("SavedInfluencer by influencerProfileId", () => prisma.savedInfluencer.deleteMany({
                    where: { influencerId: influencerProfileId }
                }));
            }
            await safeDelete("SavedInfluencer by userId", () => prisma.savedInfluencer.deleteMany({ where: { userId } }));

            // 5. Delete Campaign Candidates & Assignments
            if (influencerProfileId) {
                await safeDelete("CampaignCandidate", () => prisma.campaignCandidate.deleteMany({ where: { influencerId: influencerProfileId } }));
                await safeDelete("CampaignAssignment", () => prisma.campaignAssignment.deleteMany({ where: { influencerId: influencerProfileId } }));
            }

            // 6. Delete Deliverables, Contracts, Escrow, Payouts
            if (influencerProfileId) {
                await safeDelete("Deliverables by influencerProfileId", () => prisma.deliverable.deleteMany({ where: { contract: { influencerId: influencerProfileId } } }));
                await safeDelete("Escrow by influencerProfileId", () => prisma.escrowTransaction.deleteMany({ where: { contract: { influencerId: influencerProfileId } } }));
                await safeDelete("Contract by influencerProfileId", () => prisma.contract.deleteMany({ where: { influencerId: influencerProfileId } }));
            }
            if (brandProfileId) {
                await safeDelete("Deliverables by brandProfileId", () => prisma.deliverable.deleteMany({ where: { contract: { campaign: { brandProfileId } } } }));
                await safeDelete("Escrow by brandProfileId", () => prisma.escrowTransaction.deleteMany({ where: { contract: { campaign: { brandProfileId } } } }));
                await safeDelete("Contract by brandProfileId", () => prisma.contract.deleteMany({ where: { campaign: { brandProfileId } } }));
            }

            // 7. Delete Campaigns created by the brand profile
            if (brandProfileId) {
                await safeDelete("Campaign", () => prisma.campaign.deleteMany({ where: { brandProfileId } }));
                await safeDelete("BrandCampaign", () => prisma.brandCampaign.deleteMany({ where: { brandProfileId } }));
            }

            // 8. Delete Creator metrics & self selfie/KYC
            if (creatorId) {
                await safeDelete("CreatorSelfReportedMetric", () => prisma.creatorSelfReportedMetric.deleteMany({ where: { creatorId } }));
                await safeDelete("CreatorMetric", () => prisma.creatorMetric.deleteMany({ where: { creatorId } }));
                await safeDelete("CreatorKYCSubmission", () => prisma.creatorKYCSubmission.deleteMany({ where: { creatorId } }));
                await safeDelete("CreatorSocialAccount", () => prisma.creatorSocialAccount.deleteMany({ where: { creatorId } }));
            }

            // 9. Delete KYC submissions
            await safeDelete("KYCSubmission", () => prisma.kYCSubmission.deleteMany({ where: { userId } }));

            // 10. Delete Razorpay payments / Brand wallet / Payout records
            await safeDelete("RazorpayPayment", () => prisma.razorpayPayment.deleteMany({ where: { userId } }));
            if (brandProfileId) {
                await safeDelete("WalletTransaction", () => prisma.walletTransaction.deleteMany({ where: { wallet: { brandProfileId } } }));
                await safeDelete("BrandWallet", () => prisma.brandWallet.deleteMany({ where: { brandProfileId } }));
            }
            await safeDelete("PayoutRequest", () => prisma.payoutRequest.deleteMany({ where: { userId } }));
            await safeDelete("PayoutRecord", () => prisma.payoutRecord.deleteMany({ where: { userId } }));

            // 11. Delete Audit logs, blocks, reports, notifications
            await safeDelete("AuditLog", () => prisma.auditLog.deleteMany({ where: { userId } }));
            await safeDelete("Block", () => prisma.block.deleteMany({ where: { OR: [{ blockerId: userId }, { blockedId: userId }] } }));
            await safeDelete("Report", () => prisma.report.deleteMany({ where: { OR: [{ reporterId: userId }, { reportedId: userId }] } }));
            await safeDelete("Notification", () => prisma.notification.deleteMany({ where: { userId } }));

            // 12. Delete Influencer/Brand/Creator profiles
            if (influencerProfileId) {
                await safeDelete("InfluencerProfile", () => prisma.influencerProfile.delete({ where: { id: influencerProfileId } }));
            }
            if (brandProfileId) {
                await safeDelete("BrandProfile", () => prisma.brandProfile.delete({ where: { id: brandProfileId } }));
            }
            if (creatorId) {
                await safeDelete("Creator", () => prisma.creator.delete({ where: { id: creatorId } }));
            }

            // 13. Delete User record
            await safeDelete("User", () => prisma.user.delete({ where: { id: userId } }));

            // 14. Delete OtpUser matching the email
            if (otpUser) {
                await safeDelete("EmailOtp", () => prisma.emailOtp.deleteMany({ where: { userId: otpUser.id } }));
                await safeDelete("OtpUser", () => prisma.otpUser.delete({ where: { id: otpUser.id } }));
            }

            console.log(`✅ Successfully removed: ${user.email}`);
        }

        console.log("\nAll dummy Creators and Brands have been completely purged.");

    } catch (error) {
        console.error("Error running purge script:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
