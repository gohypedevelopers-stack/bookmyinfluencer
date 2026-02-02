import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        // Check if user is admin
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all pending verifications
        const pendingVerifications = await db.creatorKYCSubmission.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                creator: {
                    include: {
                        user: true,
                        metrics: {
                            orderBy: {
                                fetchedAt: 'desc'
                            },
                            take: 2 // Latest metrics for Instagram and YouTube
                        }
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        // Transform data to include calculated metrics
        const verifications = pendingVerifications.map((submission) => {
            const creator = submission.creator;

            // Get latest Instagram metrics
            const igMetric = creator.metrics.find(m => m.provider === 'instagram');
            // Get latest YouTube metrics
            const ytMetric = creator.metrics.find(m => m.provider === 'youtube');

            // Calculate total posts and engagement
            const totalPosts = (igMetric?.mediaCount || 0) + (ytMetric?.mediaCount || 0);

            // Calculate average engagement rate across platforms
            const allEngagementRates = creator.metrics
                .map(m => m.engagementRate)
                .filter(rate => rate > 0);
            const avgEngagement = allEngagementRates.length > 0
                ? allEngagementRates.reduce((a, b) => a + b, 0) / allEngagementRates.length
                : null;

            return {
                id: submission.id,
                submittedAt: submission.submittedAt,
                status: submission.status,
                instagramFollowers: igMetric?.followersCount || null,
                youtubeSubscribers: ytMetric?.followersCount || null,
                totalPosts: (totalPosts === 0 && !igMetric && !ytMetric) ? null : totalPosts,
                engagementRate: avgEngagement ? Number(avgEngagement.toFixed(2)) : null,
                creator: {
                    id: creator.id,
                    fullName: creator.fullName,
                    instagramUrl: creator.instagramUrl,
                    youtubeUrl: creator.youtubeUrl,
                    user: {
                        email: creator.user.email || 'No email'
                    },
                    metrics: creator.metrics
                }
            };
        });

        return NextResponse.json({
            success: true,
            verifications
        });

    } catch (error: any) {
        console.error('Error fetching pending verifications:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch verifications' },
            { status: 500 }
        );
    }
}
