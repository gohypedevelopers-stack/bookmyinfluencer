import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function fixLogin() {
    const email = "dheerajsorout02@gmail.com";
    const password = "Dheeraj@1234";
    const fullName = "Dheeraj";

    try {
        console.log("🔍 Checking if user exists...\n");

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log("✅ User already exists!");
            console.log("User Details:");
            console.log("- ID:", existingUser.id);
            console.log("- Name:", existingUser.name);
            console.log("- Email:", existingUser.email);
            console.log("- Role:", existingUser.role);

            // Verify password
            if (existingUser.passwordHash) {
                const isValid = await bcrypt.compare(password, existingUser.passwordHash);
                console.log(`\n🔐 Current password "${password}" is ${isValid ? "VALID ✅" : "INVALID ❌"}`);

                if (!isValid) {
                    console.log("\n⚠️  Password doesn't match. Updating password...");
                    const newHash = await bcrypt.hash(password, 10);

                    await db.user.update({
                        where: { email },
                        data: { passwordHash: newHash }
                    });

                    console.log("✅ Password updated successfully!");
                }
            }
        } else {
            console.log("❌ User not found. Creating new user...\n");

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create User
            const newUser = await db.user.create({
                data: {
                    email,
                    name: fullName,
                    passwordHash,
                    role: "INFLUENCER"
                }
            });

            console.log("✅ User created successfully!");
            console.log("User Details:");
            console.log("- ID:", newUser.id);
            console.log("- Name:", newUser.name);
            console.log("- Email:", newUser.email);
            console.log("- Role:", newUser.role);
        }

        // Verify login works now
        console.log("\n🧪 Testing login...");
        const user = await db.user.findUnique({
            where: { email }
        });

        if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(password, user.passwordHash);
            console.log(`✅ Login test: ${isValid ? "SUCCESS ✅" : "FAILED ❌"}`);
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await db.$disconnect();
    }
}

fixLogin();
