
import { db } from "@/lib/db";

async function main() {
    console.log("Verifying Admin Data...");

    // Mock session check or bypass for script? 
    // The action checks session. We can't easily mock session in a script without setting up a lot.
    // Instead, let's just run the PRISMA query that the action runs, to verify it works.

    try {
        const campaigns = await db.campaign.findMany({
            include: {
                brand: { include: { user: true } },
                assignment: { include: { manager: true } },
                candidates: {
                    include: {
                        influencer: {
                            include: { user: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${campaigns.length} campaigns.`);

        if (campaigns.length > 0) {
            const c = campaigns[0];
            console.log("Sample Campaign:");
            console.log("Title:", c.title);
            console.log("Brand User:", c.brand?.user?.email);
            console.log("Assignment:", c.assignment);

            if (c.candidates.length > 0) {
                console.log("First Candidate User:", c.candidates[0].influencer?.user?.email);
            } else {
                console.log("No candidates in this campaign.");
            }
        } else {
            console.log("No campaigns found. Make sure seed data is present.");
        }

    } catch (error) {
        console.error("Error executing query:", error);
    }
}

main();
