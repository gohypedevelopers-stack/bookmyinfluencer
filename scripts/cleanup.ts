
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'hanikumar064@gmail.com';
    console.log(`Cleaning up records for: ${email}`);

    try {
        const otpUser = await prisma.otpUser.findUnique({
            where: { email },
            select: { id: true }
        });

        if (otpUser) {
            // Delete creator first due to relation
            await prisma.creator.deleteMany({
                where: { userId: otpUser.id }
            });
            console.log('✅ Creator record deleted');
        }

        await prisma.user.deleteMany({
            where: { email }
        });
        console.log('✅ User record deleted');

        console.log('Cleanup COMPLETE.');
    } catch (err) {
        console.error('❌ CLEANUP FAILED:', err);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
