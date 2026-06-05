import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Layers3, Plus, Star } from "lucide-react";
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
        <div className="min-h-screen relative overflow-hidden font-sans pb-16" style={{ background: "radial-gradient(circle at top right, #f8fafc 0%, #f1f5f9 100%)" }}>
            
            {/* Animated background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/10 to-transparent blur-[120px] animate-[pulse_10s_ease-in-out_infinite]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-gradient-to-bl from-purple-500/10 to-transparent blur-[120px] animate-[pulse_14s_ease-in-out_infinite_2s]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-gradient-to-t from-blue-500/10 to-transparent blur-[120px] animate-[pulse_12s_ease-in-out_infinite_4s]" />
            </div>

            <div className="max-w-[1400px] mx-auto relative z-10 px-4 md:px-8 pt-8">
                <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-md border border-indigo-100 rounded-full text-[11px] font-black uppercase tracking-widest text-indigo-600 shadow-sm mb-3">
                            <Star className="w-3.5 h-3.5" />
                            Command Center
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Brand Overview</h1>
                        <p className="text-slate-500 font-medium text-[15px]">Welcome back, <span className="text-slate-800 font-bold">{brandName}</span>. Here&apos;s what&apos;s happening with your influencer campaigns today.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link href="/brand/campaigns">
                            <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200/80 bg-white/80 backdrop-blur-md font-bold text-slate-700 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-indigo-100/50 hover:-translate-y-0.5">
                                <Layers3 className="mr-2.5 h-4 w-4" />
                                Campaign Pipeline
                            </Button>
                        </Link>
                        <Link href="/brand/campaigns/new">
                            <Button className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Campaign
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-8 xl:flex-row">
                    <div className="min-w-0 flex-1 flex flex-col gap-8">
                        <BrandStats stats={stats} />
                        <RecommendedInfluencers influencers={recommendedInfluencers} />
                        <RecentActivity activities={activities} />
                    </div>

                    <div className="w-full shrink-0 flex flex-col gap-8 xl:w-[360px] animate-in fade-in slide-in-from-right-8 duration-700 delay-300 fill-mode-both">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl shadow-indigo-200/50 group">
                            {/* Animated Background Gradients */}
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/40 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:translate-x-5" />
                            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-400/40 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:-translate-x-5" />
                            
                            <div className="relative z-10">
                                <Link href="/brand/campaigns">
                                    <div className="mb-6 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:rotate-3 shadow-lg">
                                        <Layers3 className="h-6 w-6 text-white" />
                                    </div>
                                </Link>
                                <h3 className="mb-3 text-2xl font-black tracking-tight leading-tight">Campaign Visibility</h3>
                                <p className="mb-8 text-[15px] font-medium text-blue-100/90 leading-relaxed">Track paid campaign progress from setup to manager review in one unified mission control.</p>
                                <Link href="/brand/campaigns">
                                    <Button className="w-full h-12 rounded-xl bg-white text-indigo-600 font-black hover:bg-blue-50 hover:text-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                        Open Campaigns
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <QuickActions unreadMessageCount={unreadMessageCount} />
                    </div>
                </div>
            </div>
        </div>
    );
}

