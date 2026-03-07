import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const creatorCount = await prisma.creator.count();
    const approvedCreatorCount = await prisma.creator.count({ where: { verificationStatus: 'APPROVED' } });
    const influencerProfileCount = await prisma.influencerProfile.count();
    const brandProfileCount = await prisma.brandProfile.count();

    console.log('Creator:', creatorCount);
    console.log('Approved Creator:', approvedCreatorCount);
    console.log('InfluencerProfile:', influencerProfileCount);
    console.log('BrandProfile:', brandProfileCount);
}

main().finally(() => prisma.$disconnect());
