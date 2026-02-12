import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
    // Replicate what getPublicCreators does
    const creators = await p.creator.findMany({
        include: {
            user: true,
            metrics: true,
            selfReportedMetrics: true
        },
        take: 50
    });
    console.log(`Creators found: ${creators.length}`);
    creators.forEach(c => {
        console.log(`  ${c.displayName || c.fullName} | user.email: ${(c as any).user?.email} | status: ${c.verificationStatus}`);
    });

    // Replicate InfluencerProfile query
    const influencerProfiles = await p.influencerProfile.findMany({
        include: { user: true },
        take: 50
    });
    console.log(`\nInfluencer Profiles found: ${influencerProfiles.length}`);
}
main().finally(() => p.$disconnect());
