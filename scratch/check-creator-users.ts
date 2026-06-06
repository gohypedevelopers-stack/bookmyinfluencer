import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Querying OtpUser and Creator tables...\n')

    const creators = await prisma.creator.findMany({
        include: {
            user: true
        }
    })

    creators.forEach((c, idx) => {
        console.log(`${idx + 1}. ID: ${c.id}`)
        console.log(`   Email: ${c.email}`)
        console.log(`   Full Name: ${c.fullName}`)
        console.log(`   Onboarding Completed: ${c.onboardingCompleted}`)
        console.log(`   OtpUser Email: ${c.user?.email}`)
        console.log(`   OtpUser Verified At: ${c.user?.verifiedAt}`)
        console.log('')
    })

    console.log(`Total creators: ${creators.length}`)

    await prisma.$disconnect()
}

main().catch(console.error)
