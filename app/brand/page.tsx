import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Layers3, Plus } from "lucide-react";
import Link from "next/link";
import { BrandStats } from "@/components/brand/dashboard/brand-stats";
import { RecommendedInfluencers } from "@/components/brand/dashboard/recommended-influencers";
import { QuickActions } from "@/components/brand/dashboard/quick-actions";
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
    const { data: creators } = await getPublicCreators({ maxFollowers: 500000 });

    const getFallbackBanner = (niche: string) => {
        const n = (niche || '').toLowerCase();
        if (n.includes('fashion') || n.includes('beauty') || n.includes('style')) return 'https://images.unsplash.com/photo-1490481651871-ab38ed250239?auto=format&fit=crop&w=800&q=80';
        if (n.includes('tech') || n.includes('gadget')) return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80';
        if (n.includes('travel')) return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
        if (n.includes('food') || n.includes('cook') || n.includes('culinary')) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
        if (n.includes('fit') || n.includes('health') || n.includes('gym')) return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80';
        if (n.includes('education') || n.includes('learning')) return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';
        if (n.includes('gaming')) return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
        if (n.includes('finance') || n.includes('money')) return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80';
        if (n.includes('parenting')) return 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80';
        if (n.includes('auto')) return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80';
        return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
    };

    const recommendedInfluencers = creators ? creators.map((creator: any) => ({
        ...creator,
        stats: {
            followers: creator.followersCount || 0,
            engagement: creator.engagementRate || 0,
            match: Math.floor(Math.random() * 20) + 80,
        },
        bannerImage: creator.bannerImage || getFallbackBanner(creator.niche),
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
                        <Link href="/brand/campaigns">
                            <Button variant="outline" className="rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
                                <Layers3 className="mr-2 h-4 w-4" />
                                Campaign Pipeline
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
                                <Link href="/brand/campaigns">
                                    <div className="mb-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-500 transition-colors hover:bg-blue-400">
                                        <Layers3 className="h-5 w-5 text-white" />
                                    </div>
                                </Link>
                                <h3 className="mb-2 text-xl font-bold">Campaign visibility</h3>
                                <p className="mb-6 text-sm text-blue-100">Track paid campaign progress from setup to manager review in one place.</p>
                                <Link href="/brand/campaigns">
                                    <Button className="w-full border-none bg-white font-bold text-blue-600 hover:bg-blue-50">
                                        Open Campaigns
                                    </Button>
                                </Link>
                            </div>
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/30 blur-2xl"></div>
                            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl"></div>
                        </div>

                        <QuickActions unreadMessageCount={unreadMessageCount} />
                    </div>
                </div>
            </div>
        </div>
    );
}

