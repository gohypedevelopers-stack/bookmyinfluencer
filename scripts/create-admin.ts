
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

async function main() {
    const email = "admin@bookmyinfluencer.com"
    const password = "admin123"

    try {
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

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

        console.log(`Admin user created/updated:`)
        console.log(`Email: ${user.email}`)
        console.log(`Password: ${password}`)
        console.log(`Role: ${user.role}`)

    } catch (error) {
        console.error("Error creating admin:", error)
    }
}

main()
