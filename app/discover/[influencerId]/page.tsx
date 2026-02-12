
import { db } from "@/lib/db";
import InfluencerProfileClient from "./InfluencerProfileClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InfluencerProfilePage({
    params,
}: {
    params: Promise<{ influencerId: string }>;
}) {
    // Make profile publicly viewable - no auth required
    // Handle session errors gracefully (e.g., invalid cookies)
    let session = null;
    try {
        session = await getServerSession(authOptions);
    } catch (error) {
        // Ignore session errors on public pages
        console.log('Session error (expected on public page):', error);
    }

    const { influencerId } = await params;

    // 1. Try to find in legacy InfluencerProfile table (by ID or UserID)
    let profileData = await db.influencerProfile.findFirst({
        where: { OR: [{ id: influencerId }, { userId: influencerId }] },
        include: {
            user: true,
            kyc: { select: { status: true } }
        }
    });

    let profile: any = profileData;
    if (profileData) {
        profile.kycStatus = profileData.kyc?.status || 'PENDING';
    }

    // 2. If not found, try to find in new Creator table (by ID or UserID)
    if (!profile) {
        const creator = await db.creator.findFirst({
            where: { OR: [{ id: influencerId }, { userId: influencerId }] },
            include: {
                user: true,
                metrics: {
                    orderBy: { date: 'desc' },
                    take: 1
                },
                selfReportedMetrics: {
                    take: 1
                }
            }
        });

        if (creator) {
            // Map Creator to InfluencerProfile-compatible format for the client component
            const latestMetric = creator.metrics[0];
            const followers = latestMetric?.followersCount
                || creator.selfReportedMetrics?.[0]?.followersCount
                || 0;

            // Extract username from Instagram URL if possible
            let handle = 'creator';
            if (creator.instagramUrl) {
                try {
                    const url = new URL(creator.instagramUrl);
                    handle = url.pathname.replace(/\//g, '') || 'creator';
                } catch {
                    handle = creator.instagramUrl.split('/').pop() || 'creator';
                }
            }

            profile = {
                id: creator.id,
                userId: creator.userId,
                instagramHandle: handle,
                youtubeChannel: creator.youtubeUrl || null,
                niche: creator.niche ? [creator.niche] : [],
                location: "India", // Default or could be extracted if added to model
                bio: creator.bio || "",
                followers: followers,
                engagementRate: latestMetric?.engagementRate || null,
                pricing: creator.pricing || null,
                bannerImage: creator.backgroundImageUrl || null,
                createdAt: creator.user.createdAt,
                updatedAt: creator.user.createdAt, // Fallback
                kycStatus: creator.verificationStatus,
                user: {
                    id: creator.userId,
                    name: creator.displayName || creator.fullName || "Creator",
                    email: creator.user.email,
                    image: creator.profileImageUrl || creator.autoProfileImageUrl || null,
                    emailVerified: creator.user.verifiedAt,
                    role: "INFLUENCER",
                    createdAt: creator.user.createdAt,
                    updatedAt: creator.user.createdAt,
                    passwordHash: null,
                    kycStatus: creator.verificationStatus as any,
                    lastSeenAt: null
                }
            } as any;
        }
    }

    if (!profile) {
        return <div className="p-10 text-center text-gray-500">
            <h2 className="text-xl font-semibold mb-2">Influencer not found</h2>
            <p>The profile you are looking for does not exist or has been removed.</p>
        </div>;
    }

    return <InfluencerProfileClient profile={profile} session={session} />;
}
