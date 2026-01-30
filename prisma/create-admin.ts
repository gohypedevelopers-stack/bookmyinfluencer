import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "admin@bookmyinfluencer.com"
    const password = "admin" // Simple password for dev
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: "ADMIN", // Ensure role is updated if user exists
            passwordHash: hashedPassword // Reset password to known one
        },
        create: {
            email,
            name: "Master Admin",
            passwordHash: hashedPassword,
            role: "ADMIN",
        },
    })

    console.log("Admin user created successfully.")
    console.log("--------------------------------")
    console.log(`Email:    ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Role:     ${user.role}`)
    console.log("--------------------------------")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
