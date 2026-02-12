import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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
            where: {
                verificationStatus: 'APPROVED'
            },
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
            where: {
                kyc: {
                    status: 'APPROVED'
                }
            },
            include: {
                user: true,
                kyc: true
            }
        });

        // Transform Creator data to match the card format used in brand discover
        const publicCreators = creators.map(creator => {
            const latestMetric = creator.metrics[0];
            const followers = latestMetric?.followersCount
                || creator.selfReportedMetrics?.[0]?.followersCount
                || 0;

            // Format followers for display
            const fmtFollowers = followers > 1000000
                ? `${(followers / 1000000).toFixed(1)}M`
                : followers > 1000
                    ? `${(followers / 1000).toFixed(1)}K`
                    : followers.toString();

            // Extract handle from Instagram/YouTube URL
            let handle = '@creator';
            if (creator.instagramUrl) {
                const match = creator.instagramUrl.match(/instagram\.com\/([^/?\s]+)/);
                handle = match ? `@${match[1]}` : '@instagram';
            } else if (creator.youtubeUrl) {
                const match = creator.youtubeUrl.match(/@([^/?\s]+)/);
                handle = match ? `@${match[1]}` : '@youtube';
            }

            // Engagement rate
            const engagement = latestMetric
                ? `${(latestMetric.engagementRate || 0).toFixed(1)}%`
                : 'N/A';

            return {
                id: creator.userId,
                dbId: creator.id,
                name: creator.displayName || creator.fullName || 'Creator',
                handle: handle,
                niche: creator.niche || 'Creator',
                location: 'India', // Creator model doesn't have location yet, keeping India as default but could be enhanced
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
            };
        });

        // Transform InfluencerProfile data to match the same format
        const influencerCreators = influencerProfiles.map(inf => {
            const followers = inf.followers || 0;
            const fmtFollowers = followers > 1000000
                ? `${(followers / 1000000).toFixed(1)}M`
                : followers > 1000
                    ? `${(followers / 1000).toFixed(1)}K`
                    : followers.toString();

            const nicheArray = Array.isArray(inf.niche)
                ? inf.niche
                : (inf.niche ? inf.niche.split(',').map((n: string) => n.trim()) : ['Creator']);

            // Clean handle up - if it's a URL, extract the username
            let handle = inf.instagramHandle || 'creator';
            if (handle.startsWith('http')) {
                const match = handle.match(/instagram\.com\/([^/?\s]+)/);
                handle = match ? match[1] : 'creator';
            }
            if (!handle.startsWith('@')) handle = `@${handle}`;

            return {
                id: inf.userId,
                dbId: inf.id,
                name: inf.user.name || 'Creator',
                handle: handle,
                niche: nicheArray.join(', '),
                location: inf.location || 'India',
                followers: fmtFollowers,
                followersCount: followers,
                engagementRate: inf.engagementRate ? `${inf.engagementRate.toFixed(1)}%` : 'N/A',
                avgViews: 'N/A',
                verified: inf.kyc?.status === 'APPROVED',
                tags: nicheArray.slice(0, 3),
                priceRange: formatPriceRange(inf.pricing || null),
                thumbnail: inf.user.image || '',
                profileImage: inf.user.image || '',
                saved: false
            };
        });

        // Combine all creators
        const allCreators = [...publicCreators, ...influencerCreators];

        return NextResponse.json({ creators: allCreators });
    } catch (error) {
        console.error("Failed to fetch public creators:", error);
        return NextResponse.json({ creators: [] }, { status: 500 });
    }
}
