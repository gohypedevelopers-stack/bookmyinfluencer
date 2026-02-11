import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const targetId = "cmlgh1uhg0002zuwdkrk27e9v";

    console.log(`Searching for ID: ${targetId}`);

    try {
        // Check User
        const user = await prisma.user.findUnique({
            where: { id: targetId },
            include: {
                influencerProfile: true,
                brandProfile: true,
            }
        });

        if (user) {
            console.log('Found in User table:');
            console.log(JSON.stringify(user, null, 2));
        }

        // Check InfluencerProfile
        const infProfile = await prisma.influencerProfile.findUnique({
            where: { id: targetId },
            include: { user: true }
        });

        if (infProfile) {
            console.log('Found in InfluencerProfile table:');
            console.log(JSON.stringify(infProfile, null, 2));
        }

        // Check Creator
        const creator = await prisma.creator.findUnique({
            where: { id: targetId }
        });

        if (creator) {
            console.log('Found in Creator table:');
            console.log(JSON.stringify(creator, null, 2));
        }

        if (!user && !infProfile && !creator) {
            // Try searching as userId in Creator (since creator uses uuid but userId might be cuid)
            const creatorByUserId = await prisma.creator.findFirst({
                where: { userId: targetId }
            });
            if (creatorByUserId) {
                console.log('Found in Creator table by userId:');
                console.log(JSON.stringify(creatorByUserId, null, 2));
            } else {
                console.log('No record found with this ID in User, InfluencerProfile, or Creator tables.');
            }
        }

    } catch (error) {
        console.error('Error searching:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
