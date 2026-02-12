
import { db } from "@/lib/db"

async function main() {
    try {
        const admins = await db.user.findMany({
            where: {
                role: 'ADMIN'
            },
            select: {
                email: true,
                name: true,
                role: true,
                passwordHash: true // I'll check if this is a hash or plain text (though it should be hashed)
            }
        })

        if (admins.length === 0) {
            console.log("No admin users found.")

            // precise fallback: check for any user to see if we can promote one or just list them
            const allUsers = await db.user.findMany({ take: 5 })
            console.log("Here are the first 5 users in the DB:")
            allUsers.forEach(u => console.log(`- ${u.email} (${u.role})`))
        } else {
            console.log("Admin users found:")
            admins.forEach(admin => {
                console.log(`Email: ${admin.email}`)
                console.log(`Name: ${admin.name}`)
                // We can't easily decrypt a hash, but sometimes dev passwords are 'password' or 'admin'
                // I'll just output that it exists.
                console.log(`Password Hash exists: ${!!admin.passwordHash}`)
            })
        }
    } catch (error) {
        console.error("Error fetching admins:", error)
    }
}

main()
