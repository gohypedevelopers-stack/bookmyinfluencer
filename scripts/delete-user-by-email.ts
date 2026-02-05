
import { db } from "../lib/db";

const email = "gohypemediatech@gmail.com";

async function main() {
    try {
        console.log(`Checking for user with email: ${email}`);

        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log("User not found.");
            return;
        }

        console.log("Found user:", user.id, user.name, user.role);

        // Delete related profiles first if cascade doesn't handle it (User usually cascades, but good to be sure or just delete user directly)
        // Prisma schema generally cascades deletes from User.

        console.log("Deleting user...");
        await db.user.delete({
            where: { email }
        });

        console.log("User deleted successfully.");

    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

main();
