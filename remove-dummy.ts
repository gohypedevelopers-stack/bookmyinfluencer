import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const targetProfileId = "cmlgh1uhg0002zuwdkrk27e9v";

    try {
        const profile = await prisma.influencerProfile.findUnique({
            where: { id: targetProfileId },
            select: { userId: true, id: true }
        });

        if (!profile) {
            console.log(`No profile found with ID: ${targetProfileId}`);
            return;
        }

        const userId = profile.userId;
        console.log(`Cleaning up all records for User ID: ${userId}...`);

        // 1. Delete Messages
        await prisma.message.deleteMany({ where: { senderId: userId } });
        console.log("- Deleted messages");

        // 2. Delete Audit Logs
        await prisma.auditLog.deleteMany({ where: { userId: userId } });
        console.log("- Deleted audit logs");

        // 3. Delete Campaign Candidates (Applications)
        await prisma.campaignCandidate.deleteMany({ where: { influencerId: profile.id } });
        console.log("- Deleted campaign applications");

        // 4. Finally delete the user (will cascade to InfluencerProfile, Notifications, etc.)
        await prisma.user.delete({ where: { id: userId } });
        console.log("✅ Successfully removed dummy user and all related data.");

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
