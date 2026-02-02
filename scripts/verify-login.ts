import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function verifyLogin() {
    const email = "dheerajsorout02@gmail.com";
    const password = "Dheeraj@1234";

    try {
        console.log("🔐 Verifying Login for:", email);
        console.log("━".repeat(50));

        const user = await db.user.findUnique({
            where: { email },
            include: {
                influencerProfile: {
                    select: { kyc: true }
                }
            }
        });

        if (!user || !user.passwordHash) {
            console.log("❌ FAILED: User not found or no password hash");
            return;
        }

        console.log("✅ User Found:");
        console.log("   - ID:", user.id);
        console.log("   - Name:", user.name);
        console.log("   - Email:", user.email);
        console.log("   - Role:", user.role);
        console.log("   - Has Password Hash:", !!user.passwordHash);

        const isValid = await bcrypt.compare(password, user.passwordHash);

        console.log("\n🔑 Password Verification:");
        console.log("   - Password:", password);
        console.log("   - Result:", isValid ? "✅ VALID" : "❌ INVALID");

        if (isValid) {
            console.log("\n✨ SUCCESS! User can now login with these credentials:");
            console.log("   Email:", email);
            console.log("   Password:", password);
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await db.$disconnect();
    }
}

verifyLogin();
