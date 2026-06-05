
import { db } from "@/lib/db";
import InfluencerProfileClient from "../../../discover/[influencerId]/InfluencerProfileClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    isVisibleCreatorProfile,
    isVisibleInfluencerProfile,
    visibleCreatorWhereWith,
    visibleInfluencerProfileWhereWith,
} from "@/lib/profile-visibility";

export const dynamic = "force-dynamic";

export default async function CreatorPublicProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    let session = null;
    try {
        session = await getServerSession(authOptions);
    } catch (error) {
        console.log('Session error:', error);
    }

    const { id: influencerId } = await params;

    // Try to find in Creator table (standard for new system)
    let creator = await db.creator.findFirst({
        where: visibleCreatorWhereWith({ OR: [{ id: influencerId }, { userId: influencerId }] }),
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

    if (creator && !isVisibleCreatorProfile(creator)) {
        creator = null;
    }

    if (!creator) {
        // Fallback to legacy InfluencerProfile
        const legacyProfile = await db.influencerProfile.findFirst({
            where: visibleInfluencerProfileWhereWith({ OR: [{ id: influencerId }, { userId: influencerId }] }),
            include: {
                user: true,
                kyc: { select: { status: true } }
            }
        });

        if (legacyProfile && isVisibleInfluencerProfile(legacyProfile)) {
            const profile = {
                ...legacyProfile,
                kycStatus: legacyProfile.kyc?.status || 'PENDING',
                saved: false
            };

            // Check saved status
            if ((session?.user as any)?.role === 'BRAND' && session?.user?.id) {
                const brand = await db.brandProfile.findUnique({ where: { userId: session.user.id } });
                if (brand) {
                    // @ts-ignore
                    const isSaved = await db.savedInfluencer.findUnique({
                        where: {
                            brandId_influencerId: {
                                brandId: brand.id,
                                influencerId: legacyProfile.id
                            }
                        }
                    });
                    profile.saved = !!isSaved;
                }
            }

            return <InfluencerProfileClient profile={profile as any} session={session} />;
        }

        return <div className="p-10 text-center text-gray-500">
            <h2 className="text-xl font-semibold mb-2">Creator not found</h2>
            <p>The profile you are looking for does not exist or has been removed.</p>
        </div>;
    }

    // Map Creator to InfluencerProfile format
    const latestMetric = creator.metrics[0];
    const followers = latestMetric?.followersCount
        || creator.selfReportedMetrics?.[0]?.followersCount
        || 0;

    let handle = 'creator';
    if (creator.instagramUrl) {
        try {
            const url = new URL(creator.instagramUrl);
            handle = url.pathname.replace(/\//g, '') || 'creator';
        } catch {
            handle = creator.instagramUrl.split('/').pop() || 'creator';
        }
    }

    const profile = {
        id: creator.id,
        userId: creator.userId,
        instagramHandle: handle,
        youtubeChannel: creator.youtubeUrl || null,
        niche: creator.niche ? [creator.niche] : [],
        location: "India",
        bio: creator.bio || "",
        followers: followers,
        engagementRate: latestMetric?.engagementRate || null,
        pricing: creator.pricing || null,
        price: creator.price || null,
        priceStory: creator.priceStory || null,
        pricePost: creator.pricePost || null,
        priceCollab: creator.priceCollab || null,
        priceType: creator.priceType || "Per Post",
        bannerImage: creator.backgroundImageUrl || null,
        createdAt: creator.user.createdAt,
        updatedAt: creator.user.createdAt,
        kycStatus: creator.verificationStatus,
        saved: false,
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

    if ((session?.user as any)?.role === 'BRAND' && session?.user?.id) {
        const brand = await db.brandProfile.findUnique({ where: { userId: session.user.id } });
        if (brand) {
            const prof = await db.influencerProfile.findUnique({ where: { userId: creator.userId } });
            if (prof) {
                // @ts-ignore
                const isSaved = await db.savedInfluencer.findUnique({
                    where: {
                        brandId_influencerId: {
                            brandId: brand.id,
                            influencerId: prof.id
                        }
                    }
                });
                profile.saved = !!isSaved;
            }
        }
    }

    return <InfluencerProfileClient profile={profile} session={session} />;
}
