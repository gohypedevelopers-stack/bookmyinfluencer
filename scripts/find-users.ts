import { db } from "../lib/db";

async function main() {
    console.log("Listing all users from the current database...");
    const users = await db.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
        }
    });
    console.log(users);
}

main().catch(console.error);
