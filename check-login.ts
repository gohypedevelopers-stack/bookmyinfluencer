import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkLogin() {
    const email = 'brand@nike.com'
    const testPassword = 'password123'

    console.log('Checking login for:', email)

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true
        }
    })

    if (!user) {
        console.log('❌ User not found in database!')
        return
    }

    console.log('✅ User found:')
    console.log('  - Email:', user.email)
    console.log('  - Name:', user.name)
    console.log('  - Role:', user.role)
    console.log('  - Has Password Hash:', !!user.passwordHash)

    if (user.passwordHash) {
        const isValid = await bcrypt.compare(testPassword, user.passwordHash)
        console.log('\n  - Password "password123" matches:', isValid ? '✅ YES' : '❌ NO')

        if (!isValid) {
            // Try alternative passwords
            const alternatives = ['BrandPassword123!', 'Gohype@2026', 'password']
            for (const altPwd of alternatives) {
                const matches = await bcrypt.compare(altPwd, user.passwordHash)
                if (matches) {
                    console.log(`  - Password "${altPwd}" matches: ✅ YES`)
                }
            }
        }
    }

    await prisma.$disconnect()
}

checkLogin().catch(console.error)
