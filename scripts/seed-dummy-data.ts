import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding dummy accounts...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // --- Dummy Brand 1 ---
    const brandUser1 = await prisma.user.upsert({
        where: { email: 'brand1@example.com' },
        update: {},
        create: {
            email: 'brand1@example.com',
            name: 'Acme Corp Brand',
            passwordHash,
            role: 'BRAND',
            brandProfile: {
                create: {
                    companyName: 'Acme Corporation',
                    website: 'https://acme.example.com',
                    industry: 'Technology',
                    description: 'A leading technology company looking for creators to promote our new gadgets.',
                    location: 'San Francisco, CA',
                    onboardingCompleted: true,
                    walletBalance: 15000,
                },
            },
        },
    });
    console.log(`Created Brand: ${brandUser1.email}`);

    // --- Dummy Brand 2 ---
    const brandUser2 = await prisma.user.upsert({
        where: { email: 'brand2@example.com' },
        update: {},
        create: {
            email: 'brand2@example.com',
            name: 'Stellar Fashion Brand',
            passwordHash,
            role: 'BRAND',
            brandProfile: {
                create: {
                    companyName: 'Stellar Fashion',
                    website: 'https://stellar.example.com',
                    industry: 'Fashion & Apparel',
                    description: 'Trendy clothing brand seeking fashion influencers.',
                    location: 'New York, NY',
                    onboardingCompleted: true,
                    walletBalance: 5000,
                },
            },
        },
    });
    console.log(`Created Brand: ${brandUser2.email}`);

    // --- Dummy Creator 1 (Legacy / V1 Schema) ---
    const creatorUser1 = await prisma.user.upsert({
        where: { email: 'creator1@example.com' },
        update: {},
        create: {
            email: 'creator1@example.com',
            name: 'Tech Reviewer Tom',
            passwordHash,
            role: 'INFLUENCER',
            influencerProfile: {
                create: {
                    niche: 'Technology',
                    location: 'Austin, TX',
                    bio: 'I review the latest tech gadgets.',
                    instagramHandle: 'tech_tom_reviews',
                    youtubeHandle: 'TechTom',
                    followers: 150000,
                    engagementRate: 5.2,
                    pricePost: 500,
                    onboardingCompleted: true,
                },
            },
        },
    });
    console.log(`Created Legacy Creator: ${creatorUser1.email}`);

    // --- Dummy Creator 2 (V2 Schema - OtpUser & Creator models based on schema analysis) ---
    const otpCreator2 = await prisma.otpUser.upsert({
        where: { email: 'creator2@example.com' },
        update: {},
        create: {
            email: 'creator2@example.com',
            verifiedAt: new Date(),
            creator: {
                create: {
                    email: 'creator2@example.com',
                    fullName: 'Fashionista Fiona',
                    displayName: 'Fiona Styles',
                    niche: 'Fashion',
                    instagramUrl: 'https://instagram.com/fiona_styles',
                    bio: 'All about fashion and lifestyle.',
                    pricePost: 300,
                    onboardingCompleted: true,
                    verificationStatus: 'APPROVED'
                }
            }
        }
    });
    console.log(`Created V2 Creator: ${otpCreator2.email}`);

    // --- Dummy Creator 3 (V2 Schema) ---
    const otpCreator3 = await prisma.otpUser.upsert({
        where: { email: 'creator3@example.com' },
        update: {},
        create: {
            email: 'creator3@example.com',
            verifiedAt: new Date(),
            creator: {
                create: {
                    email: 'creator3@example.com',
                    fullName: 'Gamer Gary',
                    displayName: 'GG_Gary',
                    niche: 'Gaming',
                    youtubeUrl: 'https://youtube.com/GaryGaming',
                    bio: 'Let us play some games.',
                    pricePost: 800,
                    onboardingCompleted: true,
                    verificationStatus: 'APPROVED'
                }
            }
        }
    });
    console.log(`Created V2 Creator: ${otpCreator3.email}`);

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
