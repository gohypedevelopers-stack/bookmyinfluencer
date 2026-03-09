const { db } = require('./lib/db');

async function main() {
    const email = 'test_upsert_bug_' + Date.now() + '@example.com';
    try {
        console.log('Testing db.otpUser.upsert for email:', email);
        const user = await db.otpUser.upsert({
            where: { email },
            update: {},
            create: { email },
            select: {
                id: true,
                creator: {
                    select: { price: true }
                }
            },
        });
        console.log('Success! Upsert worked. User ID:', user.id);
    } catch (e) {
        console.error('Upsert failed with error:', e.message);
        console.error('Full error:', e);
    } finally {
        if (db.$disconnect) await db.$disconnect();
    }
}

main();
