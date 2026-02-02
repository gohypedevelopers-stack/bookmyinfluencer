
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const creator = await prisma.creator.findFirst()
    console.log('Creator with email:', creator)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
