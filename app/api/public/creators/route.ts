import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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


const DUMMY_MARKETPLACE_CREATORS = [
    {
        id: "dummy-m-1",
        dbId: "dummy-m-1",
        name: "Aarav Mehta",
        handle: "@aarav_vlogs",
        niche: "Travel & Adventure",
        location: "Mumbai, India",
        followers: "1.2M",
        followersCount: 1200000,
        engagementRate: "5.4%",
        avgViews: "250K",
        profileImage: "https://images.unsplash.com/photo-1506794778202-cad8d9741ad2?auto=format&fit=crop&q=80&w=200&h=200",
        thumbnail: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800&h=1000",
        verified: true,
        tags: ["Adventure", "Vlogging", "Travel"],
        priceRange: "₹5000-₹15000",
        saved: false
    },
    {
        id: "dummy-m-2",
        dbId: "dummy-m-2",
        name: "Isha Kapoor",
        handle: "@glam_by_isha",
        niche: "Fashion & Beauty",
        location: "Delhi, India",
        followers: "850K",
        followersCount: 850000,
        engagementRate: "6.2%",
        avgViews: "180K",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
        thumbnail: "https://images.unsplash.com/photo-1490481651871-ab38ed250239?auto=format&fit=crop&q=80&w=800&h=1000",
        verified: true,
        tags: ["Fashion", "Makeup", "Lifestyle"],
        priceRange: "₹3000-₹8000",
        saved: false
    },
    {
        id: "dummy-m-3",
        dbId: "dummy-m-3",
        name: "Vikram Singh",
        handle: "@tech_vikram",
        niche: "Technology & Gadgets",
        location: "Bangalore, India",
        followers: "450K",
        followersCount: 450000,
        engagementRate: "7.8%",
        avgViews: "320K",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800&h=1000",
        verified: true,
        tags: ["Tech", "Reviews", "Gadgets"],
        priceRange: "₹8000-₹20000",
        saved: false
    },
    {
        id: "dummy-m-4",
        dbId: "dummy-m-4",
        name: "Ananya Roy",
        handle: "@fitness_ananya",
        niche: "Health & Fitness",
        location: "Pune, India",
        followers: "620K",
        followersCount: 620000,
        engagementRate: "4.9%",
        avgViews: "150K",
        profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
        thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800&h=1000",
        verified: true,
        tags: ["Fitness", "Diet", "Yoga"],
        priceRange: "₹2500-₹6000",
        saved: false
    }
];

export async function GET() {
    try {
        // Get all creators from the Creator table (OTP auth system)
        const creators = await db.creator.findMany({
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
            include: {
                user: true,
                kyc: true
            }
        });

        const creatorMap = new Map();

        // Transform Creator data
        creators.forEach(creator => {
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
                avgViews: latestMetric?.viewsCount ? formatPriceRange(latestMetric.viewsCount.toString()) : 'N/A', // Reusing helper or similar
                verified: creator.verificationStatus === 'APPROVED',
                tags: creator.niche ? creator.niche.split(',').slice(0, 3).map((t: string) => t.trim()) : [],
                priceRange: formatPriceRange(creator.pricing),
                thumbnail: creator.backgroundImageUrl || creator.profileImageUrl || creator.autoProfileImageUrl || '',
                profileImage: creator.profileImageUrl || creator.autoProfileImageUrl || '',
                saved: false
            });
        });

        // Transform and potentially overwrite/merge with InfluencerProfile data
        influencerProfiles.forEach(inf => {
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

        const dbCreators = Array.from(creatorMap.values());
        const allCreators = [...dbCreators, ...DUMMY_MARKETPLACE_CREATORS];

        return NextResponse.json({ creators: allCreators });
    } catch (error) {
        console.error("Failed to fetch public creators:", error);
        return NextResponse.json({ creators: [] }, { status: 500 });
    }
}
