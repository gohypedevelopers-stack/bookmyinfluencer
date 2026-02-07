import { db } from "@/lib/db";

async function main() {
    const email = "rishavrawat126@gmail.com";

    const creator = await db.creator.findFirst({
        where: { email },
        include: {
            metrics: {
                where: { provider: "youtube" },
                orderBy: { fetchedAt: 'desc' },
                take: 1
            }
        }
    });

    if (!creator) {
        console.log("No creator found");
        return;
    }

    console.log("\n=== Creator YouTube Data ===");
    console.log("YouTube URL:", creator.youtubeUrl);
    console.log("Profile Image:", creator.autoProfileImageUrl);

    if (creator.metrics && creator.metrics.length > 0) {
        console.log("\n=== Latest YouTube Metric ===");
        const metric = creator.metrics[0];
        console.log("Raw Response:");
        console.log(metric.rawResponse);
    }

    if (creator.rawSocialData) {
        console.log("\n=== Raw Social Data (first 500 chars) ===");
        console.log(creator.rawSocialData.substring(0, 500));
    }
}

main();
