import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixAccounts() {
    const adminEmail = 'admin@bookmyinfluencers.com'
    const brandEmail = 'gohypemediatech@gmail.com'
    const passwordHash = await bcrypt.hash('admin123', 10)

    console.log(`Setting password to 'admin123' for ${adminEmail} and ${brandEmail}`)

    await prisma.user.update({
        where: { email: adminEmail },
        data: { passwordHash }
    })

    await prisma.user.update({
        where: { email: brandEmail },
        data: { passwordHash }
    })

    console.log('Update complete.')
}

fixAccounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
