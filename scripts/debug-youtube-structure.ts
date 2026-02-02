import { db } from "@/lib/db";
import { normalizeYoutubeMetrics } from "@/lib/metrics-util";

async function main() {
    const email = "rishavrawat126@gmail.com";

    const creator = await db.creator.findFirst({
        where: { email }
    });

    if (!creator?.rawSocialData) {
        console.log("No rawSocialData found");
        return;
    }

    try {
        const rawData = JSON.parse(creator.rawSocialData);
        console.log("=== RAW DATA STRUCTURE ===");
        console.log(JSON.stringify(rawData[0], null, 2));

        console.log("\n=== NORMALIZED METRICS ===");
        const normalized = normalizeYoutubeMetrics(rawData);
        console.log("Thumbnail URL:", normalized.thumbnailUrl);
        console.log("Title:", normalized.title);
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
