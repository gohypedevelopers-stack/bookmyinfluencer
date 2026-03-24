
import { db } from "../lib/db";
import * as fs from 'fs';

async function main() {
    try {
        const users = await db.user.findMany({
            select: {
                email: true,
                name: true,
                role: true,
                passwordHash: true
            }
        });

        const otpUsers = await db.otpUser.findMany();

        const data = {
            users,
            otpUsers
        };

        fs.writeFileSync('users_dump.json', JSON.stringify(data, null, 2));
        console.log("Dumped to users_dump.json");

    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

main();
