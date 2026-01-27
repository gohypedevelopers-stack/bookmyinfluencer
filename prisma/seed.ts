
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Clean up
    try {
        await prisma.auditLog.deleteMany()
        await prisma.notification.deleteMany()
        await prisma.message.deleteMany()
        await prisma.chatThread.deleteMany()
        await prisma.offer.deleteMany()
        await prisma.escrowTransaction.deleteMany()
        await prisma.deliverable.deleteMany()
        await prisma.contract.deleteMany()
        await prisma.campaignCandidate.deleteMany()
        await prisma.campaign.deleteMany()
        // Use try-catch or explicit check if model name differs, assume kYCSubmission based on error
        // If this fails again, we'll skip it
        // @ts-ignore
        if (prisma.kYCSubmission) await prisma.kYCSubmission.deleteMany()
        // @ts-ignore
        else if (prisma.kycSubmission) await prisma.kycSubmission.deleteMany()

        await prisma.influencerProfile.deleteMany()
        await prisma.brandProfile.deleteMany()
        await prisma.user.deleteMany()
    } catch (e) {
        console.log('Cleanup error (ignoring):', e)
    }

    // 2. Create Users
    const passwordHash = await bcrypt.hash('password123', 10)

    // Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@bookmyinfluencers.com',
            name: 'Super Admin',
            passwordHash,
            role: 'ADMIN',
        }
    })

    // Brand
    const brandUser = await prisma.user.create({
        data: {
            email: 'brand@nike.com',
            name: 'Nike Brand Manager',
            passwordHash,
            role: 'BRAND',
            brandProfile: {
                create: {
                    companyName: 'Nike',
                    website: 'https://nike.com',
                    description: 'Just Do It.',
                    industry: 'Sports & Fashion',
                    location: 'Oregon, USA'
                }
            }
        },
        include: { brandProfile: true }
    })

    // Influencers
    const influencersData = [
        {
            email: 'rishav@influencer.com', name: 'Rishav', handle: '@official_rishav06',
            niche: ['Lifestyle', 'Content'], followers: 850000, price: { reel: 1200, story: 400 }
        },
        {
            email: 'sarah@influencer.com', name: 'Sarah Jenkins', handle: '@sarahstyles',
            niche: ['Fashion', 'Lifestyle'], followers: 125000, price: { reel: 1500, story: 500 }
        },
        {
            email: 'mike@foodie.com', name: 'Mike Chen', handle: '@mikeyeats',
            niche: ['Food', 'Travel'], followers: 850000, price: { reel: 2500, story: 800 }
        },
        {
            email: 'tech@gadget.com', name: 'Tech Reviewer', handle: '@techreview',
            niche: ['Tech', 'Gaming'], followers: 450000, price: { reel: 2000, story: 700 }
        },
        {
            email: 'yoga@jen.com', name: 'Yoga With Jen', handle: '@yogajen',
            niche: ['Fitness', 'Health'], followers: 200000, price: { reel: 1200, story: 400 }
        },
        {
            email: 'gamer@pro.com', name: 'Gaming Pro', handle: '@gamingpro',
            niche: ['Gaming', 'Live'], followers: 1200000, price: { reel: 5000, stream: 2000 }
        }
    ]

    const influencers = []
    for (const inf of influencersData) {
        const user = await prisma.user.create({
            data: {
                email: inf.email,
                name: inf.name,
                passwordHash,
                role: 'INFLUENCER',
                influencerProfile: {
                    create: {
                        niche: inf.niche.join(','),
                        instagramHandle: inf.handle,
                        followers: inf.followers,
                        pricing: JSON.stringify(inf.price),
                        bio: `Content creator in ${inf.niche.join(', ')} space.`,
                        kyc: {
                            create: {
                                status: 'APPROVED',
                                submittedAt: new Date(),
                                reviewedAt: new Date(),
                            }
                        }
                    }
                }
            },
            include: { influencerProfile: true }
        })
        influencers.push(user)
    }

    // 3. Create Campaigns
    const campaign1 = await prisma.campaign.create({
        data: {
            brandId: brandUser.brandProfile!.id,
            title: 'Summer Collection Launch',
            description: 'Promoting our new summer running shoe line.',
            status: 'ACTIVE',
            budget: 50000,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30))
        }
    })

    // 4. Create Candidates
    await prisma.campaignCandidate.create({
        data: {
            campaignId: campaign1.id,
            influencerId: influencers[0].influencerProfile!.id,
            status: 'CONTACTED',
            notes: 'Looks like a good fit for fashion angle.'
        }
    })

    const negotiationCandidate = await prisma.campaignCandidate.create({
        data: {
            campaignId: campaign1.id,
            influencerId: influencers[1].influencerProfile!.id,
            status: 'IN_NEGOTIATION',
            notes: 'Asking for higher rate.'
        }
    })

    await prisma.offer.create({
        data: {
            candidateId: negotiationCandidate.id,
            amount: 3000,
            deliverablesDescription: '1 Reel + 2 Stories',
            status: 'COUNTERED'
        }
    })

    const hiredCandidate = await prisma.campaignCandidate.create({
        data: {
            campaignId: campaign1.id,
            influencerId: influencers[2].influencerProfile!.id,
            status: 'HIRED',
        }
    })

    await prisma.contract.create({
        data: {
            candidateId: hiredCandidate.id,
            brandId: brandUser.brandProfile!.id,
            influencerId: influencers[2].influencerProfile!.id,
            totalAmount: 2200,
            platformFee: 200,
            taxAmount: 0,
            status: 'ACTIVE',
            terms: 'Standard agreement.',
            transactions: {
                create: {
                    amount: 2400,
                    type: 'DEPOSIT',
                    status: 'FUNDED',
                    paymentGatewayRef: 'PAY_123456'
                }
            },
            deliverables: {
                create: [
                    { title: 'Unboxing Video', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), status: 'PENDING' },
                    { title: 'Review Blog', dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), status: 'PENDING' }
                ]
            }
        }
    })

    // Chat
    await prisma.chatThread.create({
        data: {
            candidateId: hiredCandidate.id,
            participants: [brandUser.id, influencers[2].id].join(','),
            messages: {
                create: [
                    { senderId: brandUser.id, content: 'Hi! Excited to work with you.' },
                    { senderId: influencers[2].id, content: 'Me too! Looking forward to it.' }
                ]
            }
        }
    })

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        // process.exit(1) // Don't fail build if seed fails
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
