import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const creators = await prisma.creator.findMany({
        select: {
            id: true,
            displayName: true,
            profileImageUrl: true,
            backgroundImageUrl: true,
            autoProfileImageUrl: true,
            email: true
        }
    });

    console.log("=== CREATORS ===");
    creators.forEach(c => {
        console.log(`Creator: ${c.displayName}`);
        console.log(`  Email: ${c.email}`);
        console.log(`  profileImageUrl: ${c.profileImageUrl}`);
        console.log(`  backgroundImageUrl: ${c.backgroundImageUrl}`);
    });

    const profiles = await prisma.influencerProfile.findMany({
        select: {
            id: true,
            userId: true,
            user: {
                select: {
                    name: true,
                    image: true,
                    email: true
                }
            }
        }
    });

    console.log("\n=== INFLUENCER PROFILES ===");
    profiles.forEach(p => {
        console.log(`Profile User: ${p.user?.name}`);
        console.log(`  Email: ${p.user?.email}`);
        console.log(`  image: ${p.user?.image}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
