import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const targetId = "cmlgh1uhg0002zuwdkrk27e9v";

    try {
        const inf = await prisma.influencerProfile.findUnique({
            where: { id: targetId },
            include: { user: true }
        });

        if (inf) {
            console.log("Found InfluencerProfile:");
            console.log("Email:", inf.user.email);
            console.log("Name:", inf.user.name);
            console.log("Niche:", inf.niche);
        } else {
            console.log("No profile found with ID:", targetId);
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
