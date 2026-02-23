
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.campaignAssignment.count()
    console.log(`CampaignAssignments count: ${count}`)
    const assignments = await prisma.campaignAssignment.findMany()
    console.log('Assignments:', assignments)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
