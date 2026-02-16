
import { db } from "../lib/db";
import fs from "fs";

async function main() {
    const result: any = {
        creators: [],
        profiles: []
    };

    result.creators = await db.creator.findMany({
        where: {
            OR: [
                { displayName: { contains: "Lalit", mode: 'insensitive' } },
                { fullName: { contains: "Lalit", mode: 'insensitive' } },
                { displayName: { contains: "Rishav", mode: 'insensitive' } } // Added Rishav too
            ]
        },
        select: {
            id: true,
            userId: true,
            displayName: true,
            fullName: true,
            profileImageUrl: true,
            autoProfileImageUrl: true,
            backgroundImageUrl: true,
            verificationStatus: true
        }
    });

    result.profiles = await db.influencerProfile.findMany({
        where: {
            OR: [
                {
                    user: {
                        name: { contains: "Lalit", mode: 'insensitive' }
                    }
                },
                {
                    user: {
                        name: { contains: "Rishav", mode: 'insensitive' }
                    }
                }
            ]
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            }
        }
    });

    fs.writeFileSync("debug_result.json", JSON.stringify(result, null, 2));
    console.log("Done writing to debug_result.json");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
