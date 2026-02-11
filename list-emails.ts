import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true }
        });
        users.forEach(u => console.log(`${u.id} | ${u.email} | ${u.name} | ${u.role}`));
    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
