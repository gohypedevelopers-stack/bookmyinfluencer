import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Get all creators from the database
        const creators = await db.creator.findMany({
            include: {
                user: true,
                metrics: {
                    orderBy: { date: 'desc' },
                    take: 1
                }
            }
        });

        // Also get creators from InfluencerProfile (different auth system)
        const influencerProfiles = await db.influencerProfile.findMany({
            include: {
                user: true,
                kyc: true
            }
        });

        // Transform Creator data for public display
        const publicCreators = creators.map(creator => {
            const latestMetric = creator.metrics[0];
            // Extract handle from Instagram/YouTube URL
            let handle = '@creator';
            if (creator.instagramUrl) {
                const match = creator.instagramUrl.match(/instagram\.com\/([^/?\s]+)/);
                handle = match ? `@${match[1]}` : '@instagram';
            } else if (creator.youtubeUrl) {
                const match = creator.youtubeUrl.match(/@([^/?\s]+)/);
                handle = match ? `@${match[1]}` : '@youtube';
            }

            return {
                id: creator.id,
                name: creator.displayName || creator.fullName || 'Creator',
                handle: handle,
                niche: creator.niche || 'Creator',
                location: 'India',
                followers: latestMetric?.followersCount || 0,
                engagementRate: latestMetric ? Number((latestMetric.engagementRate).toFixed(1)) : 0,
                profileImage: creator.profileImageUrl || creator.autoProfileImageUrl || '',
                verified: creator.verificationStatus === 'APPROVED'
            };
        });

        // Transform InfluencerProfile data
        const influencerCreators = influencerProfiles.map(inf => ({
            id: inf.userId,
            name: inf.user.name || 'Creator',
            handle: inf.instagramHandle ? `@${inf.instagramHandle}` : '@creator',
            niche: Array.isArray(inf.niche) ? inf.niche.join(', ') : (inf.niche || 'Creator'),
            location: inf.location || 'India',
            followers: inf.followers || 0,
            engagementRate: inf.engagementRate || 0,
            profileImage: inf.user.image || '',
            verified: inf.kyc?.status === 'APPROVED'
        }));

        // Combine and deduplicate
        const allCreators = [...publicCreators, ...influencerCreators];

        return NextResponse.json({ creators: allCreators });
    } catch (error) {
        console.error("Failed to fetch public creators:", error);
        return NextResponse.json({ creators: [] }, { status: 500 });
    }
}
