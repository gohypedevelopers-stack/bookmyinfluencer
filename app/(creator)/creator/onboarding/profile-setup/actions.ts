'use server'

import { db } from '@/lib/db'
import { getAuthenticatedCreatorId } from '@/lib/onboarding-auth'
import { normalizeSharedNiche } from '@/lib/onboarding-taxonomy'

export async function saveProfileSetup(data: {
    fullName: string
    platforms: string[]
    niche: string
    followerRange: string
    engagementRate: string
    executionReady: string
}) {
    const userId = await getAuthenticatedCreatorId()
    if (!userId) throw new Error('Unauthorized')

    // Ensure user exists
    const userExists = await db.otpUser.findUnique({ where: { id: userId } })
    if (!userExists) throw new Error('User not found')

    const normalizedNiche = normalizeSharedNiche(data.niche)

    await db.creator.upsert({
        where: { userId },
        update: {
            fullName: data.fullName || undefined,
            niche: normalizedNiche || undefined,
        },
        create: {
            userId,
            fullName: data.fullName || undefined,
            niche: normalizedNiche || undefined,
        },
    })

    return { success: true }
}

