import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Testing Prisma connection...");
    try {
        const count = await prisma.user.count();
        console.log(`Connection successful! User count: ${count}`);
    } catch (error) {
        console.error("Connection failed:", error);
        process.exit(1);
    }
}

main()
    .finally(() => prisma.$disconnect());
