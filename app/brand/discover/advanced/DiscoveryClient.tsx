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
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-[#121212] text-white font-sans overflow-hidden">
            {/* Header */}
            <header className="flex-none bg-[#1E1E1E] border-b border-[#27272a] h-16 px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                        <Search className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">InfluencerHub</h1>
                </div>

                <div className="hidden md:flex flex-1 max-w-xl mx-auto relative px-4">
                    <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none text-zinc-500">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-[#27272a] border-none rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="Search creators, niches, locations..."
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#27272a] text-zinc-400 relative transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#1E1E1E]"></span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#27272a] text-zinc-400 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full border border-[#27272a] overflow-hidden relative">
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
                <aside className="w-80 bg-[#1E1E1E] border-r border-[#27272a] hidden lg:flex flex-col h-full overflow-hidden">
                    <div className="p-5 border-b border-[#27272a] flex justify-between items-center bg-[#1E1E1E] sticky top-0 z-10">
                        <h2 className="font-bold text-white text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-purple-500" /> Refine Search
                        </h2>
                        <button className="text-xs font-semibold text-zinc-500 hover:text-purple-500 transition-colors">Reset</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-20 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {/* Location */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-white flex items-center justify-between">
                                Location
                                <ChevronUp className="w-4 h-4 text-zinc-500" />
                            </label>
                            <div className="bg-[#27272a] rounded-lg p-3 border border-[#27272a] space-y-3">
                                <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                                    <Globe className="w-4 h-4 text-zinc-500" /> India
                                </div>
                                <div className="pl-6 space-y-2 border-l-2 border-[#27272a] ml-2">
                                    <div className="flex items-center justify-between text-sm group cursor-pointer">
                                        <span className="text-purple-500 font-semibold">Maharashtra</span>
                                        <Check className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <div className="pl-3 mt-1 space-y-1">
                                        <label className="flex items-center gap-2 text-sm text-zinc-400 hover:text-purple-500 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded bg-[#1E1E1E] border-zinc-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-[#1E1E1E] w-4 h-4" />
                                            Mumbai
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-zinc-400 hover:text-purple-500 cursor-pointer">
                                            <input type="checkbox" className="rounded bg-[#1E1E1E] border-zinc-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-[#1E1E1E] w-4 h-4" />
                                            Pune
                                        </label>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-zinc-500 pl-6 border-l-2 border-transparent ml-2 hover:text-white cursor-pointer">
                                    Karnataka
                                </div>
                            </div>
                        </div>

                        {/* Niche */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-white">Niche & Category</label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between p-3 border border-purple-500/50 bg-purple-500/10 rounded-lg cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <Dumbbell className="w-5 h-5 text-purple-500" />
                                        <span className="text-sm font-medium text-white">Fitness & Health</span>
                                    </div>
                                    <input type="checkbox" defaultChecked className="rounded-full bg-[#1E1E1E] border-zinc-600 text-purple-500 focus:ring-0 focus:ring-offset-[#1E1E1E] w-4 h-4" />
                                </label>
                                <label className="flex items-center justify-between p-3 border border-[#27272a] hover:border-zinc-600 rounded-lg cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <Monitor className="w-5 h-5 text-zinc-500" />
                                        <span className="text-sm font-medium text-zinc-300">Tech & Gadgets</span>
                                    </div>
                                    <input type="checkbox" className="rounded-full bg-[#1E1E1E] border-zinc-600 text-zinc-600 focus:ring-0 focus:ring-offset-[#1E1E1E] w-4 h-4" />
                                </label>
                                <label className="flex items-center justify-between p-3 border border-[#27272a] hover:border-zinc-600 rounded-lg cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <Shirt className="w-5 h-5 text-zinc-500" />
                                        <span className="text-sm font-medium text-zinc-300">Fashion</span>
                                    </div>
                                    <input type="checkbox" className="rounded-full bg-[#1E1E1E] border-zinc-600 text-zinc-600 focus:ring-0 focus:ring-offset-[#1E1E1E] w-4 h-4" />
                                </label>
                                <button className="text-purple-500 text-sm font-semibold hover:underline pl-1 pt-1">+ Show 12 more</button>
                            </div>
                        </div>

                        {/* Sliders */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-white">Followers</label>
                                <span className="text-xs font-medium text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">10k - 1M+</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={followerRange}
                                onChange={(e) => setFollowerRange(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex justify-between text-[10px] text-zinc-500 font-medium mt-1 uppercase tracking-wide">
                                <span>Nano</span>
                                <span>Mega</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-white">Price per Post</label>
                                <span className="text-xs font-medium text-zinc-400">$50 - $5k</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={priceRange}
                                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                    </div>

                    <div className="p-4 border-t border-[#27272a] bg-[#1E1E1E] mt-auto">
                        <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                            Apply Filters
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Toolbar */}
                    <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-none bg-[#121212] z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Explore Creators</h2>
                            <p className="text-zinc-400 text-sm mt-1">Found <span className="font-bold text-white">{influencers.length}</span> creators matching your criteria</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-[#1E1E1E] border border-[#27272a] rounded-xl overflow-x-auto max-w-full">
                            <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-500 rounded-lg text-sm font-bold transition-colors whitespace-nowrap border border-purple-500/20">
                                <Camera className="w-4 h-4" /> Instagram
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:bg-[#27272a] hover:text-zinc-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                                <PlayCircle className="w-4 h-4" /> YouTube
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:bg-[#27272a] hover:text-zinc-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                                <Tv className="w-4 h-4" /> TV Stars
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:bg-[#27272a] hover:text-zinc-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                                <Music className="w-4 h-4" /> Musicians
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-8 pt-0 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-12">
                            {influencers.map((inf) => (
                                <article key={inf.id} className="group bg-[#1E1E1E] rounded-2xl border border-[#27272a] hover:border-purple-500/50 shadow-none hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                    <div className="relative h-64 w-full overflow-hidden rounded-t-2xl">
                                        <Image
                                            src={inf.user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=300"}
                                            alt={inf.user.name || "Influencer"}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
                                        <div className="absolute top-3 left-3 bg-[#1E1E1E]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white border border-white/10 shadow-sm flex items-center gap-1">
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
                                        <div className="grid grid-cols-3 gap-2 py-2 mb-4 border-b border-[#27272a]">
                                            <div className="text-center">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Followers</p>
                                                <p className="text-white font-bold text-lg">{formatFollowers(inf.followers)}</p>
                                            </div>
                                            <div className="text-center border-l border-[#27272a]">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Eng. Rate</p>
                                                <p className="text-green-400 font-bold text-lg">{inf.engagementRate}%</p>
                                            </div>
                                            <div className="text-center border-l border-[#27272a]">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Avg. Likes</p>
                                                <p className="text-white font-bold text-lg">{(inf.followers * (inf.engagementRate / 100)).toFixed(0)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {(typeof inf.niche === 'string' ? inf.niche.split(',') : inf.niche || []).filter(Boolean).map((tag, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-md bg-[#27272a] text-zinc-300 text-xs font-medium border border-[#27272a]">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="mt-auto flex gap-2">
                                            <Link href={`/brand/discover/${inf.id}`} className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.4)] text-center">
                                                View Profile
                                            </Link>
                                            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#27272a] text-zinc-400 hover:text-purple-500 hover:border-purple-500 transition-colors bg-[#27272a]">
                                                <Bookmark className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination - Keeping static for now as per instructions "minimal changes" */}
                        <div className="flex justify-center pb-12">
                            <div className="inline-flex items-center gap-2 bg-[#1E1E1E] px-4 py-2 rounded-xl shadow-none border border-[#27272a]">
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#27272a] text-zinc-500 transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(139,92,246,0.4)]">1</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#27272a] text-zinc-500 transition-colors">
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
