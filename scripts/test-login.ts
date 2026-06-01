import { db } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
    const user = await db.user.findUnique({
        where: { email: "rishav@influencer.com" }
    });
    if (!user || !user.passwordHash) {
        console.log("User not found or no password hash");
        return;
    }
    const isValid = await bcrypt.compare("password123", user.passwordHash);
    console.log("Is password123 valid for rishav@influencer.com?", isValid);
}

main().catch(console.error);
