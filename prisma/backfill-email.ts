
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Backfilling emails for creators...")

    // Get all creators
    const creators = await prisma.creator.findMany({
        include: { user: true }
    })

    let count = 0

    for (const creator of creators) {
        if (!creator.email && creator.user && creator.user.email) {
            console.log(`Updating creator ${creator.id} with email ${creator.user.email}`)

            await prisma.creator.update({
                where: { id: creator.id },
                data: {
                    email: creator.user.email
                }
            })
            count++
        }
    }

    console.log(`Backfilled ${count} creators.`)
}

main()
    .catch((e) => {
        console.error(e)
        // process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
