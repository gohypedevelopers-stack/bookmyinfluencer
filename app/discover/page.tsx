'use client';

import { useState, useEffect } from 'react';
import { Search, Instagram, Youtube, MapPin, TrendingUp, Users, Building2, Loader2, Briefcase, Star, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { MarketplaceSidebar, FilterState } from '@/components/discover/MarketplaceSidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface Creator {
    id: string;
    dbId: string;
    name: string;
    handle: string;
    niche: string;
    location: string;
    followers: string;
    followersCount: number;
    engagementRate: string;
    avgViews: string;
    profileImage: string;
    thumbnail: string;
    verified: boolean;
    tags: string[];
    priceRange: string;
    saved: boolean;
}

interface Brand {
    id: string;
    name: string;
    company: string;
    industry: string;
    location: string;
    logo: string;
    activeCampaigns: number;
    totalSpent: number;
}

export default function PublicMarketplacePage() {
    const [activeTab, setActiveTab] = useState<'creators' | 'brands'>('creators');
    const [creators, setCreators] = useState<Creator[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        location: 'All',
        niches: [],
        followersRange: [0, 1000000],
        priceRange: [50, 5000]
    });

    useEffect(() => {
        if (activeTab === 'creators') {
            fetchCreators();
        } else {
            fetchBrands();
        }
    }, [activeTab]);

    const fetchCreators = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/public/creators');
            if (res.ok) {
                const data = await res.json();
                setCreators(data.creators || []);
                // Initialize ranges based on data if needed, but defaults are fine
            }
        } catch (error) {
            console.error('Failed to fetch creators:', error);
        }
        setIsLoading(false);
    };

    const fetchBrands = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/public/brands');
            if (res.ok) {
                const data = await res.json();
                setBrands(data.brands || []);
            }
        } catch (error) {
            console.error('Failed to fetch brands:', error);
        }
        setIsLoading(false);
    };

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
        if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K';
        return '₹' + amount.toString();
    };

    const parsePriceRange = (rangeStr: string) => {
        if (!rangeStr) return [0, 0];
        const clean = rangeStr.replace(/[^0-9-]/g, '');
        const parts = clean.split('-');
        if (parts.length === 2) {
            return [parseInt(parts[0]), parseInt(parts[1])];
        }
        // Handle single price "500"
        const single = parseInt(clean);
        if (!isNaN(single)) return [single, single];
        return [0, 0];
    };

    const filteredCreators = creators.filter(creator => {
        // Search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            if (!creator.name.toLowerCase().includes(searchLower) &&
                !creator.handle.toLowerCase().includes(searchLower)) {
                return false;
            }
        }

        // Location
        if (filters.location !== 'All') {
            // Check matches
            if (!creator.location?.toLowerCase().includes(filters.location.toLowerCase()) &&
                filters.location !== creator.location) {
                return false;
            }
        }

        // Niches
        if (filters.niches.length > 0) {
            const creatorNicheStr = creator.niche || '';
            const creatorTags = creator.tags || [];

            // Allow if any selected niche matches creator niche or tags
            const hasMatch = filters.niches.some(niche => {
                const nicheLower = niche.toLowerCase();
                return creatorNicheStr.toLowerCase().includes(nicheLower) ||
                    creatorTags.some(t => t.toLowerCase().includes(nicheLower));
            });
            if (!hasMatch) return false;
        }

        // Followers
        const followers = creator.followersCount || 0;
        const [minFollowers, maxFollowers] = filters.followersRange;

        if (followers < minFollowers) return false;
        if (maxFollowers < 1000000 && followers > maxFollowers) return false;

        // Price
        const [cMin, cMax] = parsePriceRange(creator.priceRange || '');
        const [fMin, fMax] = filters.priceRange;

        // Check overlap: max(start1, start2) < min(end1, end2)
        // Creator range: [cMin, cMax]
        // Filter range: [fMin, fMax]
        // If filter max is 5000+ (treated as high number), handle it?
        // Logic: The user wants creators within budget [fMin, fMax].
        // So creator's price should fall within this range? 
        // Or if ANY part of creator's range overlaps with filter?
        // Let's go with overlap.

        const effectiveFMax = fMax >= 5000 ? 1000000 : fMax; // Treat 5k+ as huge
        const effectiveCMax = cMax === 0 ? cMin : cMax; // Handle single price

        if (Math.max(cMin, fMin) > Math.min(effectiveCMax, effectiveFMax)) {
            return false;
        }

        return true;
    });

    // Keeping Brand filtering simple on search name only for now as Sidebar is unique to creators
    // But reused Search from Sidebar for brands?
    // The sidebar Search input updates `filters.search`.
    const filteredBrands = brands.filter(brand => {
        const matchesSearch = !filters.search ||
            brand.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            brand.company.toLowerCase().includes(filters.search.toLowerCase());
        // Ignore other filters for brands for now or reuse location
        return matchesSearch;
    });

    const resetFilters = () => {
        setFilters({
            search: '',
            location: 'All',
            niches: [],
            followersRange: [0, 1000000],
            priceRange: [50, 5000]
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-12 shrink-0">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        {activeTab === 'creators' ? 'Discover Top Creators' : 'Explore Leading Brands'}
                    </h1>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        {activeTab === 'creators'
                            ? 'Connect with verified influencers across Instagram, YouTube, and more. Find the perfect match for your brand.'
                            : 'Explore brands actively looking for creators. Find collaboration opportunities and grow your career.'}
                    </p>

                    {/* Tab Switcher */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setActiveTab('creators')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${activeTab === 'creators'
                                ? 'bg-white text-slate-900 shadow-lg'
                                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Creators
                        </button>
                        <button
                            onClick={() => setActiveTab('brands')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${activeTab === 'brands'
                                ? 'bg-white text-slate-900 shadow-lg'
                                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Brands
                        </button>
                    </div>

                    {/* Mobile Search Input (since sidebar is hidden/collapsed on mobile usually) */}
                    <div className="mt-8 md:hidden px-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col lg:flex-row gap-8">

                {/* Sidebar - Desktop */}
                <div className="hidden lg:block w-72 shrink-0">
                    <div className="sticky top-24">
                        <MarketplaceSidebar
                            filters={filters}
                            setFilters={setFilters}
                            onApply={() => { }} // Dynamic, already applied applied via state
                            onReset={resetFilters}
                        />
                    </div>
                </div>

                {/* Mobile Filter Trigger */}
                <div className="lg:hidden mb-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full flex items-center justify-between">
                                <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</span>
                                <span className="text-xs bg-slate-100 rounded-full px-2 py-0.5">
                                    {filters.niches.length + (filters.location !== 'All' ? 1 : 0)}
                                </span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="h-[90vh] overflow-y-auto sm:max-w-md">
                            <MarketplaceSidebar
                                filters={filters}
                                setFilters={setFilters}
                                onApply={() => { }}
                                onReset={resetFilters}
                                className="pt-4"
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Results Grid */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {activeTab === 'creators'
                                ? `${filteredCreators.length} Creators Found`
                                : `${filteredBrands.length} Brands Found`}
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
                        </div>
                    ) : activeTab === 'creators' ? (
                        /* Creators Grid */
                        filteredCreators.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
                                {filteredCreators.map((creator) => (
                                    <div
                                        key={creator.id}
                                        className="group relative cursor-pointer h-[420px]" // Fixed height
                                    >
                                        {/* Animated border glow */}
                                        <div
                                            className="absolute -inset-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                                            style={{
                                                background: 'linear-gradient(135deg, #14b8a6, #3b82f6, #8b5cf6, #ec4899, #14b8a6)',
                                                backgroundSize: '300% 300%',
                                                animation: 'borderShimmer 3s ease infinite',
                                            }}
                                        />

                                        {/* Card container with 3D flip */}
                                        <div
                                            className="relative w-full h-full transition-transform duration-700 ease-in-out"
                                            style={{
                                                transformStyle: 'preserve-3d',
                                                transform: 'rotateY(0deg)',
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLDivElement).style.transform = 'rotateY(180deg)';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLDivElement).style.transform = 'rotateY(0deg)';
                                            }}
                                        >
                                            {/* ===== FRONT FACE ===== */}
                                            <div
                                                className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg bg-white"
                                                style={{ backfaceVisibility: 'hidden' }}
                                            >
                                                {/* Full thumbnail background */}
                                                <div className="absolute inset-0">
                                                    {(creator.thumbnail && (creator.thumbnail.startsWith('/') || creator.thumbnail.startsWith('http'))) ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={creator.thumbnail}
                                                            alt={creator.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : creator.profileImage ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={creator.profileImage}
                                                            alt={creator.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600" />
                                                    )}
                                                </div>

                                                {/* Dark gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                                {/* Top badges */}
                                                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                                                    <span className="px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                                                        <Instagram className="w-3.5 h-3.5" />
                                                        {creator.niche?.split(',')[0] || 'Creator'}
                                                    </span>
                                                    {creator.verified && (
                                                        <span className="px-3 py-1.5 bg-emerald-500/80 backdrop-blur-md rounded-full text-xs font-bold text-white border border-emerald-400/30 flex items-center gap-1 shadow-lg">
                                                            <Star className="w-3 h-3 fill-current" />
                                                            VERIFIED
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Bottom info */}
                                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                                    {/* Avatar */}
                                                    <div className="mb-3 flex items-end gap-3">
                                                        <div className="w-14 h-14 rounded-full border-[3px] border-white/80 overflow-hidden shadow-xl flex-shrink-0">
                                                            {creator.profileImage ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={creator.profileImage}
                                                                    alt={creator.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                                                    {creator.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-lg font-bold text-white truncate drop-shadow-lg">{creator.name}</h3>
                                                            <p className="text-sm text-gray-300 truncate">{creator.handle}</p>
                                                        </div>
                                                    </div>

                                                    {/* Quick stats bar */}
                                                    <div className="flex items-center gap-4 text-xs text-white/80">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {creator.followers}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" />
                                                            {creator.engagementRate}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            {creator.avgViews || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Hover hint */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30">
                                                        <svg className="w-6 h-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ===== BACK FACE ===== */}
                                            <div
                                                className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    transform: 'rotateY(180deg)',
                                                }}
                                            >
                                                {/* Gradient background */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                                                <div
                                                    className="absolute inset-0 opacity-30"
                                                    style={{
                                                        backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(20, 184, 166, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                                                    }}
                                                />

                                                {/* Decorative pattern */}
                                                <div className="absolute inset-0 opacity-5" style={{
                                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                                    backgroundSize: '20px 20px',
                                                }} />

                                                {/* Back content */}
                                                <div className="relative h-full flex flex-col p-6">
                                                    {/* Header */}
                                                    <div className="text-center mb-4">
                                                        <div className="w-16 h-16 rounded-full border-[3px] border-teal-400/60 overflow-hidden shadow-lg mx-auto mb-3 ring-4 ring-teal-400/20">
                                                            {creator.profileImage ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={creator.profileImage}
                                                                    alt={creator.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                                                                    {creator.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="text-lg font-bold text-white">{creator.name}</h3>
                                                        <p className="text-sm text-teal-300">{creator.handle}</p>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5">
                                                            <Users className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                                                            <div className="text-sm font-bold text-white">{creator.followers}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Followers</div>
                                                        </div>
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5">
                                                            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                                                            <div className="text-sm font-bold text-green-400">{creator.engagementRate}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Engage</div>
                                                        </div>
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5">
                                                            <svg className="w-4 h-4 text-purple-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            <div className="text-sm font-bold text-white">{creator.avgViews || 'N/A'}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Reach</div>
                                                        </div>
                                                    </div>

                                                    {/* Tags */}
                                                    {creator.tags && creator.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
                                                            {creator.tags.slice(0, 4).map((tag) => (
                                                                <span key={tag} className="px-2.5 py-1 bg-white/10 text-teal-200 text-xs rounded-full border border-teal-500/20 font-medium">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Price */}
                                                    <div className="text-center mb-4">
                                                        <span className="text-xs text-gray-400">Starting at </span>
                                                        <span className="text-sm font-bold text-white">{creator.priceRange || '₹100-500'}</span>
                                                    </div>

                                                    {/* CTA */}
                                                    <div className="mt-auto">
                                                        <Link
                                                            href={`/login?redirect=/brand/discover/${creator.dbId || creator.id}`}
                                                            className="block w-full text-center py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-teal-500/25 hover:scale-[1.02]"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
                                                            }}
                                                        >
                                                            View Profile
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">No creators found matching your criteria.</p>
                            </div>
                        )
                    ) : (
                        /* Brands Grid - Reusing same grid layout for consistency but without flip yet (can be added later) */
                        filteredBrands.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredBrands.map((brand) => (
                                    <div key={brand.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="relative h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                            {brand.logo ? (
                                                <Image
                                                    src={brand.logo}
                                                    alt={brand.name}
                                                    width={80}
                                                    height={80}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <Building2 className="w-16 h-16 text-slate-400" />
                                            )}
                                            <span className="absolute top-3 right-3 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" />
                                                Hiring
                                            </span>
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-bold text-gray-900 text-lg">{brand.name}</h3>
                                            <p className="text-sm text-gray-500 mb-1">{brand.company}</p>
                                            <p className="text-xs text-blue-600 font-medium mb-3">{brand.industry}</p>

                                            <div className="grid grid-cols-2 gap-2 mb-4 py-3 border-t border-b border-gray-100">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 uppercase">Active Campaigns</p>
                                                    <p className="font-bold text-gray-900">{brand.activeCampaigns}</p>
                                                </div>
                                                <div className="text-center border-l border-gray-100">
                                                    <p className="text-xs text-gray-500 uppercase">Budget</p>
                                                    <p className="font-bold text-green-600">{formatCurrency(brand.totalSpent)}</p>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/login?redirect=/creator/brands/${brand.id}`}
                                                className="block w-full text-center py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                View Campaigns
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">No brands found matching your criteria.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
