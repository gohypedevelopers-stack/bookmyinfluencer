
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'hanikumar064@gmail.com';
    const otpUser = await prisma.otpUser.findUnique({
        where: { email }
    });

    if (otpUser) {
        const creator = await prisma.creator.findUnique({
            where: { userId: otpUser.id }
        });
        console.log('Creator record:', JSON.stringify(creator, null, 2));
    } else {
        console.log('OtpUser not found');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
