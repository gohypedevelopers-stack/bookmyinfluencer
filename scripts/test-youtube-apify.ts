import { runApifyActor } from "@/lib/apify";

async function main() {
    const apifyToken = process.env.APIFY_TOKEN;
    const actorId = process.env.APIFY_YOUTUBE_ACTOR_ID;

    if (!apifyToken || !actorId) {
        console.error("Missing APIFY_TOKEN or APIFY_YOUTUBE_ACTOR_ID");
        return;
    }

    const url = "https://youtube.com/@rishavsvlog";

    const result = await runApifyActor({
        token: apifyToken,
        actorId: actorId,
        input: {
            startUrls: [{ url }],
            maxResults: 1
        },
        timeoutSecs: 180
    });

    if (result.error) {
        console.error("Error:", result.error);
        return;
    }

    console.log("Raw Apify Response:");
    console.log(JSON.stringify(result.data, null, 2));

    // Save to file for inspection
    const fs = require('fs');
    fs.writeFileSync('youtube-apify-response.json', JSON.stringify(result.data, null, 2));
    console.log("\nSaved to youtube-apify-response.json");
}

main();
