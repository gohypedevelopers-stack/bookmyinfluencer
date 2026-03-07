import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const creators = await prisma.creator.findMany({
        select: {
            id: true,
            verificationStatus: true,
            user: {
                select: {
                    email: true
                }
            }
        }
    });

    console.log(`Total creators: ${creators.length}`);
    creators.forEach((c: any) => {
        console.log(`- ${c.user?.email}: ${c.verificationStatus}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
