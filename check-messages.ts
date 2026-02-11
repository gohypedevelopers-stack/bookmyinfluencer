import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const targetId = "cmlgh1uhg0002zuwdkrk27e9v";

    try {
        const profile = await prisma.influencerProfile.findUnique({
            where: { id: targetId },
            include: {
                user: {
                    include: {
                        sentMessages: {
                            take: 5,
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });

        if (profile && profile.user.sentMessages.length > 0) {
            console.log("Recent Messages:");
            profile.user.sentMessages.forEach(m => console.log(`- ${m.content}`));
        } else {
            console.log("No messages found.");
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
