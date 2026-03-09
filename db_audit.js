const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Comprehensive Column Check for "creators" ---');
        const columns = await prisma.$queryRaw`
            SELECT table_schema, table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'creators'
            ORDER BY table_schema, column_name;
        `;

        if (columns.length === 0) {
            console.log('No table named "creators" found in any schema.');
        } else {
            columns.forEach(c => {
                console.log(`${c.table_schema}.${c.table_name}.${c.column_name}: ${c.data_type}`);
            });
        }

        console.log('\n--- Checking current database and search path ---');
        const dbInfo = await prisma.$queryRaw`SELECT current_database(), current_schema(), current_user`;
        console.log(JSON.stringify(dbInfo, null, 2));

    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
