'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Search,
    Bell,
    MessageCircle,
    Filter,
    ChevronUp,
    Globe,
    Check,
    Dumbbell,
    Monitor,
    Shirt,
    Camera,
    PlayCircle,
    Tv,
    Music,
    Bookmark,
    Utensils,
    Plane,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import { InfluencerProfile, User } from '@prisma/client';

type InfluencerWithUser = InfluencerProfile & { user: User };

interface DiscoveryClientProps {
    influencers: InfluencerWithUser[];
}

export default function DiscoveryClient({ influencers }: DiscoveryClientProps) {
    const [priceRange, setPriceRange] = useState(30);
    const [followerRange, setFollowerRange] = useState(60);

    // Format helpers
    const formatFollowers = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
        return count.toString();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-gray-50 text-gray-900 font-sans overflow-hidden">
            {/* Header */}
            <header className="flex-none bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                        <Search className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">InfluencerHub</h1>
                </div>

                <div className="hidden md:flex flex-1 max-w-xl mx-auto relative px-4">
                    <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Search creators, niches, locations..."
                    />
                </div>

                <nav className="hidden lg:flex items-center gap-8 mx-8">
                    <Link href="/brand/discover" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        Discover
                    </Link>
                    <Link href="/brand/campaigns" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Campaigns
                    </Link>
                    <Link href="/brand/chat" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Messages
                    </Link>
                    <Link href="/brand/analytics" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Analytics
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 relative transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full border border-gray-300 overflow-hidden relative">
                        <Image
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
                            alt="User"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Filters */}
                <aside className="w-80 bg-white border-r border-gray-200 hidden lg:flex flex-col h-full overflow-hidden">
                    <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-purple-600" /> Refine Search
                        </h2>
                        <button className="text-xs font-semibold text-gray-500 hover:text-purple-600 transition-colors">Reset</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-20 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {/* Location */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-900 flex items-center justify-between">
                                Location
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                            </label>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <Globe className="w-4 h-4 text-gray-500" /> India
                                </div>
                                <div className="pl-6 space-y-2 border-l-2 border-gray-200 ml-2">
                                    <div className="flex items-center justify-between text-sm group cursor-pointer">
                                        <span className="text-purple-600 font-semibold">Maharashtra</span>
                                        <Check className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="pl-3 mt-1 space-y-1">
                                        <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded bg-white border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-white w-4 h-4" />
                                            Mumbai
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 cursor-pointer">
                                            <input type="checkbox" className="rounded bg-white border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-white w-4 h-4" />
                                            Pune
                                        </label>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 pl-6 border-l-2 border-transparent ml-2 hover:text-gray-900 cursor-pointer">
                                    Karnataka
                                </div>
                            </div>
                        </div>

                        {/* Niche */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-900">Niche & Category</label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between p-3 border border-purple-300 bg-purple-50 rounded-lg cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <Dumbbell className="w-5 h-5 text-purple-600" />
                                        <span className="text-sm font-medium text-gray-900">Fitness & Health</span>
                                    </div>
                                    <input type="checkbox" defaultChecked className="rounded-full bg-white border-gray-300 text-purple-600 focus:ring-0 focus:ring-offset-white w-4 h-4" />
                                </label>
                                <label className="flex items-center justify-between p-3 border border-gray-200 hover:border-gray-300 rounded-lg cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <Monitor className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Tech & Gadgets</span>
                                    </div>
                                    <input type="checkbox" className="rounded-full bg-white border-gray-300 text-gray-400 focus:ring-0 focus:ring-offset-white w-4 h-4" />
                                </label>
                                <label className="flex items-center justify-between p-3 border border-gray-200 hover:border-gray-300 rounded-lg cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <Shirt className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Fashion</span>
                                    </div>
                                    <input type="checkbox" className="rounded-full bg-white border-gray-300 text-gray-400 focus:ring-0 focus:ring-offset-white w-4 h-4" />
                                </label>
                                <button className="text-purple-600 text-sm font-semibold hover:underline pl-1 pt-1">+ Show 12 more</button>
                            </div>
                        </div>

                        {/* Sliders */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-gray-900">Followers</label>
                                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">10k - 1M+</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={followerRange}
                                onChange={(e) => setFollowerRange(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wide">
                                <span>Nano</span>
                                <span>Mega</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-gray-900">Price per Post</label>
                                <span className="text-xs font-medium text-gray-600">₹50 - ₹5k</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={priceRange}
                                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white mt-auto">
                        <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors shadow-lg">
                            Apply Filters
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Toolbar */}
                    <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-none bg-white z-10 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Explore Creators</h2>
                            <p className="text-gray-600 text-sm mt-1">Found <span className="font-bold text-gray-900">{influencers.length}</span> creators matching your criteria</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl overflow-x-auto max-w-full">
                            <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold transition-colors whitespace-nowrap border border-purple-200">
                                <Camera className="w-4 h-4" /> Instagram
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                                <PlayCircle className="w-4 h-4" /> YouTube
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                                <Tv className="w-4 h-4" /> TV Stars
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                                <Music className="w-4 h-4" /> Musicians
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-8 pt-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-12">
                            {influencers.map((inf) => (
                                <article key={inf.id} className="group bg-white rounded-2xl border border-gray-200 hover:border-purple-400 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                    <div className="relative h-64 w-full overflow-hidden rounded-t-2xl">
                                        <Image
                                            src={inf.user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=300"}
                                            alt={inf.user.name || "Influencer"}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 border border-gray-200 shadow-sm flex items-center gap-1">
                                            <Camera className="w-4 h-4 text-pink-500" />
                                            <span>{inf.niche[0] || 'Creator'}</span>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-purple-600 text-white backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            Verified
                                        </div>
                                        <div className="absolute bottom-3 left-4 text-white">
                                            <h3 className="font-bold text-lg leading-tight">{inf.user.name}</h3>
                                            <p className="text-xs text-zinc-300 font-medium opacity-90">{inf.instagramHandle || '@handle'} • {inf.location || 'India'}</p>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="grid grid-cols-3 gap-2 py-2 mb-4 border-b border-gray-200">
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Followers</p>
                                                <p className="text-gray-900 font-bold text-lg">{formatFollowers(inf.followers)}</p>
                                            </div>
                                            <div className="text-center border-l border-gray-200">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Eng. Rate</p>
                                                <p className="text-green-600 font-bold text-lg">{inf.engagementRate}%</p>
                                            </div>
                                            <div className="text-center border-l border-gray-200">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Avg. Likes</p>
                                                <p className="text-gray-900 font-bold text-lg">{(inf.followers * (inf.engagementRate / 100)).toFixed(0)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {(typeof inf.niche === 'string' ? inf.niche.split(',') : inf.niche || []).filter(Boolean).map((tag, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="mt-auto flex gap-2">
                                            <Link href={`/brand/discover/${inf.id}`} className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors shadow-md text-center">
                                                View Profile
                                            </Link>
                                            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:text-purple-600 hover:border-purple-600 transition-colors bg-gray-50">
                                                <Bookmark className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination - Keeping static for now as per instructions "minimal changes" */}
                        <div className="flex justify-center pb-12">
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-sm shadow-md">1</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
