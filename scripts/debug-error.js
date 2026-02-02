
const { runApifyActor } = require('../lib/apify');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    console.log("Starting debug...");
    const url = "https://www.instagram.com/official_rishav06/";
    const token = process.env.APIFY_TOKEN;
    const actorId = process.env.APIFY_INSTAGRAM_ACTOR_ID || "scraper-engine/instagram-profile-scraper";

    // Replicate fetchInstagramPublicStats logic roughly
    let username = "official_rishav06";

    try {
        const input = { usernames: [username] };
        console.log("Running actor:", actorId);

        // Using apify-client directly to skip lib issues if any
        const { ApifyClient } = require('apify-client');
        const client = new ApifyClient({ token: token });
        const run = await client.actor(actorId).call(input);

        console.log("Run finished:", run.status);
        if (run.status !== 'SUCCEEDED') {
            fs.writeFileSync('error_clean.txt', `Run failed: ${run.status}`);
            return;
        }

        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        fs.writeFileSync('error_clean.txt', `Success! Items: ${items.length}\n${JSON.stringify(items[0], null, 2)}`);

    } catch (error) {
        console.error("Caught error");
        fs.writeFileSync('error_clean.txt', `Stack: ${error.stack}\nMessage: ${error.message}\nType: ${error.type}`);
    }
}

main();
