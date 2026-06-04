'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Search,
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
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import { InfluencerProfile, User } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentsPanel } from '@/components/brand/CommentsPanel';
import { ProfileModal } from '@/components/brand/ProfileModal';

type InfluencerWithUser = InfluencerProfile & { user: User };

interface DiscoveryClientProps {
    influencers: InfluencerWithUser[];
}

export default function DiscoveryClient({ influencers }: DiscoveryClientProps) {
    const [priceRange, setPriceRange] = useState(30);
    const [followerRange, setFollowerRange] = useState(60);
    const [activePlatform, setActivePlatform] = useState('Instagram');
    const [isFiltering, setIsFiltering] = useState(false);
    
    // Modal states
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Format helpers
    const formatFollowers = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
        return count.toString();
    };

    const getNicheTags = (niche?: string | null) =>
        (niche || '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

    const platforms = [
        { id: 'Instagram', icon: Camera },
        { id: 'YouTube', icon: PlayCircle },
        { id: 'TV Stars', icon: Tv },
        { id: 'Musicians', icon: Music },
    ];

    const handlePlatformChange = (platformId: string) => {
        if (activePlatform === platformId) return;
        setIsFiltering(true);
        setActivePlatform(platformId);
        setTimeout(() => setIsFiltering(false), 400); // Simulate network/filter delay
    };

    const filteredInfluencers = influencers.filter((inf) => {
        const niches = getNicheTags(inf.niche).join(' ').toLowerCase();
        if (activePlatform === 'YouTube') return niches.includes('tech') || niches.includes('gaming') || niches.includes('youtube') || niches.includes('vlog');
        if (activePlatform === 'TV Stars') return niches.includes('actor') || niches.includes('tv') || niches.includes('model') || niches.includes('entertainment');
        if (activePlatform === 'Musicians') return niches.includes('music') || niches.includes('singer') || niches.includes('dance') || niches.includes('dj');
        return true; // Instagram default
    });

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

                <nav className="hidden lg:flex items-center gap-2 mx-auto">
                    <Link href="/brand/discover" className="relative group px-4 py-2 rounded-xl transition-all duration-300">
                        <span className="relative z-10 text-sm font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">Discover</span>
                        <div className="absolute inset-0 bg-indigo-50/80 rounded-xl scale-100 transition-transform shadow-inner border border-indigo-100/50"></div>
                        <div className="absolute -inset-2 bg-indigo-400/20 blur-xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
                    </Link>
                    <Link href="/brand/campaigns" className="relative group px-4 py-2 rounded-xl transition-all duration-300 hover:bg-slate-100/80">
                        <span className="relative z-10 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Campaigns</span>
                    </Link>
                    <Link href="/brand/chat" className="relative group px-4 py-2 rounded-xl transition-all duration-300 hover:bg-slate-100/80">
                        <span className="relative z-10 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Messages</span>
                    </Link>
                    <Link href="/brand/analytics" className="relative group px-4 py-2 rounded-xl transition-all duration-300 hover:bg-slate-100/80">
                        <span className="relative z-10 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Analytics</span>
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsCommentsOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors shadow-sm border border-transparent hover:border-slate-200 group relative"
                    >
                        <MessageCircle className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-white animate-pulse"></span>
                    </button>
                    <button 
                        onClick={() => setIsProfileOpen(true)}
                        className="w-10 h-10 rounded-full border-2 border-slate-200 overflow-hidden relative hover:border-indigo-400 transition-colors shadow-sm cursor-pointer hover:shadow-md hover:scale-105"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
                            alt="User Profile"
                            fill
                            className="object-cover"
                        />
                    </button>
                </div>
            </header>
            
            <CommentsPanel isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} />
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

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
                    <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-none bg-white z-10 border-b border-gray-200 shadow-sm relative">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Explore Creators</h2>
                            <p className="text-slate-500 font-medium text-sm mt-1">Found <span className="font-bold text-indigo-600">{filteredInfluencers.length}</span> creators matching your criteria</p>
                        </div>
                        <div className="flex items-center p-1.5 bg-slate-100/80 border border-slate-200/60 rounded-2xl overflow-x-auto max-w-full backdrop-blur-xl shadow-inner relative">
                            {platforms.map((platform) => {
                                const Icon = platform.icon;
                                const isActive = activePlatform === platform.id;
                                return (
                                    <button
                                        key={platform.id}
                                        onClick={() => handlePlatformChange(platform.id)}
                                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap z-10 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activePlatform"
                                                className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200/50"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-white' : 'text-slate-400'}`} /> 
                                        <span className="relative z-10">{platform.id}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-8 pt-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gray-50/50">
                        {isFiltering ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                    <p className="text-slate-500 font-bold animate-pulse">Finding {activePlatform} creators...</p>
                                </div>
                            </div>
                        ) : (
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-12 pt-8"
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                                }}
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredInfluencers.length > 0 ? filteredInfluencers.map((inf) => (
                                        <motion.article 
                                            layoutId={`card-${inf.id}`}
                                            key={inf.id} 
                                            variants={{
                                                hidden: { opacity: 0, y: 20, scale: 0.95 },
                                                show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
                                                exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
                                            }}
                                            initial="hidden"
                                            animate="show"
                                            exit="exit"
                                            className="group bg-white rounded-[2rem] border border-slate-200/60 hover:border-indigo-300/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col h-full overflow-hidden relative cursor-pointer"
                                        >
                                            <Link href={`/brand/discover/${inf.id}`} className="flex flex-col h-full">
                                                {/* Top Image Section */}
                                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[2rem]">
                                                    <Image
                                                        src={inf.user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=450"}
                                                        alt={inf.user.name || "Influencer"}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-[0.25,1,0.5,1]"
                                                    />
                                                    
                                                    {/* Sharp Dark Gradient at Bottom */}
                                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90"></div>
                                                    
                                                    {/* Top Badges */}
                                                    <div className="absolute top-4 left-4 flex gap-2">
                                                        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800 border border-white/20 shadow-lg flex items-center gap-1.5">
                                                            {activePlatform === 'YouTube' ? <PlayCircle className="w-3.5 h-3.5 text-red-500" /> : 
                                                             activePlatform === 'TV Stars' ? <Tv className="w-3.5 h-3.5 text-amber-500" /> :
                                                             activePlatform === 'Musicians' ? <Music className="w-3.5 h-3.5 text-indigo-500" /> :
                                                             <Camera className="w-3.5 h-3.5 text-pink-500" />}
                                                            <span>{getNicheTags(inf.niche)[0] || 'Creator'}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white backdrop-blur-md px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/40 flex items-center gap-1 border border-white/20">
                                                        <Check className="w-3 h-3" />
                                                        Verified
                                                    </div>
                                                    
                                                    {/* Bottom Name overlay */}
                                                    <div className="absolute bottom-4 left-5 right-5 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                        <h3 className="font-black text-2xl tracking-tight leading-tight drop-shadow-lg">{inf.user.name}</h3>
                                                        <p className="text-[13px] text-slate-200 font-medium opacity-90 mt-1.5 flex items-center gap-2 drop-shadow-md">
                                                            <span>{inf.instagramHandle || '@handle'}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                            <span>{inf.location || 'India'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Bottom Stats & Details Section */}
                                                <div className="p-6 flex flex-col flex-1 relative z-10 bg-white">
                                                    
                                                    {/* Premium Metric Cards */}
                                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                                        <div className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors duration-300">
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Followers</p>
                                                            <p className="text-slate-800 font-black text-lg tracking-tight group-hover:text-indigo-900 transition-colors">{formatFollowers(inf.followers)}</p>
                                                        </div>
                                                        <div className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-emerald-50/50 group-hover:border-emerald-100 transition-colors duration-300">
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Eng Rate</p>
                                                            <p className="text-slate-800 font-black text-lg tracking-tight group-hover:text-emerald-700 transition-colors">{inf.engagementRate}%</p>
                                                        </div>
                                                        <div className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors duration-300">
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Avg Likes</p>
                                                            <p className="text-slate-800 font-black text-lg tracking-tight group-hover:text-blue-900 transition-colors">{(inf.followers * (inf.engagementRate / 100)).toFixed(0)}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {getNicheTags(inf.niche).slice(1, 4).map((tag, i) => (
                                                            <span key={i} className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200 group-hover:border-slate-300 transition-colors">{tag}</span>
                                                        ))}
                                                        {getNicheTags(inf.niche).length > 4 && (
                                                            <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold">+{getNicheTags(inf.niche).length - 4}</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Call to Actions */}
                                                    <div className="mt-auto flex gap-3 pt-4 border-t border-slate-100">
                                                        <div className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-[13px] group-hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg text-center flex items-center justify-center gap-1.5 group/btn">
                                                            View Full Profile
                                                            <ChevronRight className="w-4 h-4 opacity-70 group-hover/btn:translate-x-1 transition-transform" />
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.preventDefault(); /* save logic */ }}
                                                            className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:bg-indigo-50 bg-white"
                                                        >
                                                            <Bookmark className="w-5 h-5 transition-colors" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.article>
                                    )) : (
                                        <motion.div 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            className="col-span-1 md:col-span-2 xl:col-span-3 2xl:col-span-4 text-center py-24 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200 border-dashed"
                                        >
                                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                                <Search className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800 mb-2">No creators found for {activePlatform}</h3>
                                            <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm mx-auto">Try adjusting your filters or checking back later as our network expands.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

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
