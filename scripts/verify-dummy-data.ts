import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const brands = await prisma.user.findMany({
        where: { role: 'BRAND' },
        include: { brandProfile: true }
    });
    console.log('--- Brands ---');
    brands.forEach(b => console.log(`${b.email} - ${b.brandProfile?.companyName}`));

    const legacyCreators = await prisma.user.findMany({
        where: { role: 'INFLUENCER' },
        include: { influencerProfile: true }
    });
    console.log('\n--- Legacy Creators ---');
    legacyCreators.forEach(c => console.log(`${c.email} - ${c.influencerProfile?.niche}`));

    const v2Creators = await prisma.otpUser.findMany({
        include: { creator: true }
    });
    console.log('\n--- V2 Creators ---');
    v2Creators.forEach(c => console.log(`${c.email} - ${c.creator?.displayName} (${c.creator?.niche})`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
