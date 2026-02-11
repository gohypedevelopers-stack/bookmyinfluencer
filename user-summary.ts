import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const userCount = await prisma.user.count();
        const infCount = await prisma.influencerProfile.count();
        const creatorCount = await prisma.creator.count();

        console.log(`Users: ${userCount}`);
        console.log(`InfluencerProfiles: ${infCount}`);
        console.log(`Creators: ${creatorCount}`);

        const latestUsers = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: { email: true, name: true, createdAt: true }
        });
        console.log("Latest Users:");
        latestUsers.forEach(u => console.log(`- ${u.email} (${u.name}) ${u.createdAt}`));

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
