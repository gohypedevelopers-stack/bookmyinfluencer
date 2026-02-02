
import { db } from "@/lib/db";

async function main() {
    const otpUsers = await db.otpUser.findMany();
    const users = await db.user.findMany();

    console.log(JSON.stringify({ otpUsers, users }, null, 2));
}

main();
