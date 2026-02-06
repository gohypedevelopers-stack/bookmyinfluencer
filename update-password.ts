import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateToUserPassword() {
    const email = 'dheerajsorout02@gmail.com'
    const password = 'Dheeraj@1234'  // The password from the screenshot
    const passwordHash = await bcrypt.hash(password, 10)

    console.log('Updating account to match YOUR password...\n')

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
        await prisma.user.update({
            where: { email },
            data: { passwordHash }
        })
        console.log('✅ Password updated successfully!')
    } else {
        // Create new account
        await prisma.user.create({
            data: {
                email,
                name: 'Dheeraj Sorout',
                passwordHash,
                role: 'INFLUENCER',
                influencerProfile: {
                    create: {
                        niche: 'Content Creator',
                        instagramHandle: '@dheeraj',
                        followers: 50000,
                        pricing: JSON.stringify({ reel: 1000, story: 300 }),
                        bio: 'Content creator',
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
        console.log('✅ Account created!')
    }

    console.log('\n📝 YOUR EXACT CREDENTIALS:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n✅ Try logging in now - it WILL work!')

    await prisma.$disconnect()
}

updateToUserPassword().catch(console.error)
