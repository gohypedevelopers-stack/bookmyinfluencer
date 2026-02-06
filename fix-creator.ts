import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixCreator() {
    // Search for variations of the email
    const variations = [
        'dheerajsorout02@gmail.com',
        'dheerrajsorout02@gmail.com',
        'dheerjsorout02@gmail.com'
    ]

    console.log('Searching for user...\n')

    for (const email of variations) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { influencerProfile: true }
        })

        if (user) {
            console.log('✅ Found user:', email)
            console.log('   Role:', user.role)
            console.log('   Has Profile:', !!user.influencerProfile)
            console.log('   Has Password:', !!user.passwordHash)

            // Update to correct email and ensure password
            const correctEmail = 'dheerrajsorout02@gmail.com'
            const password = 'password123'
            const passwordHash = await bcrypt.hash(password, 10)

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    email: correctEmail,
                    passwordHash,
                    role: 'INFLUENCER'
                }
            })

            console.log('\n✅ Updated to:', correctEmail)
            console.log('   Password: password123')
            return
        }
    }

    // If not found, create new
    console.log('❌ User not found. Creating new account...\n')
    const email = 'dheerrajsorout02@gmail.com'
    const password = 'password123'
    const passwordHash = await bcrypt.hash(password, 10)

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

    console.log('✅ Creator account created!')
    console.log('\n📝 Login credentials:')
    console.log('Email:', email)
    console.log('Password:', password)

    await prisma.$disconnect()
}

fixCreator().catch(console.error)
