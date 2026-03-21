import { db, DEFAULT_TX_OPTIONS } from "../lib/db";

async function simulateTransaction(id: number) {
    console.log(`[Test ${id}] Starting transaction...`);
    try {
        await db.$transaction(async (tx) => {
            // Simulate some work
            await tx.user.findFirst();
            console.log(`[Test ${id}] Work in progress...`);
            // Adding a small delay to simulate real-world transaction duration
            await new Promise(resolve => setTimeout(resolve, 500));
            await tx.user.findFirst();
        }, DEFAULT_TX_OPTIONS);
        console.log(`[Test ${id}] COMPLETED.`);
        return true;
    } catch (error: any) {
        console.error(`[Test ${id}] FAILED:`, error.message);
        return false;
    }
}

async function runTests() {
    console.log("Starting concurrent transaction tests...");
    console.log("Using DEFAULT_TX_OPTIONS:", DEFAULT_TX_OPTIONS);
    
    // Run 5 concurrent transactions
    const results = await Promise.all([
        simulateTransaction(1),
        simulateTransaction(2),
        simulateTransaction(3),
        simulateTransaction(4),
        simulateTransaction(5)
    ]);

    const successCount = results.filter(r => r === true).length;
    console.log(`\nTests finished. Success: ${successCount}/5`);
    
    if (successCount === 5) {
        console.log("Verification PASSED.");
    } else {
        console.log("Verification FAILED.");
        process.exit(1);
    }
}

runTests()
    .catch(err => {
        console.error("Test execution failed:", err);
        process.exit(1);
    })
    .finally(() => db.$disconnect());
