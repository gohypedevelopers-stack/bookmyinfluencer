import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function upsertCreator(input: {
    email: string
    name: string
    niche: string
    instagramHandle: string
    followers: number
    priceStory: number
    pricePost: number
    priceCollab: number
}) {
    const passwordHash = await bcrypt.hash('password123', 10)

    const user = await prisma.user.upsert({
        where: { email: input.email },
        update: {
            name: input.name,
            passwordHash,
            role: 'INFLUENCER',
        },
        create: {
            email: input.email,
            name: input.name,
            passwordHash,
            role: 'INFLUENCER',
        },
    })

    const otpUser = await prisma.otpUser.upsert({
        where: { email: input.email },
        update: { verifiedAt: new Date() },
        create: {
            email: input.email,
            verifiedAt: new Date(),
        },
    })

    await prisma.creator.upsert({
        where: { userId: otpUser.id },
        update: {
            email: input.email,
            fullName: input.name,
            niche: input.niche,
            instagramUrl: `https://instagram.com/${input.instagramHandle.replace(/^@/, '')}`,
            onboardingCompleted: true,
            verificationStatus: 'APPROVED',
            priceStory: input.priceStory,
            pricePost: input.pricePost,
            priceCollab: input.priceCollab,
            price: input.pricePost,
            priceType: 'Per Post',
            pricing: JSON.stringify({
                story: input.priceStory,
                post: input.pricePost,
                collab: input.priceCollab,
            }),
        },
        create: {
            userId: otpUser.id,
            email: input.email,
            fullName: input.name,
            niche: input.niche,
            instagramUrl: `https://instagram.com/${input.instagramHandle.replace(/^@/, '')}`,
            onboardingCompleted: true,
            verificationStatus: 'APPROVED',
            priceStory: input.priceStory,
            pricePost: input.pricePost,
            priceCollab: input.priceCollab,
            price: input.pricePost,
            priceType: 'Per Post',
            pricing: JSON.stringify({
                story: input.priceStory,
                post: input.pricePost,
                collab: input.priceCollab,
            }),
        },
    })

    const influencerProfile = await prisma.influencerProfile.upsert({
        where: { userId: user.id },
        update: {
            niche: input.niche,
            instagramHandle: input.instagramHandle,
            followers: input.followers,
            onboardingCompleted: true,
            priceStory: input.priceStory,
            pricePost: input.pricePost,
            priceCollab: input.priceCollab,
            price: input.pricePost,
            priceType: 'Per Post',
            pricing: JSON.stringify({
                story: input.priceStory,
                post: input.pricePost,
                collab: input.priceCollab,
            }),
            bio: `Content creator in ${input.niche} space.`,
        },
        create: {
            userId: user.id,
            niche: input.niche,
            instagramHandle: input.instagramHandle,
            followers: input.followers,
            onboardingCompleted: true,
            priceStory: input.priceStory,
            pricePost: input.pricePost,
            priceCollab: input.priceCollab,
            price: input.pricePost,
            priceType: 'Per Post',
            pricing: JSON.stringify({
                story: input.priceStory,
                post: input.pricePost,
                collab: input.priceCollab,
            }),
            bio: `Content creator in ${input.niche} space.`,
        },
    })

    await prisma.kYCSubmission.upsert({
        where: { profileId: influencerProfile.id },
        update: {
            status: 'APPROVED',
            submittedAt: new Date(),
            reviewedAt: new Date(),
        },
        create: {
            profileId: influencerProfile.id,
            status: 'APPROVED',
            submittedAt: new Date(),
            reviewedAt: new Date(),
        },
    })

    return { user, influencerProfile }
}

async function main() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Seed is disabled in production')
    }

    console.log('[seed] Bootstrapping fresh database data...')

    const adminPasswordHash = await bcrypt.hash('password123', 10)

    await prisma.user.upsert({
        where: { email: 'admin@bookmyinfluencers.com' },
        update: {
            name: 'Super Admin',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
        },
        create: {
            email: 'admin@bookmyinfluencers.com',
            name: 'Super Admin',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
        },
    })

    const brandPasswordHash = await bcrypt.hash('password123', 10)
    const brandUser = await prisma.user.upsert({
        where: { email: 'brand@nike.com' },
        update: {
            name: 'Nike Brand Manager',
            passwordHash: brandPasswordHash,
            role: 'BRAND',
        },
        create: {
            email: 'brand@nike.com',
            name: 'Nike Brand Manager',
            passwordHash: brandPasswordHash,
            role: 'BRAND',
        },
    })

    const brandProfile = await prisma.brandProfile.upsert({
        where: { userId: brandUser.id },
        update: {
            companyName: 'Nike',
            website: 'https://nike.com',
            description: 'Just Do It.',
            industry: 'Sports & Fashion',
            location: 'Oregon, USA',
            onboardingCompleted: true,
        },
        create: {
            userId: brandUser.id,
            companyName: 'Nike',
            website: 'https://nike.com',
            description: 'Just Do It.',
            industry: 'Sports & Fashion',
            location: 'Oregon, USA',
            onboardingCompleted: true,
        },
    })

    const creators = await Promise.all([
        upsertCreator({
            email: 'rishav@influencer.com',
            name: 'Rishav',
            niche: 'Lifestyle,Content',
            instagramHandle: '@official_rishav06',
            followers: 850000,
            priceStory: 400,
            pricePost: 1200,
            priceCollab: 1800,
        }),
        upsertCreator({
            email: 'sarah@influencer.com',
            name: 'Sarah Jenkins',
            niche: 'Fashion,Lifestyle',
            instagramHandle: '@sarahstyles',
            followers: 125000,
            priceStory: 500,
            pricePost: 1500,
            priceCollab: 2200,
        }),
        upsertCreator({
            email: 'mike@foodie.com',
            name: 'Mike Chen',
            niche: 'Food,Travel',
            instagramHandle: '@mikeyeats',
            followers: 850000,
            priceStory: 800,
            pricePost: 2500,
            priceCollab: 3200,
        }),
    ])

    const campaign = await prisma.campaign.upsert({
        where: { id: 'seed-summer-collection-launch' },
        update: {
            brandId: brandProfile.id,
            title: 'Summer Collection Launch',
            description: 'Promoting our new summer running shoe line.',
            status: 'ACTIVE',
            budget: 50000,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
        create: {
            id: 'seed-summer-collection-launch',
            brandId: brandProfile.id,
            title: 'Summer Collection Launch',
            description: 'Promoting our new summer running shoe line.',
            status: 'ACTIVE',
            budget: 50000,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
    })

    await prisma.campaignCandidate.upsert({
        where: { campaignId_influencerId: { campaignId: campaign.id, influencerId: creators[0].influencerProfile.id } },
        update: { status: 'CONTACTED', notes: 'Looks like a good fit for fashion angle.' },
        create: {
            campaignId: campaign.id,
            influencerId: creators[0].influencerProfile.id,
            status: 'CONTACTED',
            notes: 'Looks like a good fit for fashion angle.',
        },
    })

    const negotiationCandidate = await prisma.campaignCandidate.upsert({
        where: { campaignId_influencerId: { campaignId: campaign.id, influencerId: creators[1].influencerProfile.id } },
        update: { status: 'IN_NEGOTIATION', notes: 'Asking for higher rate.' },
        create: {
            campaignId: campaign.id,
            influencerId: creators[1].influencerProfile.id,
            status: 'IN_NEGOTIATION',
            notes: 'Asking for higher rate.',
        },
    })

    await prisma.offer.upsert({
        where: { candidateId: negotiationCandidate.id },
        update: {
            amount: 3000,
            deliverablesDescription: '1 Reel + 2 Stories',
            status: 'COUNTERED',
        },
        create: {
            candidateId: negotiationCandidate.id,
            amount: 3000,
            deliverablesDescription: '1 Reel + 2 Stories',
            status: 'COUNTERED',
        },
    })

    const hiredCandidate = await prisma.campaignCandidate.upsert({
        where: { campaignId_influencerId: { campaignId: campaign.id, influencerId: creators[2].influencerProfile.id } },
        update: { status: 'HIRED' },
        create: {
            campaignId: campaign.id,
            influencerId: creators[2].influencerProfile.id,
            status: 'HIRED',
        },
    })

    const contract = await prisma.contract.upsert({
        where: { candidateId: hiredCandidate.id },
        update: {
            brandId: brandProfile.id,
            influencerId: creators[2].influencerProfile.id,
            totalAmount: 2200,
            platformFee: 200,
            taxAmount: 0,
            status: 'ACTIVE',
            terms: 'Standard agreement.',
        },
        create: {
            candidateId: hiredCandidate.id,
            brandId: brandProfile.id,
            influencerId: creators[2].influencerProfile.id,
            totalAmount: 2200,
            platformFee: 200,
            taxAmount: 0,
            status: 'ACTIVE',
            terms: 'Standard agreement.',
        },
    })

    await prisma.escrowTransaction.upsert({
        where: { id: 'seed-escrow-transaction' },
        update: {
            contractId: contract.id,
            amount: 2400,
            type: 'DEPOSIT',
            status: 'FUNDED',
            paymentGatewayRef: 'PAY_123456',
        },
        create: {
            id: 'seed-escrow-transaction',
            contractId: contract.id,
            amount: 2400,
            type: 'DEPOSIT',
            status: 'FUNDED',
            paymentGatewayRef: 'PAY_123456',
        },
    })

    await prisma.deliverable.upsert({
        where: { id: 'seed-deliverable-unboxing' },
        update: {
            contractId: contract.id,
            title: 'Unboxing Video',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: 'PENDING',
        },
        create: {
            id: 'seed-deliverable-unboxing',
            contractId: contract.id,
            title: 'Unboxing Video',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: 'PENDING',
        },
    })

    await prisma.deliverable.upsert({
        where: { id: 'seed-deliverable-review-blog' },
        update: {
            contractId: contract.id,
            title: 'Review Blog',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
            status: 'PENDING',
        },
        create: {
            id: 'seed-deliverable-review-blog',
            contractId: contract.id,
            title: 'Review Blog',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
            status: 'PENDING',
        },
    })

    const thread = await prisma.chatThread.upsert({
        where: { candidateId: hiredCandidate.id },
        update: {
            participants: [brandUser.id, creators[2].user.id].join(','),
        },
        create: {
            candidateId: hiredCandidate.id,
            participants: [brandUser.id, creators[2].user.id].join(','),
        },
    })

    await prisma.message.upsert({
        where: { id: 'seed-message-brand' },
        update: {
            threadId: thread.id,
            senderId: brandUser.id,
            content: 'Hi! Excited to work with you.',
        },
        create: {
            id: 'seed-message-brand',
            threadId: thread.id,
            senderId: brandUser.id,
            content: 'Hi! Excited to work with you.',
        },
    })

    await prisma.message.upsert({
        where: { id: 'seed-message-creator' },
        update: {
            threadId: thread.id,
            senderId: creators[2].user.id,
            content: 'Me too! Looking forward to it.',
        },
        create: {
            id: 'seed-message-creator',
            threadId: thread.id,
            senderId: creators[2].user.id,
            content: 'Me too! Looking forward to it.',
        },
    })

    console.log('[seed] Fresh database bootstrap completed.')
}

main()
    .catch((e) => {
        console.error('[seed] failed', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
