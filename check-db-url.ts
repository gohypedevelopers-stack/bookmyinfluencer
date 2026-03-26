import { db } from "./lib/db"

async function main() {
    console.log("🔍 Checking Database Connection...")
    console.log("DATABASE_URL:", process.env.DATABASE_URL)
    
    try {
        const userCount = await db.user.count()
        console.log("✅ Database connection successful!")
        console.log("📊 User count:", userCount)
        
        const influencers = await db.influencerProfile.count()
        console.log("📊 Influencer count:", influencers)
        
        // Check if we can find the admin user
        const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) {
            console.log("👤 Found Admin user:", admin.email)
        }
    } catch (error: any) {
        console.error("❌ Database connection failed!")
        console.error("Error message:", error.message)
        console.error("\nTIP: Since the database provider changed from PostgreSQL to SQLite,")
        console.error("you MUST restart your 'npm run dev' server to apply the changes.")
    }
}

main()
