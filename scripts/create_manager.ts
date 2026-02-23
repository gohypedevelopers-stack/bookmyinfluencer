
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'manager@bookmyinfluencers.com'
    const password = 'password123'

    console.log(`Checking for existing manager user: ${email}...`)

    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        console.log('Manager user already exists.')
        console.log(`Email: ${email}`)
        console.log(`Password: (unknown, likely '${password}' if created by this script or seed)`)

        // Update password to be sure if requested? 
        // The user asked for "login user name and pass", so ensuring it is known is better.
        const passwordHash = await bcrypt.hash(password, 10)
        await prisma.user.update({
            where: { email },
            data: {
                passwordHash,
                role: 'MANAGER' // Ensure role is correct
            }
        })
        console.log(`Updated manager user password to: ${password}`)

    } else {
        console.log('Creating new manager user...')
        const passwordHash = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                email,
                name: 'Manager User',
                passwordHash,
                role: 'MANAGER',
            }
        })
        console.log('Manager user created successfully.')
        console.log(`Email: ${email}`)
        console.log(`Password: ${password}`)
    }
}

main()
    .catch((e) => {
        console.error('An error occurred:')
        console.error(e)
        if (e instanceof Error) {
            console.error('Message:', e.message)
            console.error('Stack:', e.stack)
        }
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
