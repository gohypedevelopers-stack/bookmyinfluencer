import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createFreshAccounts() {
    console.log('Creating fresh test accounts...\n')

    const password = 'test123'
    const passwordHash = await bcrypt.hash(password, 10)

    // 1. Brand Account
    const brandEmail = 'testbrand@test.com'
    try {
        await prisma.user.delete({ where: { email: brandEmail } }).catch(() => { })

        const brand = await prisma.user.create({
            data: {
                email: brandEmail,
                name: 'Test Brand',
                passwordHash,
                role: 'BRAND',
                brandProfile: {
                    create: {
                        companyName: 'Test Company',
                        website: 'https://test.com',
                        description: 'Test brand account',
                        industry: 'Technology'
                    }
                }
            }
        })
        console.log('✅ Brand account created')
        console.log(`   Email: ${brandEmail}`)
        console.log(`   Password: ${password}`)
        console.log('')
    } catch (e) {
        console.log('❌ Brand account creation failed:', e.message)
    }

    // 2. Creator Account  
    const creatorEmail = 'testcreator@test.com'
    try {
        await prisma.user.delete({ where: { email: creatorEmail } }).catch(() => { })

        const creator = await prisma.user.create({
            data: {
                email: creatorEmail,
                name: 'Test Creator',
                passwordHash,
                role: 'INFLUENCER',
                influencerProfile: {
                    create: {
                        niche: 'Testing',
                        instagramHandle: '@testcreator',
                        followers: 10000,
                        pricing: JSON.stringify({ reel: 500, story: 200 }),
                        bio: 'Test creator account',
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
        console.log(`   Email: ${creatorEmail}`)
        console.log(`   Password: ${password}`)
        console.log('')
    } catch (e) {
        console.log('❌ Creator account creation failed:', e.message)
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n🎯 USE THESE TEST CREDENTIALS:')
    console.log('\nBrand Login:')
    console.log(`  Email: ${brandEmail}`)
    console.log(`  Password: ${password}`)
    console.log(`  URL: http://localhost:3000/brand/login`)

    console.log('\nCreator Login:')
    console.log(`  Email: ${creatorEmail}`)
    console.log(`  Password: ${password}`)
    console.log(`  URL: http://localhost:3000/login`)
    console.log('\n' + '='.repeat(60))

    await prisma.$disconnect()
}

createFreshAccounts().catch(console.error)
