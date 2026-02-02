import { db } from "@/lib/db";

async function main() {
    const email = "rishavrawat126@gmail.com";

    const creator = await db.creator.findFirst({
        where: { email },
        select: {
            autoProfileImageUrl: true,
            rawSocialData: true
        }
    });

    if (!creator) {
        console.log("No creator found");
        return;
    }

    console.log("=== Current Stored Profile Image ===");
    console.log(creator.autoProfileImageUrl);

    if (creator.rawSocialData) {
        console.log("\n=== Searching for YouTube avatar in rawSocialData ===");
        const raw = creator.rawSocialData;

        // Search for googleusercontent URLs
        const matches = raw.match(/https:\/\/yt3\.googleusercontent\.com\/[^\s"]+/g) || [];

        if (matches.length > 0) {
            console.log("Found YouTube avatar URLs:");
            matches.forEach((url, i) => {
                console.log(`${i + 1}. ${url}`);
            });
        } else {
            console.log("No yt3.googleusercontent.com URLs found");
        }

        // Also search for any avatar-related fields
        const avatarFields = raw.match(/"avatar[^"]*":\s*"[^"]+"/g) || [];
        console.log("\n=== Avatar-related fields ===");
        avatarFields.forEach(field => console.log(field));
    }
}

main();
