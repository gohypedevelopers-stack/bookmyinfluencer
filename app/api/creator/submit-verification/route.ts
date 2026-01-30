import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { creatorId, instagramFollowers, youtubeSubscribers, totalPosts, engagementRate } = body;

        if (!creatorId) {
            return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
        }

        // Check if creator exists
        const creator = await db.creator.findUnique({
            where: { id: creatorId }
        });

        if (!creator) {
            return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        // Check if already submitted
        const existingSubmission = await db.creatorKYCSubmission.findUnique({
            where: { creatorId }
        });

        if (existingSubmission) {
            // Update existing submission
            const updatedSubmission = await db.creatorKYCSubmission.update({
                where: { creatorId },
                data: {
                    instagramFollowers: instagramFollowers || null,
                    youtubeSubscribers: youtubeSubscribers || null,
                    totalPosts: totalPosts || null,
                    engagementRate: engagementRate || null,
                    status: 'PENDING',
                    submittedAt: new Date()
                }
            });

            // Update creator status
            await db.creator.update({
                where: { id: creatorId },
                data: { verificationStatus: 'PENDING' }
            });

            return NextResponse.json({
                success: true,
                message: 'Verification updated successfully',
                submission: updatedSubmission
            });
        }

        // Create new submission
        const submission = await db.creatorKYCSubmission.create({
            data: {
                creatorId,
                instagramFollowers: instagramFollowers || null,
                youtubeSubscribers: youtubeSubscribers || null,
                totalPosts: totalPosts || null,
                engagementRate: engagementRate || null,
                status: 'PENDING'
            }
        });

        // Update creator status
        await db.creator.update({
            where: { id: creatorId },
            data: { verificationStatus: 'PENDING' }
        });

        return NextResponse.json({
            success: true,
            message: 'Verification submitted successfully',
            submission
        });

    } catch (error: any) {
        console.error('Verification submission error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit verification' },
            { status: 500 }
        );
    }
}
