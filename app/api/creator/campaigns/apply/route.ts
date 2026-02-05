
import { db } from "@/lib/db";
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const creatorId = await getAuthenticatedCreatorId();
        if (!creatorId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { campaignId } = await req.json();

        // Resolve Creator Profile ID
        const otpUser = await db.otpUser.findUnique({
            where: { id: creatorId },
            include: { creator: true }
        });

        // Ensure verification
        if (otpUser?.creator?.verificationStatus !== 'APPROVED') {
            return new NextResponse("Verification Required", { status: 403 });
        }

        // Get Legacy Profile
        // Note: In refined architecture we should use otpUser.creator directly, 
        // but current schema links candidates to InfluecnerProfile (legacy).
        // We must find the linked legacy user.
        const legacyUser = await db.user.findUnique({
            where: { email: otpUser.email },
            include: { influencerProfile: true }
        });

        if (!legacyUser?.influencerProfile) {
            return new NextResponse("Influencer Profile Not Found", { status: 404 });
        }

        const influencerId = legacyUser.influencerProfile.id;

        // Check availability
        const existing = await db.campaignCandidate.findUnique({
            where: {
                campaignId_influencerId: {
                    campaignId,
                    influencerId
                }
            }
        });

        if (existing) {
            return new NextResponse("Already Applied", { status: 400 });
        }

        // Create Application
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

        // Notify Brand
        if (candidate.campaign.brand.userId) {
            await db.notification.create({
                data: {
                    userId: candidate.campaign.brand.userId,
                    type: "COLLAB_REQUEST",
                    title: "New Collaboration Request",
                    message: `${legacyUser.name || 'A Creator'} has requested to collaborate on ${candidate.campaign.title}`,
                    link: `/brand/campaigns?candidateId=${candidate.id}`, // Link to campaigns page, potentially focused on this candidate
                    read: false
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Apply Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
