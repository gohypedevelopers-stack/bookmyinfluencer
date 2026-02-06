import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAuth() {
    const email = 'gohypemediatech@gmail.com'
    const password = 'Gohype@2026'

    console.log('Testing authentication...\n')

    // Test 1: Check with exact email
    console.log('Test 1: Looking for user with email:', email)
    let user = await prisma.user.findUnique({
        where: { email }
    })

    if (user) {
        console.log('✅ User found with exact email')
        console.log('   Email:', user.email)
        console.log('   Role:', user.role)
    } else {
        console.log('❌ User NOT found with exact email')
    }

    // Test 2: Check with lowercase email
    console.log('\nTest 2: Looking for user with lowercase email:', email.toLowerCase())
    user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    })

    if (user) {
        console.log('✅ User found with lowercase email')
        console.log('   Stored Email:', user.email)
        console.log('   Role:', user.role)
        console.log('   Has Password:', !!user.passwordHash)

        if (user.passwordHash) {
            console.log('\nTest 3: Testing password...')
            const match = await bcrypt.compare(password, user.passwordHash)
            console.log('   Password "Gohype@2026" matches:', match ? '✅ YES' : '❌ NO')

            if (!match) {
                // Try some alternatives
                const alts = ['password123', 'Gohype@2026', 'gohype@2026']
                console.log('\n   Trying alternative passwords:')
                for (const alt of alts) {
                    const m = await bcrypt.compare(alt, user.passwordHash)
                    if (m) console.log(`   - "${alt}": ✅ MATCH`)
                }
            }
        }
    } else {
        console.log('❌ User NOT found with lowercase email')

        // List all users
        console.log('\nAll users in database:')
        const allUsers = await prisma.user.findMany({
            select: { email: true, role: true }
        })
        allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`))
    }

    await prisma.$disconnect()
}

testAuth().catch(console.error)
