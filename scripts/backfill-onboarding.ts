
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
    console.log('🔄 Starting backfill of onboardingCompleted flag...')

    // 1. Backfill Brands
    console.log('🏢 Processing Brands...')
    // @ts-ignore
    const brands = await db.brandProfile.findMany({
        where: { onboardingCompleted: false } as any
    })

    console.log(`Found ${brands.length} brands with incomplete onboarding.`)

    for (const brand of brands) {
        // If brand has ANY data that suggests they existed before (e.g., website, companyName), mark as complete
        // For now, we will assume ALL existing brands should be marked complete to restore access
        // @ts-ignore
        await db.brandProfile.update({
            where: { id: brand.id },
            data: { onboardingCompleted: true } as any
        })
        console.log(`✅ Marked Brand ${brand.companyName || brand.id} as complete.`)
    }

    // 2. Backfill Creators
    console.log('🎨 Processing Creators...')
    // @ts-ignore
    const creators = await db.creator.findMany({
        where: { onboardingCompleted: false } as any
    })

    console.log(`Found ${creators.length} creators with incomplete onboarding.`)

    for (const creator of creators) {
        // @ts-ignore
        await db.creator.update({
            where: { id: creator.id },
            data: { onboardingCompleted: true } as any
        })
        console.log(`✅ Marked Creator ${creator.fullName || creator.id} as complete.`)
    }

    console.log('🎉 Backfill completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
