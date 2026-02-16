import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { BrandStats } from "@/components/brand/dashboard/brand-stats";
import { RecommendedInfluencers } from "@/components/brand/dashboard/recommended-influencers";
import { QuickActions } from "@/components/brand/dashboard/quick-actions";
import { TopCollections } from "@/components/brand/dashboard/top-collections";
import { RecentActivity } from "@/components/brand/dashboard/recent-activity";
import { getPublicCreators, getBrandStats, getBrandDashboardActivity, getBrandNotifications } from "@/app/brand/actions";

export default async function BrandDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const brandName = session.user.name || "Brand";

    // --- DATA FETCHING ---

    // 1. Stats
    const stats = await getBrandStats();

    // 2. Recommended Influencers
    const { data: creators } = await getPublicCreators();

    // Enrich with match stats (Mock logic for match %, but real data for rest)
    const recommendedInfluencers = creators ? creators.map((c: any) => ({
        ...c,
        stats: {
            followers: c.followersCount || 0,
            engagement: c.engagementRate || 0,
            match: Math.floor(Math.random() * 20) + 80 // Mock Match Score for now
        },
        bannerImage: c.bannerImage || null
    })) : [];

    // 3. Activity
    const activities = await getBrandDashboardActivity();

    // 4. Unread Messages
    const { unreadMessageCount } = await getBrandNotifications();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Home Overview</h1>
                        <p className="text-gray-500">Welcome back, {brandName}. Here's what's happening with your influencer campaigns today.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Main Column */}
                    <div className="flex-1 min-w-0">

                        {/* Stats Row */}
                        <BrandStats stats={stats} />

                        {/* Recommended Influencers */}
                        <RecommendedInfluencers influencers={recommendedInfluencers} />

                        {/* Recent Activity */}
                        <RecentActivity activities={activities} />

                    </div>

                    {/* Right Sidebar Column */}
                    <div className="w-full lg:w-80 space-y-6 shrink-0">
                        {/* CTA Card */}
                        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Ready to grow?</h3>
                                <p className="text-blue-100 mb-6 text-sm">Launch a new campaign and start reaching millions of customers today.</p>
                                <Link href="/brand/campaigns/new">
                                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none font-bold">
                                        Create New Campaign
                                    </Button>
                                </Link>
                            </div>
                            {/* Decorative circles */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/30 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
                        </div>

                        {/* Quick Actions */}
                        <QuickActions unreadMessageCount={unreadMessageCount} />

                        {/* Top Collections */}
                        <TopCollections />
                    </div>

                </div>
            </div>
        </div>
    )
}
