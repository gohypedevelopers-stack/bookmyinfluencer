import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import {
    isVisibleCreatorProfile,
    isVisibleInfluencerProfile,
    visibleCreatorWhere,
    visibleInfluencerProfileWhere,
} from "@/lib/profile-visibility";

export const dynamic = "force-dynamic";

// Helper to extract readable price range from raw pricing JSON
function formatPriceRange(pricing: string | null): string {
    if (!pricing) return '₹100-₹500';
    try {
        const data = JSON.parse(pricing);
        // Collect all numeric price values
        const prices: number[] = [];
        for (const [key, val] of Object.entries(data)) {
            if (key === 'instaRoyaltyPrices' || key === 'instaRoyaltyDuration') continue;
            const num = parseInt(val as string, 10);
            if (!isNaN(num) && num > 0) prices.push(num);
        }
        if (prices.length === 0) return '₹100-₹500';
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min === max) return `₹${min}`;
        return `₹${min}-₹${max}`;
    } catch {
        // If it's already a simple string like "₹100-500", return as-is
        if (pricing.includes('₹')) return pricing;
        return '₹100-₹500';
    }
}

export async function GET() {
    try {
        // Get all creators from the Creator table (OTP auth system)
        const creators = await db.creator.findMany({
            where: visibleCreatorWhere,
            include: {
                user: true,
                metrics: {
                    orderBy: { date: 'desc' },
                    take: 1
                },
                selfReportedMetrics: true
            }
        });

        // Also get creators from InfluencerProfile (NextAuth system)
        const influencerProfiles = await db.influencerProfile.findMany({
            where: visibleInfluencerProfileWhere,
            include: {
                user: true,
                kyc: true
            }
        });

        const creatorMap = new Map();

        // Transform Creator data
        creators.filter(isVisibleCreatorProfile).forEach(creator => {
            const latestMetric = creator.metrics[0];
            const followers = latestMetric?.followersCount
                || creator.selfReportedMetrics?.[0]?.followersCount
                || 0;

            const fmtFollowers = followers > 1000000
                ? `${(followers / 1000000).toFixed(1)}M`
                : followers > 1000
                    ? `${(followers / 1000).toFixed(1)}K`
                    : followers.toString();

            let handle = '@creator';
            if (creator.instagramUrl) {
                const match = creator.instagramUrl.match(/instagram\.com\/([^/?\s]+)/);
                handle = match ? `@${match[1]}` : '@instagram';
            } else if (creator.youtubeUrl) {
                const match = creator.youtubeUrl.match(/@([^/?\s]+)/);
                handle = match ? `@${match[1]}` : '@youtube';
            }

            const engagement = latestMetric
                ? `${(latestMetric.engagementRate || 0).toFixed(1)}%`
                : 'N/A';

            creatorMap.set(creator.userId, {
                id: creator.userId,
                dbId: creator.id,
                name: creator.displayName || creator.fullName || 'Creator',
                handle: handle,
                niche: creator.niche || 'Creator',
                location: 'India',
                followers: fmtFollowers,
                followersCount: followers,
                engagementRate: engagement,
                avgViews: latestMetric?.viewsCount || 'N/A',
                verified: creator.verificationStatus === 'APPROVED',
                tags: creator.niche ? creator.niche.split(',').slice(0, 3).map((t: string) => t.trim()) : [],
                priceRange: formatPriceRange(creator.pricing),
                thumbnail: creator.backgroundImageUrl || creator.profileImageUrl || creator.autoProfileImageUrl || '',
                profileImage: creator.profileImageUrl || creator.autoProfileImageUrl || '',
                saved: false
            });
        });

        // Transform and potentially overwrite/merge with InfluencerProfile data
        influencerProfiles.filter(isVisibleInfluencerProfile).forEach(inf => {
            const followers = inf.followers || 0;
            const fmtFollowers = followers > 1000000
                ? `${(followers / 1000000).toFixed(1)}M`
                : followers > 1000
                    ? `${(followers / 1000).toFixed(1)}K`
                    : followers.toString();

            const nicheArray = Array.isArray(inf.niche)
                ? inf.niche
                : (inf.niche ? inf.niche.split(',').map((n: string) => n.trim()) : ['Creator']);

            let handle = inf.instagramHandle || 'creator';
            if (handle.startsWith('http')) {
                const match = handle.match(/instagram\.com\/([^/?\s]+)/);
                handle = match ? match[1] : 'creator';
            }
            if (!handle.startsWith('@')) handle = `@${handle}`;

            // If already exists, we prefer InfluencerProfile data for some fields
            const existing = creatorMap.get(inf.userId);

            creatorMap.set(inf.userId, {
                id: inf.userId,
                dbId: inf.id,
                name: inf.user.name || existing?.name || 'Creator',
                handle: handle,
                niche: nicheArray.join(', '),
                location: inf.location || existing?.location || 'India',
                followers: fmtFollowers,
                followersCount: followers,
                engagementRate: inf.engagementRate ? `${inf.engagementRate.toFixed(1)}%` : (existing?.engagementRate || 'N/A'),
                avgViews: existing?.avgViews || 'N/A',
                verified: inf.kyc?.status === 'APPROVED' || existing?.verified,
                tags: nicheArray.slice(0, 3),
                priceRange: formatPriceRange(inf.pricing || null) || existing?.priceRange,
                thumbnail: inf.user.image || existing?.thumbnail || '',
                profileImage: inf.user.image || existing?.profileImage || '',
                saved: false
            });
        });

        return NextResponse.json({ creators: Array.from(creatorMap.values()) });
    } catch (error) {
        console.error("Failed to fetch public creators:", error);
        return NextResponse.json({ creators: [] }, { status: 500 });
    }
}
