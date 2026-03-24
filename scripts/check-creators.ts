
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- CREATORS ---');
    const creators = await prisma.creator.findMany({
        select: {
            id: true,
            fullName: true,
            email: true,
            verificationStatus: true,
            niche: true
        }
    });
    console.log(JSON.stringify(creators, null, 2));

    console.log('\n--- INFLUENCER PROFILES ---');
    const profiles = await prisma.influencerProfile.findMany({
        select: {
            id: true,
            niche: true,
            user: { select: { name: true, email: true } }
        }
    });
    console.log(JSON.stringify(profiles, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
