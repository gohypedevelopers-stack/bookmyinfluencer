import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany();
    for (const u of users) {
        console.log(`ID: ${u.id}`);
        console.log(`Email: ${u.email}`);
        console.log(`Name: ${u.name}`);
        console.log(`Created: ${u.createdAt.toISOString()}`);
        console.log('---');
    }
    await prisma.$disconnect();
}
main();
