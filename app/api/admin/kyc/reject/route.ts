import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendVerificationRejectedEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // Check if user is admin
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { submissionId, adminNotes } = body;

        if (!submissionId) {
            return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
        }

        // Get submission with creator details
        const submission = await db.creatorKYCSubmission.findUnique({
            where: { id: submissionId },
            include: {
                creator: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        // Update submission status
        await db.creatorKYCSubmission.update({
            where: { id: submissionId },
            data: {
                status: 'REJECTED',
                reviewedBy: session.user.id,
                reviewedAt: new Date(),
                adminNotes: adminNotes || null
            }
        });

        // Update creator verification status
        await db.creator.update({
            where: { id: submission.creatorId },
            data: {
                verificationStatus: 'REJECTED'
            }
        });

        // Send email notification
        try {
            await sendVerificationRejectedEmail(
                submission.creator.user.email,
                submission.creator.fullName || 'Creator',
                adminNotes
            );
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
            // Continue even if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Verification rejected'
        });

    } catch (error: any) {
        console.error('Rejection error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to reject verification' },
            { status: 500 }
        );
    }
}
