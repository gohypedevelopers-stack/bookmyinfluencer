import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all BrandProfiles...");
    const profiles = await prisma.brandProfile.findMany({
        include: {
            user: true,
            campaigns: true
        }
    });

    console.log(`Found ${profiles.length} brand profiles:`);
    for (const p of profiles) {
        console.log(`- ID: ${p.id}`);
        console.log(`  User ID: ${p.userId}`);
        console.log(`  Name: ${p.user?.name}`);
        console.log(`  Company: ${p.companyName}`);
        console.log(`  Logo/Image: ${p.user?.image}`);
        console.log(`  Campaigns count: ${p.campaigns.length}`);
        for (const c of p.campaigns) {
            console.log(`    * Campaign: "${c.title}" (Status: ${c.status}, Budget: ${c.budget})`);
        }
        console.log("");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
