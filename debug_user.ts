
import { db } from "@/lib/db"
import fs from 'fs'

async function main() {
    const creators = await db.creator.findMany({
        where: {
            instagramUrl: {
                contains: "official_dheeraj_jaat_"
            }
        }
    })

    const output = creators.map(c => ({
        id: c.id,
        userId: c.userId,
        instagramUrl: c.instagramUrl,
        youtubeUrl: c.youtubeUrl,
        createdAt: c.id // UUID doesn't have timestamp, but maybe we have created_at?
    }));

    // Also check OtpUser for email to identify which is which
    for (const c of output) {
        const user = await db.otpUser.findUnique({ where: { id: c.userId } });
        (c as any).email = user?.email;
    }

    fs.writeFileSync('debug_output.json', JSON.stringify(output, null, 2));
    console.log("Done writing to debug_output.json");
}

main().catch(console.error);
