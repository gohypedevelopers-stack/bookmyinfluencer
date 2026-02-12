
import { db } from "@/lib/db";
import { signSession, verifySession } from "@/lib/session";

async function main() {
    console.log("🧪 Starting Repro Data Loss Test...");

    // 1. Validation: Check if User and OtpUser share the same table
    console.log("Checking Table Separation...");
    const uniqueEmail = `table-check-${Date.now()}@test.com`;

    // Create OtpUser (Set B)
    const otpUser = await db.otpUser.create({
        data: { email: uniqueEmail }
    });

    // Check if User (Set A) sees it?
    const userCheck = await db.user.findUnique({
        where: { email: uniqueEmail }
    });

    if (userCheck) {
        console.error("❌ CRITICAL: User and OtpUser map to the SAME table!");
        console.error("User ID:", userCheck.id, "OtpUser ID:", otpUser.id);
        // If they assume same table, then seed.ts deleting User deletes OtpUser!
    } else {
        console.log("✅ User and OtpUser are separate tables.");
    }

    // 2. Simulate User Lifecycle
    const testEmail = `repro-${Date.now()}@test.com`;
    console.log(`\nCreating Test User: ${testEmail}`);

    // Create OTP User
    const user = await db.otpUser.create({
        data: {
            email: testEmail,
            verifiedAt: new Date()
        }
    });

    // Simulate OTP Login (Session Cookie)
    const sessionToken = signSession(user.id);
    const verifiedSession = verifySession(sessionToken);

    if (!verifiedSession || verifiedSession.userId !== user.id) {
        throw new Error("Session verification failed");
    }
    console.log("✅ OTP Session verified.");

    // 3. Simulate Onboarding (Set Niche only - as per fixed action)
    console.log("Simulating Onboarding...");
    const payload = { niche: "Tech", pricing: {} };

    // Call the logic from completeOnboarding (simulated)
    await db.creator.upsert({
        where: { userId: user.id },
        update: {
            niche: payload.niche,
            verificationStatus: 'PENDING', // Initial submission
            kycSubmission: {
                create: {
                    status: 'PENDING',
                    submittedAt: new Date(),
                }
            }
        },
        create: {
            userId: user.id,
            niche: payload.niche,
            verificationStatus: 'PENDING',
            kycSubmission: {
                create: {
                    status: 'PENDING',
                    submittedAt: new Date(),
                }
            }
        }
    });

    console.log("✅ Onboarding Complete. Status: PENDING");

    // 4. Simulate Admin Approval (Set B)
    console.log("Simulating Admin Approval...");
    const creator = await db.creator.findUnique({ where: { userId: user.id }, include: { kycSubmission: true } });
    if (!creator || !creator.kycSubmission) throw new Error("Creator/KYC missing");

    // Admin approves via API (Set B update)
    await db.creatorKYCSubmission.update({
        where: { id: creator.kycSubmission.id },
        data: { status: 'APPROVED' }
    });
    await db.creator.update({
        where: { id: creator.id },
        data: { verificationStatus: 'APPROVED' }
    });

    console.log("✅ Admin Approved. Status: APPROVED");

    // 5. Simulate "Login Again"
    // Fetch user again by email to ensure ID is stable
    const loginUser = await db.otpUser.findUnique({ where: { email: testEmail } });
    if (loginUser?.id !== user.id) {
        console.error("❌ User ID changed on re-fetch!");
    } else {
        console.log("✅ User ID stable.");
    }

    // 6. Simulate Onboarding Page Check
    const checkCreator = await db.creator.findUnique({
        where: { userId: loginUser!.id },
        select: { niche: true, verificationStatus: true }
    });

    if (!checkCreator?.niche) {
        console.error("❌ DATA LOSS DETECTED: Niche is missing!");
    } else if (checkCreator.verificationStatus !== 'APPROVED') {
        console.error("❌ STATUS RESET DETECTED: Status is", checkCreator.verificationStatus);
    } else {
        console.log("✅ Data Persisted. Niche:", checkCreator.niche, "Status:", checkCreator.verificationStatus);
    }

    // Cleanup
    await db.creator.delete({ where: { userId: user.id } });
    await db.otpUser.delete({ where: { id: user.id } });
    // Also cleanup table check
    await db.otpUser.delete({ where: { id: otpUser.id } });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
