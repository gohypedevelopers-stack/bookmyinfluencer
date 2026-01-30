import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Find the creator by userId
        const creator = await db.creator.findUnique({
            where: { userId },
            include: {
                metrics: {
                    orderBy: {
                        fetchedAt: 'desc'
                    },
                    take: 2
                }
            }
        });

        if (!creator) {
            return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        // Extract metrics
        const instagramMetric = creator.metrics.find(m => m.provider === 'instagram');
        const youtubeMetric = creator.metrics.find(m => m.provider === 'youtube');

        // Submit verification
        const submissionData = {
            creatorId: creator.id,
            instagramFollowers: instagramMetric?.followersCount || null,
            youtubeSubscribers: youtubeMetric?.followersCount || null,
            totalPosts: null, // Can be added later
            engagementRate: instagramMetric?.engagementRate || null
        };

        // Check if submission already exists
        const existingSubmission = await db.creatorKYCSubmission.findUnique({
            where: { creatorId: creator.id }
        });

        if (existingSubmission) {
            // Update existing
            await db.creatorKYCSubmission.update({
                where: { creatorId: creator.id },
                data: {
                    ...submissionData,
                    status: 'PENDING',
                    submittedAt: new Date()
                }
            });
        } else {
            // Create new
            await db.creatorKYCSubmission.create({
                data: submissionData
            });
        }

        // Update creator status
        await db.creator.update({
            where: { id: creator.id },
            data: { verificationStatus: 'PENDING' }
        });

        return NextResponse.json({
            success: true,
            message: 'Verification submitted successfully'
        });

    } catch (error: any) {
        console.error('Onboarding completion error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to complete onboarding' },
            { status: 500 }
        );
    }
}
