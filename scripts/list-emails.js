const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const brandUsers = await prisma.user.findMany({
        where: { role: 'BRAND' },
        take: 2,
        select: { email: true }
    });
    console.log('BRANDS:', brandUsers.map(u => u.email).join(', '));

    const creatorUsers = await prisma.user.findMany({
        where: { role: 'INFLUENCER' },
        take: 2,
        select: { email: true }
    });
    console.log('CREATORS:', creatorUsers.map(u => u.email).join(', '));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
