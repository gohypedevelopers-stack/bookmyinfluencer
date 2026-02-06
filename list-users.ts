import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
    console.log('All users in database:\n')

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
            influencerProfile: true,
            brandProfile: true
        }
    })

    users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`)
        console.log(`   Name: ${user.name}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Has Password: ${!!user.passwordHash}`)
        console.log(`   Has Influencer Profile: ${!!user.influencerProfile}`)
        console.log(`   Has Brand Profile: ${!!user.brandProfile}`)
        console.log('')
    })

    console.log(`Total users: ${users.length}`)

    await prisma.$disconnect()
}

listUsers().catch(console.error)
