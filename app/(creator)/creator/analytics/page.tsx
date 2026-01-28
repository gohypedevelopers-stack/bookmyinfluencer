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
    ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CreatorAnalyticsPage() {
    const topContent = [
        {
            title: "Morning routine with...",
            views: "245K",
            likes: "18.2K",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100&h=100" // Red shoe
        },
        {
            title: "The Future of Tech...",
            views: "112K",
            likes: "9.5K",
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=100&h=100" // Laptop
        },
        {
            title: "New Home Setup...",
            views: "89K",
            likes: "6.1K",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100" // Person
        }
    ]

    return (
        <div className="h-full overflow-y-auto p-10 bg-gray-50">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Performance</h1>
                    <p className="text-gray-500">Track your growth and engagement metrics</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
                        <button className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-900 shadow-sm">All</button>
                        <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Instagram</button>
                        <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">YouTube</button>
                    </div>

                    <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column (Chart & Stats) */}
                <div className="col-span-8 space-y-8">
                    {/* Chart Card */}
                    <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden p-6">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Engagement Trend</h3>
                                <p className="text-sm text-gray-500 mt-1">Interaction & engagement over time</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-medium text-gray-600">Engagement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-300"></div>
                                    <span className="text-xs font-medium text-gray-600">Follower Growth</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Placeholder */}
                        <div className="h-64 w-full relative">
                            {/* Y-Axis Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full h-px bg-gray-50"></div>
                                ))}
                            </div>

                            {/* SVG Curve Approximation */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                {/* Blue Line (Engagement) */}
                                <path
                                    d="M0 200 C 50 180, 100 130, 200 130 S 300 180, 400 150 S 500 50, 550 80 S 650 180, 750 180"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    className="drop-shadow-md"
                                />
                                {/* Purple Line (Growth) */}
                                <path
                                    d="M0 230 C 50 220, 100 200, 200 200 S 300 230, 400 220 S 500 160, 550 170 S 650 200, 750 210"
                                    fill="none"
                                    stroke="#d8b4fe"
                                    strokeWidth="3"
                                    strokeDasharray="6 6"
                                />

                                {/* Data Point */}
                                <circle cx="500" cy="50" r="4" className="fill-white stroke-blue-500 stroke-[3]" />
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-gray-400 font-medium pt-4">
                                <span>OCT 01</span>
                                <span>OCT 08</span>
                                <span>OCT 15</span>
                                <span>OCT 22</span>
                                <span>OCT 30</span>
                            </div>
                        </div>
                    </Card>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        <Card className="rounded-2xl border-gray-100 shadow-sm p-5">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">AVG. LIKES PER POST</p>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-gray-900">4,280</span>
                                <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mb-1">
                                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                    8.2%
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-2xl border-gray-100 shadow-sm p-5">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">AUDIENCE REACH</p>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-gray-900">1.2M</span>
                                <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mb-1">
                                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                    15%
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-2xl border-gray-100 shadow-sm p-5">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">LINK CLICKS</p>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-gray-900">12.5k</span>
                                <div className="flex items-center text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded mb-1">
                                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
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
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden p-6 bg-white">
                        <div className="space-y-6">
                            {topContent.map((item, index) => (
                                <div key={index} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 relative">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 mb-1">{item.title}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><span className="w-3 h-3">👁️</span> {item.views}</span>
                                                <span className="flex items-center gap-1"><span className="w-3 h-3">❤️</span> {item.likes}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                                </div>
                            ))}
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
