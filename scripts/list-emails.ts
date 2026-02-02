
import { db } from "@/lib/db";
import fs from "fs";

async function main() {
    const otpUsers = await db.otpUser.findMany({ select: { email: true } });
    const users = await db.user.findMany({ select: { email: true } });

    const output = `OtpUsers:\n${otpUsers.map(u => u.email).join('\n')}\n\nUsers:\n${users.map(u => u.email).join('\n')}`;

    fs.writeFileSync('emails.txt', output, 'utf8');
}

main();
