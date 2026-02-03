
import { db } from "@/lib/db"

async function main() {
    const badCreatorId = "806fc1eb-82bd-4d67-b21e-006db1d2634d";
    const correctUrl = "https://www.youtube.com/@dheeraj_sorout1953";

    // Verify it's still the bad one
    const creator = await db.creator.findUnique({ where: { id: badCreatorId } });
    if (creator && creator.youtubeUrl === "https://www.youtube.com/@watch/about") {
        console.log("Found bad creator record. Updating...");
        await db.creator.update({
            where: { id: badCreatorId },
            data: { youtubeUrl: correctUrl }
        });
        console.log("Updated successfully to:", correctUrl);
    } else {
        console.log("Creator not found or URL already changed.");
        console.log("Current URL:", creator?.youtubeUrl);
    }
}

main().catch(console.error);
