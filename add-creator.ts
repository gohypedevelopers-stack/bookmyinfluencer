import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addCreator() {
    const email = 'dheerrajsorout02@gmail.com'
    const password = 'password123'
    const passwordHash = await bcrypt.hash(password, 10)

    // Check if user exists
    const existing = await prisma.user.findUnique({
        where: { email }
    })

    if (existing) {
        console.log('✅ User already exists:', email)
        console.log('   Role:', existing.role)

        // Update password if needed
        await prisma.user.update({
            where: { email },
            data: { passwordHash, role: 'INFLUENCER' }
        })
        console.log('✅ Password updated and role set to INFLUENCER')

        // Ensure influencer profile exists
        const profile = await prisma.influencerProfile.findUnique({
            where: { userId: existing.id }
        })

        if (!profile) {
            await prisma.influencerProfile.create({
                data: {
                    userId: existing.id,
                    niche: 'Content Creator',
                    instagramHandle: '@dheeraj_creator',
                    followers: 50000,
                    pricing: JSON.stringify({ reel: 1000, story: 300 }),
                    bio: 'Content creator and influencer',
                    kyc: {
                        create: {
                            status: 'APPROVED',
                            submittedAt: new Date(),
                            reviewedAt: new Date()
                        }
                    }
                }
            })
            console.log('✅ Influencer profile created')
        }
    } else {
        console.log('Creating new creator account...')
        await prisma.user.create({
            data: {
                email,
                name: 'Dheeraj Sorout',
                passwordHash,
                role: 'INFLUENCER',
                influencerProfile: {
                    create: {
                        niche: 'Content Creator',
                        instagramHandle: '@dheeraj_creator',
                        followers: 50000,
                        pricing: JSON.stringify({ reel: 1000, story: 300 }),
                        bio: 'Content creator and influencer',
                        kyc: {
                            create: {
                                status: 'APPROVED',
                                submittedAt: new Date(),
                                reviewedAt: new Date()
                            }
                        }
                    }
                }
            }
        })
        console.log('✅ Creator account created')
    }

    console.log('\n📝 Login credentials:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('URL: http://localhost:3000/login')

    await prisma.$disconnect()
}

addCreator().catch(console.error)
