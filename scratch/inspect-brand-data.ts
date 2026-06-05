import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const brand1 = await prisma.brandProfile.findUnique({
            where: { id: 'cmmk9azid00066dsjr696nvbu' },
            include: { user: true }
        });
        console.log("Brand 1 (Nike) User:", brand1?.user);

        const brand8 = await prisma.brandProfile.findUnique({
            where: { id: 'cmpz5lgxv0002dvq3tm484uyl' },
            include: { user: true }
        });
        console.log("Brand 8 (Nike) User:", brand8?.user);
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
check();
