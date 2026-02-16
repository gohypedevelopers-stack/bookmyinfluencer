
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Check if we can access payouts on valid Campaign include types
    const campaign = await prisma.campaign.findFirst({
        include: {
            payouts: true
        }
    });
    console.log("Successfully included payouts");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
