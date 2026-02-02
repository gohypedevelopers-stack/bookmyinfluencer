import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function checkVerifications() {
    console.log('🔍 Checking verification data...\n');

    // Check creators with PENDING status
    const pendingCreators = await db.creator.findMany({
        where: {
            verificationStatus: 'PENDING'
        },
        include: {
            user: true,
            kycSubmission: true,
            metrics: true
        }
    });

    console.log(`📊 Found ${pendingCreators.length} creators with PENDING verification status:\n`);

    for (const creator of pendingCreators) {
        console.log(`Creator ID: ${creator.id}`);
        console.log(`Name: ${creator.fullName || 'N/A'}`);
        console.log(`Email: ${creator.user.email}`);
        console.log(`Verification Status: ${creator.verificationStatus}`);
        console.log(`Has KYC Submission: ${creator.kycSubmission ? 'YES' : 'NO'}`);

        if (creator.kycSubmission) {
            console.log(`KYC Submission Status: ${creator.kycSubmission.status}`);
            console.log(`KYC Submission ID: ${creator.kycSubmission.id}`);
        } else {
            console.log('⚠️  Missing KYC Submission record - Creating one...');

            // Create missing KYC submission
            const newSubmission = await db.creatorKYCSubmission.create({
                data: {
                    creatorId: creator.id,
                    status: 'PENDING',
                    submittedAt: new Date()
                }
            });

            console.log(`✅ Created KYC Submission: ${newSubmission.id}`);
        }

        console.log(`Metrics count: ${creator.metrics.length}`);
        console.log('─'.repeat(60) + '\n');
    }

    // Check all KYC submissions
    const allSubmissions = await db.creatorKYCSubmission.findMany({
        where: {
            status: 'PENDING'
        },
        include: {
            creator: {
                include: {
                    user: true
                }
            }
        }
    });

    console.log(`\n📋 Total ${allSubmissions.length} PENDING KYC submissions in database:\n`);

    for (const submission of allSubmissions) {
        console.log(`Submission ID: ${submission.id}`);
        console.log(`Creator: ${submission.creator.fullName || 'N/A'}`);
        console.log(`Email: ${submission.creator.user.email}`);
        console.log(`Submitted At: ${submission.submittedAt}`);
        console.log('─'.repeat(60) + '\n');
    }

    await db.$disconnect();
}

checkVerifications().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
