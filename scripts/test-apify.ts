
import { fetchInstagramPublicStats } from "../lib/instagram-public";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const url = "https://www.instagram.com/official_rishav06/";
    const token = process.env.APIFY_TOKEN;
    const actorId = "apify/instagram-scraper"; // Official actor

    // Ensure logs dir
    if (!fs.existsSync('logs')) fs.mkdirSync('logs');

    try {
        console.log("Fetching...");
        const result = await fetchInstagramPublicStats(url, token as string, actorId as string);
        console.log("Result:", result);
        fs.writeFileSync('logs/apify-result.json', JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error("Global Error Caught");
        const errorLog = {
            message: error.message,
            stack: error.stack,
            type: error.type, // ApifyApiError has type
            details: error.details // Sometimes
        };
        fs.writeFileSync('logs/apify-error.json', JSON.stringify(errorLog, null, 2));
    }
}

main();
