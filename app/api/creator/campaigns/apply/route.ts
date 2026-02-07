
import { db } from "@/lib/db";
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        console.log('[Apply API] Starting application process...');

        const creatorId = await getAuthenticatedCreatorId();
        console.log('[Apply API] Creator ID:', creatorId);

        if (!creatorId) {
            console.log('[Apply API] No creator ID found - Unauthorized');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { campaignId } = await req.json();
        console.log('[Apply API] Campaign ID:', campaignId);

        // Resolve Creator Profile ID
        const otpUser = await db.otpUser.findUnique({
            where: { id: creatorId },
            include: { creator: true }
        });

        console.log('[Apply API] OtpUser found:', !!otpUser);
        console.log('[Apply API] Creator profile found:', !!otpUser?.creator);
        console.log('[Apply API] Verification status:', otpUser?.creator?.verificationStatus);

        // Ensure verification
        if (otpUser?.creator?.verificationStatus !== 'APPROVED') {
            console.log('[Apply API] Verification required');
            return NextResponse.json({
                error: "You must complete your profile verification before applying to campaigns"
            }, { status: 403 });
        }

        // Get Legacy Profile
        // Note: In refined architecture we should use otpUser.creator directly, 
        // but current schema links candidates to InfluecnerProfile (legacy).
        // We must find the linked legacy user.
        const legacyUser = await db.user.findUnique({
            where: { email: otpUser.email },
            include: { influencerProfile: true }
        });

        console.log('[Apply API] Legacy user found:', !!legacyUser);
        console.log('[Apply API] Influencer profile found:', !!legacyUser?.influencerProfile);

        if (!legacyUser?.influencerProfile) {
            console.log('[Apply API] Influencer profile not found');
            return NextResponse.json({
                error: "Influencer Profile Not Found"
            }, { status: 404 });
        }

        const influencerId = legacyUser.influencerProfile.id;
        console.log('[Apply API] Influencer ID:', influencerId);

        // Check availability
        const existing = await db.campaignCandidate.findUnique({
            where: {
                campaignId_influencerId: {
                    campaignId,
                    influencerId
                }
            }
        });

        console.log('[Apply API] Existing application:', !!existing);

        if (existing) {
            console.log('[Apply API] Already applied');
            return NextResponse.json({
                error: "You have already applied to this campaign"
            }, { status: 400 });
        }

        // Create Application
        console.log('[Apply API] Creating campaign candidate...');
        const candidate = await db.campaignCandidate.create({
            data: {
                campaignId,
                influencerId,
                status: 'CONTACTED',
                notes: 'Creator applied via marketplace.'
            },
            include: {
                campaign: {
                    include: { brand: true }
                }
            }
        });

        console.log('[Apply API] Campaign candidate created:', candidate.id);

        // Notify Brand
        if (candidate.campaign.brand.userId) {
            console.log('[Apply API] Notifying brand...');
            await db.notification.create({
                data: {
                    userId: candidate.campaign.brand.userId,
                    type: "COLLAB_REQUEST",
                    title: "New Collaboration Request",
                    message: `${legacyUser.name || 'A Creator'} has requested to collaborate on ${candidate.campaign.title}`,
                    link: `/brand/campaigns?candidateId=${candidate.id}`,
                    read: false
                }
            });
            console.log('[Apply API] Brand notified successfully');
        }

        console.log('[Apply API] Application completed successfully');
        return NextResponse.json({
            success: true,
            message: "Application submitted successfully"
        });

    } catch (error) {
        console.error("[Apply API] Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
