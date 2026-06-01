import { db } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Upserting simulation test creator 'dheerajsorout02@gmail.com' in database...");
    
    const passwordHash = await bcrypt.hash("password123", 10);
    const email = "dheerajsorout02@gmail.com";

    // 1. Upsert User
    const user = await db.user.upsert({
        where: { email },
        update: {
            name: "Dheeraj Sorout",
            passwordHash,
            role: "INFLUENCER",
        },
        create: {
            email,
            name: "Dheeraj Sorout",
            passwordHash,
            role: "INFLUENCER",
        },
    });
    console.log("Upserted User:", user.id);

    // 2. Upsert OtpUser
    const otpUser = await db.otpUser.upsert({
        where: { email },
        update: {
            verifiedAt: new Date(),
        },
        create: {
            email,
            verifiedAt: new Date(),
        },
    });
    console.log("Upserted OtpUser:", otpUser.id);

    // 3. Upsert Creator
    const creator = await db.creator.upsert({
        where: { userId: otpUser.id },
        update: {
            email,
            fullName: "Dheeraj Sorout",
            niche: "Travel",
            instagramUrl: "https://www.instagram.com/official_dheeraj_jaat_",
            onboardingCompleted: true,
            verificationStatus: "APPROVED",
            priceStory: 1000,
            pricePost: 2500,
            priceCollab: 4000,
            price: 2500,
            priceType: "Per Post",
        },
        create: {
            userId: otpUser.id,
            email,
            fullName: "Dheeraj Sorout",
            niche: "Travel",
            instagramUrl: "https://www.instagram.com/official_dheeraj_jaat_",
            onboardingCompleted: true,
            verificationStatus: "APPROVED",
            priceStory: 1000,
            pricePost: 2500,
            priceCollab: 4000,
            price: 2500,
            priceType: "Per Post",
        },
    });
    console.log("Upserted Creator profile:", creator.id);

    // 4. Upsert InfluencerProfile
    const influencerProfile = await db.influencerProfile.upsert({
        where: { userId: user.id },
        update: {
            niche: "Travel",
            instagramHandle: "official_dheeraj_jaat_",
            followers: 12000,
            onboardingCompleted: true,
            priceStory: 1000,
            pricePost: 2500,
            priceCollab: 4000,
            price: 2500,
            priceType: "Per Post",
            pricing: JSON.stringify({
                story: 1000,
                post: 2500,
                collab: 4000,
            }),
            bio: "Travel influencer making creative content.",
        },
        create: {
            userId: user.id,
            niche: "Travel",
            instagramHandle: "official_dheeraj_jaat_",
            followers: 12000,
            onboardingCompleted: true,
            priceStory: 1000,
            pricePost: 2500,
            priceCollab: 4000,
            price: 2500,
            priceType: "Per Post",
            pricing: JSON.stringify({
                story: 1000,
                post: 2500,
                collab: 4000,
            }),
            bio: "Travel influencer making creative content.",
        },
    });
    console.log("Upserted InfluencerProfile:", influencerProfile.id);

    console.log("Simulation test user seeded successfully.");
}

main().catch(console.error);
