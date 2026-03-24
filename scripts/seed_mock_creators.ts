import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding mock creators for carousel...');
    const dummyCreators = [
        {
            email: 'fashion.icon@example.com',
            displayName: 'Elena Rostova',
            niche: 'High Fashion & Luxury',
            followers: 1200000,
            engagement: 4.8,
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
        },
        {
            email: 'tech.guru@example.com',
            displayName: 'Marcus Chen',
            niche: 'Tech & Gadgets',
            followers: 850000,
            engagement: 6.2,
            image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80"
        },
        {
            email: 'fitness.pro@example.com',
            displayName: 'Sarah Jenkins',
            niche: 'Fitness & Wellness',
            followers: 2100000,
            engagement: 3.5,
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"
        },
        {
            email: 'travel.diary@example.com',
            displayName: 'Julian & Roe',
            niche: 'Travel & Lifestyle',
            followers: 430000,
            engagement: 8.1,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
        },
        {
            email: 'foodie.eats@example.com',
            displayName: 'Chef Mia',
            niche: 'Culinary Arts',
            followers: 670000,
            engagement: 5.4,
            image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80"
        }
    ];

    for (const data of dummyCreators) {
        // Prevent dupes
        const existing = await prisma.otpUser.findUnique({ where: { email: data.email } });
        if (existing) continue;

        const user = await prisma.otpUser.create({
            data: {
                email: data.email,
                verifiedAt: new Date(),
            }
        });

        const creator = await prisma.creator.create({
            data: {
                userId: user.id,
                email: data.email,
                displayName: data.displayName,
                fullName: data.displayName,
                niche: data.niche,
                profileImageUrl: data.image,
                verificationStatus: 'APPROVED',
            }
        });

        await prisma.creatorSelfReportedMetric.create({
            data: {
                creatorId: creator.id,
                provider: 'instagram',
                followersCount: data.followers
            }
        });

        await prisma.creatorMetric.create({
            data: {
                creatorId: creator.id,
                provider: 'instagram',
                followersCount: data.followers,
                engagementRate: data.engagement,
            }
        });
    }

    console.log('Seeded mock creators successfully.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
