import { db } from "../lib/db";
import fs from "fs";

async function main() {
    const creators = await db.creator.findMany({
        select: { id: true, displayName: true, verificationStatus: true, pricing: true }
    });

    const profiles = await db.influencerProfile.findMany({
        select: { id: true, pricing: true, user: { select: { name: true } } }
    });

    fs.writeFileSync("db_creators_output.json", JSON.stringify({ creators, profiles }, null, 2));
    console.log("Wrote to db_creators_output.json");
}

main().catch(console.error).finally(() => db.$disconnect());
