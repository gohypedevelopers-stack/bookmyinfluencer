
import { db } from "@/lib/db";

async function main() {
    console.log("--- DEBUGGING DATA ---");

    // 1. List all Campaigns
    const campaigns = await db.campaign.findMany({
        include: {
            brand: true,
            candidates: true
        }
    });
    console.log(`\nFound ${campaigns.length} Campaigns:`);
    campaigns.forEach(c => {
        console.log(`- [${c.id}] ${c.title} (Status: ${c.status}) (Brand: ${c.brand.companyName}) (Candidates: ${c.candidates.length})`);
    });

    // 2. List all Campaign Candidates
    const candidates = await db.campaignCandidate.findMany({
        include: {
            influencer: {
                include: { user: true }
            }
        }
    });
    console.log(`\nFound ${candidates.length} CampaignCandidates:`);
    candidates.forEach(c => {
        console.log(`- Campaign: ${c.campaignId} -> Influencer: ${c.influencer.user.email} (Status: ${c.status})`);
    });

    // 3. List all OtpUsers (Creators)
    const otpUsers = await db.otpUser.findMany();
    console.log(`\nFound ${otpUsers.length} OtpUsers:`);
    for (const u of otpUsers) {
        console.log(`- [${u.id}] ${u.email}`);

        // Check for Legacy User Link
        const legacyUser = await db.user.findUnique({
            where: { email: u.email },
            include: { influencerProfile: true }
        });

        if (legacyUser) {
            console.log(`  -> Linked to User: ${legacyUser.id} (${legacyUser.role})`);
            if (legacyUser.influencerProfile) {
                console.log(`  -> Has InfluencerProfile: ${legacyUser.influencerProfile.id}`);

                // Check candidates for this profile
                const myCandidates = await db.campaignCandidate.findMany({
                    where: { influencerId: legacyUser.influencerProfile.id }
                });
                console.log(`  -> Has ${myCandidates.length} candidate records.`);
            } else {
                console.log(`  -> NO InfluencerProfile.`);
            }
        } else {
            console.log(`  -> NO Legacy User found for email ${u.email}. Sync issue?`);
        }
    }
}

main();
