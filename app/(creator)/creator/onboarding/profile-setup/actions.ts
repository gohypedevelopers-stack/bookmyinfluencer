'use server'

import { db } from '@/lib/db'
import { getAuthenticatedCreatorId } from '@/lib/onboarding-auth'

export async function saveProfileSetup(data: {
    fullName: string
    platforms: string[]
    niche: string
    followerRange: string
    engagementRate: string
    collaborationRate: string
}) {
    const userId = await getAuthenticatedCreatorId()
    if (!userId) throw new Error('Unauthorized')

    // Ensure user exists
    const userExists = await db.otpUser.findUnique({ where: { id: userId } })
    if (!userExists) throw new Error('User not found')

    await db.creator.upsert({
        where: { userId },
        update: {
            fullName: data.fullName || undefined,
            niche: data.niche || undefined,
            // Store extra profile setup data as JSON in pricing field temporarily
            // until schema has dedicated fields
        },
        create: {
            userId,
            fullName: data.fullName || undefined,
            niche: data.niche || undefined,
        },
    })

    return { success: true }
}
