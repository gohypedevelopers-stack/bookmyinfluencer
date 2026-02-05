
import { db } from "../lib/db";
import { CampaignStatus } from "@prisma/client";

async function main() {
    console.log("Starting Debug: Create Campaign...");

    // 1. Find a Brand Profile
    const brand = await db.brandProfile.findFirst();

    if (!brand) {
        console.error("No Brand Profile found to test with.");
        return;
    }

    console.log(`Found Brand: ${brand.companyName} (${brand.id})`);

    // 2. Try to create a campaign with new fields
    try {
        // @ts-ignore - Ignoring type check to test runtime schema behavior if types are outdated
        const campaign = await db.campaign.create({
            data: {
                brandId: brand.id,
                title: "Debug Campaign " + new Date().toISOString(),
                description: "This is a test campaign from debug script.",
                requirements: "Debug requirements...",
                budget: 1000,
                status: CampaignStatus.ACTIVE,

                // New Fields
                paymentType: "FIXED",
                niche: "tech",
                location: "US",
                minFollowers: 5000
            }
        });

        console.log("SUCCESS: Campaign created successfully!");
        console.log("Campaign ID:", campaign.id);
        console.log("New Fields check:", {
            // @ts-ignore
            paymentType: campaign.paymentType,
            // @ts-ignore
            niche: campaign.niche
        });

    } catch (error) {
        console.error("FAILURE: Failed to create campaign.");
        console.error(error);
    }
}

main();
