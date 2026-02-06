import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAllLogins() {
    const testCredentials = [
        { email: 'dheerrajsorout02@gmail.com', password: 'password123', type: 'CREATOR' },
        { email: 'gohypemediatech@gmail.com', password: 'Gohype@2026', type: 'BRAND' },
        { email: 'brand@nike.com', password: 'password123', type: 'BRAND' }
    ]

    console.log('Testing login credentials...\n')
    console.log('='.repeat(60))

    for (const cred of testCredentials) {
        console.log(`\nTesting ${cred.type}: ${cred.email}`)
        console.log('-'.repeat(60))

        // Try exact match
        let user = await prisma.user.findUnique({
            where: { email: cred.email }
        })

        // Try lowercase
        if (!user) {
            user = await prisma.user.findUnique({
                where: { email: cred.email.toLowerCase() }
            })
        }

        if (!user) {
            console.log('❌ User NOT FOUND in database')
            continue
        }

        console.log('✅ User FOUND')
        console.log(`   Stored Email: ${user.email}`)
        console.log(`   Name: ${user.name}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Has Password Hash: ${!!user.passwordHash}`)

        if (user.passwordHash) {
            const match = await bcrypt.compare(cred.password, user.passwordHash)
            console.log(`   Password "${cred.password}" matches: ${match ? '✅ YES - LOGIN WILL WORK' : '❌ NO - LOGIN WILL FAIL'}`)
        } else {
            console.log('   ❌ NO PASSWORD HASH - LOGIN WILL FAIL')
        }
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n📋 SUMMARY OF WORKING CREDENTIALS:\n')

    for (const cred of testCredentials) {
        const user = await prisma.user.findUnique({
            where: { email: cred.email.toLowerCase() }
        })

        if (user && user.passwordHash) {
            const match = await bcrypt.compare(cred.password, user.passwordHash)
            if (match) {
                console.log(`✅ ${cred.type}:`)
                console.log(`   Email: ${cred.email}`)
                console.log(`   Password: ${cred.password}`)
                console.log('')
            }
        }
    }

    await prisma.$disconnect()
}

testAllLogins().catch(console.error)
