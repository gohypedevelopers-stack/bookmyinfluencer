import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const targetId = "cmlgh1uhg0002zuwdkrk27e9v";

    try {
        const profile = await prisma.influencerProfile.findUnique({
            where: { id: targetId },
            include: {
                applications: true,
                contracts: true,
                user: {
                    include: {
                        sentMessages: true,
                    }
                }
            }
        });

        if (!profile) {
            console.log("PROFILE_NOT_FOUND");
            return;
        }

        console.log("Applications:", profile.applications.length);
        console.log("Contracts:", profile.contracts.length);
        console.log("Messages Sent:", profile.user.sentMessages.length);

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
