import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createExactEmail() {
    const email = 'dheerajsorout02@gmail.com'  // EXACT email from logs (single 'r')
    const password = 'test123'
    const passwordHash = await bcrypt.hash(password, 10)

    console.log('Creating account for EXACT email from logs...\n')

    // Delete if exists
    await prisma.user.delete({ where: { email } }).catch(() => { })

    const user = await prisma.user.create({
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

    console.log('✅ Account created successfully!')
    console.log('\n📝 EXACT CREDENTIALS:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   URL: http://localhost:3000/login`)

    // Verify it works
    const verify = await prisma.user.findUnique({ where: { email } })
    console.log('\n✅ Verification:')
    console.log(`   User found: ${verify ? 'YES' : 'NO'}`)
    console.log(`   Has password: ${verify?.passwordHash ? 'YES' : 'NO'}`)

    if (verify?.passwordHash) {
        const match = await bcrypt.compare(password, verify.passwordHash)
        console.log(`   Password matches: ${match ? 'YES' : 'NO'}`)
    }

    await prisma.$disconnect()
}

createExactEmail().catch(console.error)
