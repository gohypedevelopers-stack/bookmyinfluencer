import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
    const users = await prisma.user.findMany({
        select: { email: true, role: true }
    })
    console.log('--- Current Users in DB ---')
    users.forEach(u => console.log(`Email: ${u.email}, Role: ${u.role}`))
    console.log('---------------------------')
}

listUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
