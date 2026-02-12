import { db } from "../lib/db";
import fs from "fs";

async function run() {
    try {
        await db.$executeRawUnsafe("UPDATE creator_kyc_submissions SET selfie_image_key = 'kyc/selfie/mock-monty.jpg', liveness_prompt = 'SMILE', liveness_result = 'PASSED' WHERE creator_id = '66957964-b1f8-4c59-ac72-85a54015518a'");
        console.log("REPAIRED_MONTY");
    } catch (e) {
        console.error("RAW_ERROR:", e);
    } finally {
        process.exit(0);
    }
}

run();
