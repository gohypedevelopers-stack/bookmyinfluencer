const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'creators'
        `;
        console.log('START_COLUMN_LIST');
        columns.forEach(c => console.log('COL:' + c.column_name));
        console.log('END_COLUMN_LIST');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
