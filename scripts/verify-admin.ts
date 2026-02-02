
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@bookmyinfluencers.com'
    console.log(`Checking user: ${email}`)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.error('User NOT FOUND in database.')
        return
    }

    console.log('User found:', user.id, user.role)
    console.log('Password Hash:', user.passwordHash)

    if (!user.passwordHash) {
        console.error('User has NO password hash.')
        return
    }

    const isValid = await bcrypt.compare('password123', user.passwordHash)
    console.log(`Password 'password123' valid? ${isValid}`)
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
