import { db } from "./lib/db"

async function main() {
    try {
        const userCount = await db.user.count()
        console.log("✅ Database connection successful!")
        console.log("User count:", userCount)
        
        const influencers = await db.influencerProfile.count()
        console.log("Influencer count:", influencers)
    } catch (error: any) {
        console.error("❌ Database connection failed:", error.message)
    }
}

main()
