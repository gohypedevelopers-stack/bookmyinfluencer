import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Get all verified creators with their metrics
        const verifiedCreators = await db.creator.findMany({
            where: {
                verificationStatus: 'APPROVED'
            },
            include: {
                user: {
                    select: {
                        email: true
                    }
                },
                metrics: {
                    orderBy: {
                        fetchedAt: 'desc'
                    },
                    take: 2 // Latest Instagram and YouTube metrics
                },
                kycSubmission: true
            },
            orderBy: {
                verifiedAt: 'desc'
            }
        });

        // Transform data for frontend
        const creators = verifiedCreators.map(creator => {
            const instagramMetric = creator.metrics.find(m => m.provider === 'instagram');
            const youtubeMetric = creator.metrics.find(m => m.provider === 'youtube');

            return {
                id: creator.id,
                name: creator.fullName || 'Unknown',
                email: creator.user.email,
                niche: creator.niche || 'General',
                instagramUrl: creator.instagramUrl,
                youtubeUrl: creator.youtubeUrl,
                profileImage: creator.profileImageUrl || creator.autoProfileImageUrl,
                bio: creator.bio || creator.autoBio,
                followers: instagramMetric?.followersCount || 0,
                subscribers: youtubeMetric?.followersCount || 0,
                engagementRate: instagramMetric?.engagementRate || 0,
                verifiedAt: creator.verifiedAt
            };
        });

        return NextResponse.json({
            success: true,
            creators
        });

    } catch (error: any) {
        console.error('Error fetching verified creators:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch creators' },
            { status: 500 }
        );
    }
}
