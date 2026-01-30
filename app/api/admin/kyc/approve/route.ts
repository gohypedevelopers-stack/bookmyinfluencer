import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendVerificationApprovedEmail } from '@/lib/email';
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
                status: 'APPROVED',
                reviewedBy: session.user.id,
                reviewedAt: new Date(),
                adminNotes: adminNotes || null
            }
        });

        // Update creator verification status
        await db.creator.update({
            where: { id: submission.creatorId },
            data: {
                verificationStatus: 'APPROVED',
                verifiedAt: new Date()
            }
        });

        // Send email notification
        try {
            await sendVerificationApprovedEmail(
                submission.creator.user.email,
                submission.creator.fullName || 'Creator'
            );
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
            // Continue even if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Verification approved successfully'
        });

    } catch (error: any) {
        console.error('Approval error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to approve verification' },
            { status: 500 }
        );
    }
}
