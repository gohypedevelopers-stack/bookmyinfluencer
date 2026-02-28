
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'hanikumar064@gmail.com';
    const password = 'Password@123'; // Temporary password for simulation
    const fullName = 'Hani Kumar';

    console.log(`Simulating registration for: ${email}`);

    try {
        const existingOtpUser = await prisma.otpUser.findUnique({
            where: { email },
            include: { creator: true }
        });

        if (!existingOtpUser || !existingOtpUser.verifiedAt) {
            console.error('OtpUser not verified or not found');
            return;
        }

        console.log('Step 1: Found verified OtpUser');

        const passwordHash = await bcrypt.hash(password, 10);

        console.log('Step 2: Hashed password');

        // Mimic registerUserAction upserts
        console.log('Step 3: Upserting Creator...');
        const creator = await prisma.creator.upsert({
            where: { userId: existingOtpUser.id },
            update: {
                fullName,
                onboardingCompleted: true,
                niche: 'Tech',
                priceType: 'Per Post',
            },
            create: {
                userId: existingOtpUser.id,
                fullName,
                onboardingCompleted: true,
                niche: 'Tech',
                priceType: 'Per Post',
            }
        });
        console.log('✅ Creator upsert successful');

        console.log('Step 4: Upserting User...');
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name: fullName,
                passwordHash,
                role: 'INFLUENCER'
            },
            create: {
                email,
                name: fullName,
                passwordHash,
                role: 'INFLUENCER'
            }
        });
        console.log('✅ User upsert successful');

        console.log('Simulation COMPLETE. User records created.');

    } catch (err) {
        console.error('❌ SIMULATION FAILED:', err);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
