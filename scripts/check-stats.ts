
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const creators = await prisma.creator.findMany({
        select: { id: true, fullName: true, price: true, pricePost: true }
    });
    console.log('Creators:', creators);

    const profiles = await prisma.influencerProfile.findMany({
        select: { id: true, niche: true, price: true, pricePost: true, followers: true }
    });
    console.log('Profiles:', profiles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
