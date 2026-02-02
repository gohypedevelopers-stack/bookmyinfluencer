
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@bookmyinfluencers.com'
    const newPassword = 'password123'

    console.log(`Resetting password for: ${email}`)

    const hash = await bcrypt.hash(newPassword, 10)

    const user = await prisma.user.update({
        where: { email },
        data: {
            passwordHash: hash
        }
    })

    console.log(`Password updated for user ID: ${user.id}`)

    // Verify immediately
    const valid = await bcrypt.compare(newPassword, user.passwordHash!)
    console.log(`Immediate verification: ${valid}`)
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
