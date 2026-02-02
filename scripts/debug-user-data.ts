
import { db } from "@/lib/db";

async function main() {
    const email = "rishavrawat126@gmail.com";
    console.log(`Checking data for: ${email}`);

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        console.log("User not found in User table");
        return;
    }

    const creator = await db.creator.findFirst({ where: { email } });
    if (!creator) {
        console.log("Creator record not found");
    } else {
        console.log("Creator Found:");
        console.log(`- ID: ${creator.id}`);
        console.log(`- UserId: ${creator.userId}`);
        console.log(`- Instagram URL: '${creator.instagramUrl}'`);
        console.log(`- YouTube URL: '${creator.youtubeUrl}'`);
    }
}

main();
