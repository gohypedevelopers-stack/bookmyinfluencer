import { db } from "../lib/db";
import fs from "fs";

async function main() {
    const creators = await db.creator.findMany({
        select: { id: true, userId: true, email: true, displayName: true }
    });
    
    const profiles = await db.influencerProfile.findMany({
        select: { id: true, userId: true, user: { select: { email: true, name: true } } }
    });

    const output = {
        creators: creators.map(c => ({id: c.id, email: c.email, currentName: c.displayName})),
        profiles: profiles.map(p => ({id: p.id, email: p.user?.email, currentName: p.user?.name}))
    };

    fs.writeFileSync("real-emails.json", JSON.stringify(output, null, 2));
    console.log("Written to real-emails.json");
}

main().catch(console.error).finally(() => db.$disconnect());
