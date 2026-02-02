
import { db } from "@/lib/db";

async function main() {
    const email = "rishavrawat126@gmail.com";
    console.log(`Deleting user with email: ${email}`);

    try {
        await db.creator.deleteMany({ where: { email } }); // Clean up creator first just in case
        console.log("Deleted Creator (if any)");
    } catch (e) { console.log("Creator delete skipped/failed"); }

    try {
        await db.otpUser.delete({ where: { email } });
        console.log("Deleted OtpUser");
    } catch (e) { console.log("OtpUser delete skipped/failed"); }

    try {
        await db.user.delete({ where: { email } });
        console.log("Deleted User");
    } catch (e) { console.log("User delete skipped/failed"); }

    console.log("Cleanup complete.");
}

main();
