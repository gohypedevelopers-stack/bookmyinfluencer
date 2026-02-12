
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const db = new PrismaClient()

async function main() {
    const email = "admin@bookmyinfluencer.com"
    const password = "admin123"

    try {
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        console.log(`Connecting to DB...`)

        const user = await db.user.upsert({
            where: { email },
            update: {
                role: 'ADMIN',
                passwordHash
            },
            create: {
                email,
                name: "Admin User",
                role: 'ADMIN',
                passwordHash
            }
        })

        console.log(`Admin user created/updated successfully:`)
        console.log(`Email: ${user.email}`)
        console.log(`Password: ${password}`)
        console.log(`Role: ${user.role}`)

    } catch (error) {
        console.error("Error creating admin:", error)
    } finally {
        await db.$disconnect()
    }
}

main()
