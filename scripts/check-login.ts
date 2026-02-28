
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'hanikumar064@gmail.com';
    console.log(`Checking user records for: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email }
    });
    console.log('User table record:', JSON.stringify(user, null, 2));

    const otpUser = await prisma.otpUser.findUnique({
        where: { email }
    });
    console.log('OtpUser table record:', JSON.stringify(otpUser, null, 2));

    if (user && user.passwordHash) {
        console.log('Password hash exists in User table.');
    } else {
        console.log('Password hash is missing or null in User table.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
