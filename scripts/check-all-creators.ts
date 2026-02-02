import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function checkAllCreators() {
    console.log('🔍 Checking all creators in database...\n');

    const allCreators = await db.creator.findMany({
        include: {
            user: true,
            kycSubmission: true,
            metrics: true
        }
    });

    console.log(`📊 Found ${allCreators.length} total creators:\n`);

    for (const creator of allCreators) {
        console.log(`ID: ${creator.id}`);
        console.log(`Name: ${creator.fullName}`);
        console.log(`Email: ${creator.user.email}`);
        console.log(`Creator.verificationStatus: ${creator.verificationStatus}`);
        console.log(`KYC Submission: ${creator.kycSubmission ? creator.kycSubmission.status : 'MISSING'}`);
        console.log(`Metrics: ${creator.metrics.length} records`);
        console.log('---------------------------------------------------');

        // AUTO-FIX: If creator is PENDING but missing submission, fix it.
        if (creator.verificationStatus === 'PENDING' && !creator.kycSubmission) {
            console.log(`🛠️ Fixing missing KYC submission for ${creator.user.email}...`);
            await db.creatorKYCSubmission.create({
                data: {
                    creatorId: creator.id,
                    status: 'PENDING',
                    submittedAt: creator.submittedForVerificationAt || new Date()
                }
            });
            console.log('✅ Fixed.');
        }

        // AUTO-FIX: If creator has metrics but status is NOT_SUBMITTED, update to PENDING (assuming they finished onboarding)
        if (creator.verificationStatus === 'NOT_SUBMITTED' && creator.metrics.length > 0) {
            console.log(`🛠️ Creator has metrics but NOT_SUBMITTED. Updating to PENDING...`);
            await db.creator.update({
                where: { id: creator.id },
                data: { verificationStatus: 'PENDING' }
            });

            // Check if submission exists, if not create
            if (!creator.kycSubmission) {
                await db.creatorKYCSubmission.create({
                    data: {
                        creatorId: creator.id,
                        status: 'PENDING',
                        submittedAt: new Date()
                    }
                });
            } else {
                await db.creatorKYCSubmission.update({
                    where: { id: creator.kycSubmission.id },
                    data: { status: 'PENDING' }
                });
            }
            console.log('✅ Fixed.');
        }
    }

    await db.$disconnect();
}

checkAllCreators().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
