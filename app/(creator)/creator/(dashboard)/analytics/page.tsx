"use client"

import Link from "next/link"
import Image from "next/image"
import {
    BarChart3,
    LayoutDashboard,
    Megaphone,
    Users,
    Settings,
    Calendar,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Loader2,
    Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { getCreatorAnalytics } from "@/app/(creator)/creator/actions"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function CreatorAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const [platform, setPlatform] = useState<string>("ALL"); // ALL, instagram, youtube
    const [dateRange, setDateRange] = useState<number>(30); // 7, 30, 90

    useEffect(() => {
        fetchAnalytics();
    }, [platform, dateRange]);

    async function fetchAnalytics() {
        setLoading(true);
        try {
            const data = await getCreatorAnalytics(platform === "ALL" ? undefined : platform.toLowerCase(), dateRange);
            setAnalytics(data);
        } catch (error) {
            toast.error("Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    }

    if (loading && !analytics) {
        return <div className="h-full flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>;
    }

    const trendData = analytics?.trendData || [];
    const topContent = analytics?.topContent || [];
    const kpis = analytics?.kpis || { avgLikes: 0, reach: 0, engagementRate: 0, followersCount: 0 };

    return (
        <div className="h-full overflow-y-auto p-10 bg-gray-50">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Performance</h1>
                    <p className="text-gray-500">Track your growth and engagement metrics</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
                        <button
                            onClick={() => setPlatform("ALL")}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${platform === "ALL" ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setPlatform("Instagram")}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${platform === "Instagram" ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Instagram
                        </button>
                        <button
                            onClick={() => setPlatform("YouTube")}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${platform === "YouTube" ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            YouTube
                        </button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors outline-none">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>Last {dateRange} Days</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-xl border-gray-100">
                            <DropdownMenuItem
                                onClick={() => setDateRange(7)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${dateRange === 7 ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                Last 7 Days {dateRange === 7 && <Check className="w-4 h-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDateRange(30)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${dateRange === 30 ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                Last 30 Days {dateRange === 30 && <Check className="w-4 h-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDateRange(90)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${dateRange === 90 ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                Last 90 Days {dateRange === 90 && <Check className="w-4 h-4" />}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column (Chart & Stats) */}
                <div className="col-span-8 space-y-8">
                    {/* Chart Card */}
                    <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden p-6 bg-white">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Engagement Trend</h3>
                                <p className="text-sm text-gray-500 mt-1">Interaction & engagement over time</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-medium text-gray-600">Engagement (%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-300"></div>
                                    <span className="text-xs font-medium text-gray-600">Followers</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Placeholder / Dynamic Path */}
                        <div className="h-64 w-full relative">
                            {/* Y-Axis Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full h-px bg-gray-50"></div>
                                ))}
                            </div>

                            {/* SVG Curve Approximation - Simplified Dynamic Scaling */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                {trendData.length > 1 ? (
                                    <>
                                        <path
                                            d={`M ${trendData.map((d: any, i: number) =>
                                                `${(i / (trendData.length - 1)) * 750} ${200 - (d.engagement * 10)}`
                                            ).join(' L ')}`}
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="3"
                                            className="drop-shadow-md"
                                        />
                                        <path
                                            d={`M ${trendData.map((d: any, i: number) =>
                                                `${(i / (trendData.length - 1)) * 750} ${230 - (Math.min(d.followers, 1000) / 100) * 10}`
                                            ).join(' L ')}`}
                                            fill="none"
                                            stroke="#d8b4fe"
                                            strokeWidth="2"
                                            strokeDasharray="6 6"
                                        />
                                    </>
                                ) : (
                                    <text x="50%" y="50%" textAnchor="middle" className="text-gray-300 text-xs">Insufficient data for trend</text>
                                )}
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-gray-400 font-medium pt-4">
                                {trendData.length > 5 ? (
                                    <>
                                        <span>{trendData[0].date}</span>
                                        <span>{trendData[Math.floor(trendData.length * 0.25)].date}</span>
                                        <span>{trendData[Math.floor(trendData.length * 0.5)].date}</span>
                                        <span>{trendData[Math.floor(trendData.length * 0.75)].date}</span>
                                        <span>{trendData[trendData.length - 1].date}</span>
                                    </>
                                ) : trendData.length > 0 ? (
                                    trendData.map((d: any, i: number) => <span key={i}>{d.date}</span>)
                                ) : (
                                    <span>No data</span>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        <Card className="rounded-2xl border-gray-100 shadow-sm p-5 bg-white">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">AVG. LIKES PER POST</p>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-gray-900">
                                    {kpis.avgLikes > 1000 ? (kpis.avgLikes / 1000).toFixed(1) + 'K' : kpis.avgLikes}
                                </span>
                                <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mb-1">
                                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                    8.2%
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-2xl border-gray-100 shadow-sm p-5 bg-white">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">AUDIENCE REACH</p>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-gray-900">
                                    {kpis.reach > 1000 ? (kpis.reach / 1000).toFixed(1) + 'K' : kpis.reach}
                                </span>
                                <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mb-1">
                                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                    15%
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-2xl border-gray-100 shadow-sm p-5 bg-white">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">ENGAGEMENT RATE</p>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-gray-900">{kpis.engagementRate.toFixed(1)}%</span>
                                <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mb-1">
                                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                    2.1%
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-span-4 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900">Top Performing Content</h3>
                        <button className="text-gray-400 hover:text-gray-600" onClick={fetchAnalytics}>
                            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden p-6 bg-white">
                        <div className="space-y-6">
                            {topContent.length > 0 ? topContent.map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 relative">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <BarChart3 className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 mb-1 truncate w-40">{item.title}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                {item.views && <span className="flex items-center gap-1"><span className="w-3 h-3">👁️</span> {item.views}</span>}
                                                <span className="flex items-center gap-1"><span className="w-3 h-3">❤️</span> {item.likes}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                                </div>
                            )) : (
                                <p className="text-gray-400 text-sm text-center py-8">No content data found.</p>
                            )}
                        </div>

                        <div className="mt-8">
                            <Button variant="ghost" className="w-full text-blue-500 bg-blue-50 hover:bg-blue-100 hover:text-blue-600 py-6 rounded-xl font-semibold">
                                Export Full Report
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-3xl border-blue-500 shadow-md overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 p-6 text-white relative">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-3">AI Insights</h3>
                            <p className="text-blue-100 text-sm leading-relaxed mb-6 opacity-90">
                                Your engagement peaks between 6 PM and 9 PM EST. Try posting more Reels during this window to boost reach by up to 22%.
                            </p>
                            <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors backdrop-blur-sm">
                                Learn More
                            </button>
                        </div>

                        {/* Decorative background circle */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
