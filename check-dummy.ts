import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const targetId = "cmlgh1uhg0002zuwdkrk27e9v";

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: targetId },
                    { influencerProfile: { id: targetId } }
                ]
            },
            include: {
                influencerProfile: true
            }
        });

        if (!user) {
            console.log("RECORD_NOT_FOUND");
            return;
        }

        console.log("USER_ID:", user.id);
        console.log("EMAIL:", user.email);
        console.log("NAME:", user.name);
        console.log("ROLE:", user.role);
        if (user.influencerProfile) {
            console.log("INF_PROFILE_ID:", user.influencerProfile.id);
            console.log("NICHE:", user.influencerProfile.niche);
        }

        const isDummy =
            user.email.toLowerCase().includes('test') ||
            user.email.toLowerCase().includes('dummy') ||
            (user.name && user.name.toLowerCase().includes('test')) ||
            (user.name && user.name.toLowerCase().includes('dummy'));

        console.log("IS_DUMMY:", isDummy);

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
