import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function checkUser() {
    const email = "dheerajsorout02@gmail.com";

    try {
        // Find the user
        const user = await db.user.findUnique({
            where: { email },
            include: {
                influencerProfile: {
                    select: { kyc: true }
                }
            }
        });

        if (!user) {
            console.log("❌ User not found in database!");
            console.log(`Email: ${email}`);
            return;
        }

        console.log("✅ User found in database!");
        console.log("User Details:");
        console.log("- ID:", user.id);
        console.log("- Name:", user.name);
        console.log("- Email:", user.email);
        console.log("- Role:", user.role);
        console.log("- Has Password Hash:", !!user.passwordHash);
        console.log("- Password Hash:", user.passwordHash);

        // Test password verification
        const testPassword = "Dheeraj@1234";
        if (user.passwordHash) {
            const isValid = await bcrypt.compare(testPassword, user.passwordHash);
            console.log(`\n🔐 Password "${testPassword}" is ${isValid ? "VALID ✅" : "INVALID ❌"}`);

            // Also try to hash the password and see what we get
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log("\nNew hash for same password:", newHash);
            console.log("Testing new hash:", await bcrypt.compare(testPassword, newHash));
        }

        // Check all users in the database
        const allUsers = await db.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                passwordHash: true
            }
        });

        console.log("\n📋 All users in database:");
        allUsers.forEach(u => {
            console.log(`  - ${u.email} (${u.role}) - Has Password: ${!!u.passwordHash}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await db.$disconnect();
    }
}

checkUser();
