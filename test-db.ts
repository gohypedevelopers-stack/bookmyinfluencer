import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
    try {
        const count = await prisma.user.count()
        console.log('✅ Database connection successful!')
        console.log(`Total users: ${count}`)

        const influencers = await prisma.influencerProfile.count()
        console.log(`Total influencers: ${influencers}`)
    } catch (error) {
        console.error('❌ Database connection failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

test()
