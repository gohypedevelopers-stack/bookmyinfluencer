import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Layers3, Plus } from "lucide-react";
import Link from "next/link";
import { BrandStats } from "@/components/brand/dashboard/brand-stats";
import { RecommendedInfluencers } from "@/components/brand/dashboard/recommended-influencers";
import { QuickActions } from "@/components/brand/dashboard/quick-actions";
import { TopCollections } from "@/components/brand/dashboard/top-collections";
import { RecentActivity } from "@/components/brand/dashboard/recent-activity";
import { getPublicCreators, getBrandStats, getBrandDashboardActivity, getBrandNotifications } from "@/app/brand/actions";
import { ensureRequestExpiryJobStarted } from "@/jobs/requestExpiryJob";

export default async function BrandDashboardPage() {
    ensureRequestExpiryJobStarted();

    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const brandName = session.user.name || "Brand";
    const stats = await getBrandStats();
    const { data: creators } = await getPublicCreators();

    const recommendedInfluencers = creators ? creators.map((creator: any) => ({
        ...creator,
        stats: {
            followers: creator.followersCount || 0,
            engagement: creator.engagementRate || 0,
            match: Math.floor(Math.random() * 20) + 80,
        },
        bannerImage: creator.bannerImage || null,
    })) : [];

    const activities = await getBrandDashboardActivity();
    const { unreadMessageCount } = await getBrandNotifications();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Brand Home Overview</h1>
                        <p className="text-gray-500">Welcome back, {brandName}. Here&apos;s what&apos;s happening with your influencer campaigns today.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link href="/brand/campaign-queues">
                            <Button variant="outline" className="rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
                                <Layers3 className="mr-2 h-4 w-4" />
                                Campaign Queues
                            </Button>
                        </Link>
                        <Link href="/brand/campaigns/new">
                            <Button className="rounded-2xl bg-blue-600 font-semibold text-white hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Campaign
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="min-w-0 flex-1">
                        <BrandStats stats={stats} />
                        <RecommendedInfluencers influencers={recommendedInfluencers} />
                        <RecentActivity activities={activities} />
                    </div>

                    <div className="w-full shrink-0 space-y-6 lg:w-80">
                        <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-6 text-white shadow-lg">
                            <div className="relative z-10">
                                <Link href="/brand/campaign-queues">
                                    <div className="mb-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-500 transition-colors hover:bg-blue-400">
                                        <Layers3 className="h-5 w-5 text-white" />
                                    </div>
                                </Link>
                                <h3 className="mb-2 text-xl font-bold">Queue visibility</h3>
                                <p className="mb-6 text-sm text-blue-100">Track onboarding-generated campaign queues, rolling requests, and accepted influencers from one dashboard.</p>
                                <Link href="/brand/campaign-queues">
                                    <Button className="w-full border-none bg-white font-bold text-blue-600 hover:bg-blue-50">
                                        Open Queue Dashboard
                                    </Button>
                                </Link>
                            </div>
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/30 blur-2xl"></div>
                            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl"></div>
                        </div>

                        <QuickActions unreadMessageCount={unreadMessageCount} />
                        <TopCollections />
                    </div>
                </div>
            </div>
        </div>
    );
}
