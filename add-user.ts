import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addUser() {
    const email = 'gohypemediatech@gmail.com'
    const password = 'Gohype@2026'
    const passwordHash = await bcrypt.hash(password, 10)

    // Check if user exists
    const existing = await prisma.user.findUnique({
        where: { email }
    })

    if (existing) {
        console.log('User already exists, updating password...')
        await prisma.user.update({
            where: { email },
            data: { passwordHash }
        })
        console.log('✅ Password updated for:', email)
    } else {
        console.log('Creating new user...')
        await prisma.user.create({
            data: {
                email,
                name: 'GoHype Media',
                passwordHash,
                role: 'BRAND',
                brandProfile: {
                    create: {
                        companyName: 'GoHype Media Tech',
                        website: 'https://gohype.com',
                        description: 'Digital Marketing Agency',
                        industry: 'Marketing',
                        location: 'India'
                    }
                }
            }
        })
        console.log('✅ User created:', email)
    }

    console.log('\n📝 Login credentials:')
    console.log('Email:', email)
    console.log('Password:', password)

    await prisma.$disconnect()
}

addUser().catch(console.error)
