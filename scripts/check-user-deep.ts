import { db } from "../lib/db";

async function main() {
    console.log("Checking dheerajsorout16500@gmail.com...");
    const u1 = await db.user.findUnique({
        where: { email: "dheerajsorout16500@gmail.com" },
        include: { influencerProfile: true }
    });
    console.log(u1);

    console.log("\nChecking creator01.demo@bookmyinfluencer.com...");
    const u2 = await db.user.findUnique({
        where: { email: "creator01.demo@bookmyinfluencer.com" },
        include: { influencerProfile: true }
    });
    console.log(u2);
}

main().catch(console.error);
