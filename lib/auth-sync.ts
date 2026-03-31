import { Prisma } from "@prisma/client"

import { db } from "@/lib/db"
import { UserRole } from "@/lib/enums"

type EnsureCreatorAuthUserInput = {
  email: string
  name?: string | null
  passwordHash?: string | null
  image?: string | null
  otpVerifiedAt?: Date | null
}

type CreatorProfileInput = {
  fullName?: string | null
  phone?: string | null
  niche?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  platforms?: string | null
  pricing?: string | null
  rawSocialData?: string | null
  price?: number | null
  priceStory?: number | null
  pricePost?: number | null
  priceCollab?: number | null
  priceType?: string | null
  location?: string | null
  followersCount?: number | null
  engagementRate?: number | null
  onboardingCompleted?: boolean
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function ensureCreatorAuthUser(input: EnsureCreatorAuthUserInput) {
  const email = normalizeEmail(input.email)

  return db.$transaction(async (tx) => {
    const otpUser = await tx.otpUser.upsert({
      where: { email },
      update: input.otpVerifiedAt ? { verifiedAt: input.otpVerifiedAt } : {},
      create: {
        email,
        ...(input.otpVerifiedAt ? { verifiedAt: input.otpVerifiedAt } : {}),
      },
      select: { id: true, email: true, verifiedAt: true },
    })

    const user = await tx.user.upsert({
      where: { email },
      update: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.passwordHash !== undefined ? { passwordHash: input.passwordHash } : {}),
        ...(input.image !== undefined ? { image: input.image } : {}),
        role: UserRole.INFLUENCER,
      },
      create: {
        email,
        name: input.name ?? null,
        passwordHash: input.passwordHash ?? null,
        image: input.image ?? null,
        role: UserRole.INFLUENCER,
      },
      select: { id: true, email: true },
    })

    return { otpUser, user }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  })
}

export async function syncCreatorProfileByEmail(email: string, profile: CreatorProfileInput) {
  const normalizedEmail = normalizeEmail(email)

  return db.$transaction(async (tx) => {
    const otpUser = await tx.otpUser.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    const user = await tx.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (!otpUser || !user) {
      throw new Error(`[AUTH_SYNC] Missing auth records for creator email: ${normalizedEmail}`)
    }

    const creator = await tx.creator.upsert({
      where: { userId: otpUser.id },
      update: {
        ...(profile.fullName !== undefined ? { fullName: profile.fullName } : {}),
        ...(profile.phone !== undefined ? { phone: profile.phone } : {}),
        ...(profile.niche !== undefined ? { niche: profile.niche } : {}),
        ...(profile.instagramUrl !== undefined ? { instagramUrl: profile.instagramUrl } : {}),
        ...(profile.youtubeUrl !== undefined ? { youtubeUrl: profile.youtubeUrl } : {}),
        ...(profile.platforms !== undefined ? { platforms: profile.platforms } : {}),
        ...(profile.pricing !== undefined ? { pricing: profile.pricing } : {}),
        ...(profile.rawSocialData !== undefined ? { rawSocialData: profile.rawSocialData } : {}),
        ...(profile.price !== undefined ? { price: profile.price } : {}),
        ...(profile.priceStory !== undefined ? { priceStory: profile.priceStory } : {}),
        ...(profile.pricePost !== undefined ? { pricePost: profile.pricePost } : {}),
        ...(profile.priceCollab !== undefined ? { priceCollab: profile.priceCollab } : {}),
        ...(profile.priceType !== undefined ? { priceType: profile.priceType } : {}),
        ...(profile.onboardingCompleted !== undefined ? { onboardingCompleted: profile.onboardingCompleted } : {}),
        email: normalizedEmail,
      },
      create: {
        userId: otpUser.id,
        email: normalizedEmail,
        fullName: profile.fullName ?? null,
        phone: profile.phone ?? null,
        niche: profile.niche ?? null,
        instagramUrl: profile.instagramUrl ?? null,
        youtubeUrl: profile.youtubeUrl ?? null,
        platforms: profile.platforms ?? null,
        pricing: profile.pricing ?? null,
        rawSocialData: profile.rawSocialData ?? null,
        price: profile.price ?? null,
        priceStory: profile.priceStory ?? null,
        pricePost: profile.pricePost ?? null,
        priceCollab: profile.priceCollab ?? null,
        priceType: profile.priceType ?? "Per Post",
        onboardingCompleted: profile.onboardingCompleted ?? false,
      },
      select: { id: true, userId: true, verificationStatus: true, onboardingCompleted: true },
    })

    await tx.influencerProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(profile.niche !== undefined ? { niche: profile.niche || "General" } : {}),
        ...(profile.location !== undefined ? { location: profile.location } : {}),
        ...(profile.instagramUrl !== undefined
          ? { instagramHandle: profile.instagramUrl ? profile.instagramUrl.split("/").filter(Boolean).pop() ?? profile.instagramUrl : null }
          : {}),
        ...(profile.youtubeUrl !== undefined
          ? { youtubeHandle: profile.youtubeUrl ? profile.youtubeUrl.split("/").filter(Boolean).pop() ?? profile.youtubeUrl : null }
          : {}),
        ...(profile.platforms !== undefined ? { platforms: profile.platforms } : {}),
        ...(profile.pricing !== undefined ? { pricing: profile.pricing } : {}),
        ...(profile.rawSocialData !== undefined ? { socialData: profile.rawSocialData } : {}),
        ...(profile.price !== undefined ? { price: profile.price } : {}),
        ...(profile.priceStory !== undefined ? { priceStory: profile.priceStory } : {}),
        ...(profile.pricePost !== undefined ? { pricePost: profile.pricePost } : {}),
        ...(profile.priceCollab !== undefined ? { priceCollab: profile.priceCollab } : {}),
        ...(profile.priceType !== undefined ? { priceType: profile.priceType } : {}),
        ...(profile.followersCount !== undefined ? { followers: profile.followersCount ?? 0 } : {}),
        ...(profile.engagementRate !== undefined ? { engagementRate: profile.engagementRate ?? 0 } : {}),
        ...(profile.onboardingCompleted !== undefined ? { onboardingCompleted: profile.onboardingCompleted } : {}),
      },
      create: {
        userId: user.id,
        niche: profile.niche || "General",
        location: profile.location ?? null,
        instagramHandle: profile.instagramUrl ? profile.instagramUrl.split("/").filter(Boolean).pop() ?? profile.instagramUrl : null,
        youtubeHandle: profile.youtubeUrl ? profile.youtubeUrl.split("/").filter(Boolean).pop() ?? profile.youtubeUrl : null,
        platforms: profile.platforms ?? null,
        pricing: profile.pricing ?? null,
        socialData: profile.rawSocialData ?? null,
        price: profile.price ?? null,
        priceStory: profile.priceStory ?? null,
        pricePost: profile.pricePost ?? null,
        priceCollab: profile.priceCollab ?? null,
        priceType: profile.priceType ?? "Per Post",
        followers: profile.followersCount ?? 0,
        engagementRate: profile.engagementRate ?? 0,
        onboardingCompleted: profile.onboardingCompleted ?? false,
      },
      select: { id: true, userId: true },
    })

    return { otpUser, user, creator }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  })
}
