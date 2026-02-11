import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({
            include: {
                influencerProfile: true,
                brandProfile: true
            }
        });
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
