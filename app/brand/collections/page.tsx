import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSavedInfluencers } from "@/app/brand/savedActions";
import Link from "next/link";
import { Bookmark, ShoppingBag, MapPin, Search } from "lucide-react";
import CollectionsClient from "./CollectionsClient";

export const dynamic = "force-dynamic";

export default async function SavedCollectionsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'BRAND') {
        redirect("/login");
    }

    const { savedInfluencers } = await getSavedInfluencers();

    // Map the DB data to the format expected by the card UI
    const mappedCreators = savedInfluencers?.map((saved: any) => {
        const inf = saved.influencer;
        const followers = inf.followers || 0;
        const fmtFollowers = followers > 1000000
            ? `${(followers / 1000000).toFixed(1)}M`
            : followers > 1000
                ? `${(followers / 1000).toFixed(1)}K`
                : followers.toString();

        const nicheArray = Array.isArray(inf.niche)
            ? inf.niche
            : (inf.niche ? inf.niche.split(',').map((n: string) => n.trim()) : ['Creator']);

        return {
            id: inf.userId,
            dbId: inf.id,
            name: inf.user?.name || 'Creator',
            handle: inf.instagramHandle ? `@${inf.instagramHandle}` : '@creator',
            niche: nicheArray[0] || 'General',
            location: inf.location || 'Global',
            followers: fmtFollowers,
            engagementRate: inf.engagementRate ? `${inf.engagementRate.toFixed(1)}%` : 'N/A',
            avgViews: 'N/A',
            verified: inf.kycStatus === 'APPROVED',
            priceStory: inf.priceStory || 0,
            pricePost: inf.pricePost || 0,
            priceCollab: inf.priceCollab || 0,
            thumbnail: inf.user?.image || "",
            profileImage: inf.user?.image || "",
            bannerImage: null, // If there's a banner, it's missing from InfluencerProfile
            saved: true // Being on this page implies it's saved
        };
    }) || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-6 py-6 lg:py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Link href="/brand" className="hover:text-gray-900 transition-colors">Dashboard</Link>
                                <span>/</span>
                                <span className="font-medium text-gray-900">Saved Collections</span>
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                                    <Bookmark className="w-5 h-5 fill-current" />
                                </span>
                                Saved Collections
                            </h1>
                            <p className="text-gray-500 mt-2 max-w-2xl">
                                Your curated list of bookmarked influencers. Review their profiles, compare stats, and invite them to your next campaign.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link href="/brand/discover" className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm">
                                <Search className="w-4 h-4" />
                                Find More
                            </Link>
                            <Link href="/brand/campaigns/new" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm">
                                <ShoppingBag className="w-4 h-4" />
                                Create Campaign
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area uses a Client Component for interaction */}
            <div className="max-w-[1600px] mx-auto px-6 py-8">
                <CollectionsClient initialCreators={mappedCreators} />
            </div>
        </div>
    );
}

