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

        return NextResponse.json({
            success: true,
            verifications: pendingVerifications
        });

    } catch (error: any) {
        console.error('Error fetching pending verifications:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch verifications' },
            { status: 500 }
        );
    }
}
