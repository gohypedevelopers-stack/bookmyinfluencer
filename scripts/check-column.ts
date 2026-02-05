
import { db } from "../lib/db";

async function main() {
    console.log("Checking DB Schema connection...");
    try {
        // Try to select the specific column. If it doesn't exist, it will throw.
        // Using quote identifiers to be safe with case sensitivity if applicable, though Prisma usually maps to lower case or mixed depending on DB.
        // Postgres implies sensitive if quoted. But let's try generic query.
        const result = await db.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Campaign' AND column_name = 'paymentType'`;
        console.log("Column Check Result:", result);

        // Also try to just select it from the table (might fail if table empty? No, header is checked)
        // const result2 = await db.$queryRaw`SELECT "paymentType" FROM "Campaign" LIMIT 1`; 
        // console.log("Select Result:", result2);

    } catch (error) {
        console.error("Check Failed:", error);
    }
}

main();
