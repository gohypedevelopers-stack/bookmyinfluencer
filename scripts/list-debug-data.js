const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const brandUsers = await prisma.user.findMany({
        where: { role: 'BRAND' },
        take: 5,
        select: { email: true, id: true }
    });
    console.log('Brand Users:', JSON.stringify(brandUsers, null, 2));

    const creatorUsers = await prisma.user.findMany({
        where: { role: 'INFLUENCER' },
        take: 5,
        select: { email: true, id: true }
    });
    console.log('Creator Users:', JSON.stringify(creatorUsers, null, 2));

    const threads = await prisma.chatThread.findMany({
        take: 5,
        include: {
            candidate: {
                include: {
                    campaign: true,
                    contract: true
                }
            }
        }
    });
    console.log('Sample Threads:', JSON.stringify(threads, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
