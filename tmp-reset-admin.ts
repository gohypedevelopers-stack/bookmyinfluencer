import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdmin() {
    const adminEmail = 'admin@bookmyinfluencers.com'
    const adminPasswordHash = await bcrypt.hash('admin123', 10)

    console.log(`Checking admin user: ${adminEmail}`)

    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            name: 'Super Admin',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
        },
        create: {
            email: adminEmail,
            name: 'Super Admin',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
        },
    })

    console.log(`Admin user ${user.email} updated/created successfully. Role: ${user.role}`)
}

resetAdmin()
    .catch((e) => {
        console.error('Reset failed', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
