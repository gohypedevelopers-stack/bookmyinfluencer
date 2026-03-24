
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const creatorCount = await prisma.creator.count();
    const approvedCreatorCount = await prisma.creator.count({ where: { verificationStatus: 'APPROVED' } });

    const influencerProfileCount = await prisma.influencerProfile.count();
    const approvedInfluencerCount = await prisma.influencerProfile.count({
        where: { kyc: { status: 'APPROVED' } }
    });

    const brandProfileCount = await prisma.brandProfile.count();

    console.log('--- DB SUMMARY ---');
    console.log(`Total Creators: ${creatorCount}`);
    console.log(`Approved Creators: ${approvedCreatorCount}`);
    console.log(`Total InfluencerProfiles: ${influencerProfileCount}`);
    console.log(`Approved InfluencerProfiles: ${approvedInfluencerCount}`);
    console.log(`Total BrandProfiles: ${brandProfileCount}`);
    console.log('------------------');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
