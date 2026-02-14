'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, Instagram, Youtube, TvMinimal, Music, MapPin, Bookmark, BookmarkCheck, TrendingUp, Users, DollarSign, Eye } from 'lucide-react';
import Link from 'next/link';

import { getPublicCreators } from '../actions';
import { useEffect } from 'react';
import { Slider } from "@/components/ui/slider";

interface Influencer {
    id: string; // Changed to string to match userId/uuid
    dbId: string;
    name: string;
    handle: string;
    niche: string;
    location: string;
    followers: string;
    followersCount?: number;
    engagementRate: string;
    avgViews: string;
    verified: boolean;
    tags: string[];
    priceRange: string;
    thumbnail: string;
    profileImage: string;
    saved: boolean;
}

export default function InfluencerDiscovery() {
    const [selectedTab, setSelectedTab] = useState<'instagram' | 'youtube' | 'tv' | 'music'>('instagram');
    const [showFilters, setShowFilters] = useState(true);
    // Data State
    const [allInfluencers, setAllInfluencers] = useState<Influencer[]>([]);
    const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 9;

    // Filters State
    const [selectedLocation, setSelectedLocation] = useState('India');
    const [selectedCity, setSelectedCity] = useState('Mumbai');
    const [selectedNiche, setSelectedNiche] = useState('All');
    const [priceRange, setPriceRange] = useState([50, 5000]);
    const [followersRange, setFollowersRange] = useState([0, 1000]); // in K
    const [debouncedFollowersRange, setDebouncedFollowersRange] = useState([0, 1000]);
    const [showAllNiches, setShowAllNiches] = useState(false);

    // Debounce Followers Range
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFollowersRange(followersRange);
        }, 500);
        return () => clearTimeout(timer);
    }, [followersRange]);

    // All available niches
    const allNiches = [
        'Fashion & Health', 'Tech & Gadgets', 'Fashion', 'Music',
        'Fitness', 'Travel', 'Food', 'Lifestyle', 'Gaming',
        'Beauty', 'Education', 'Finance', 'Entertainment', 'Sports',
        'Photography', 'Art & Design'
    ];
    const visibleNiches = showAllNiches ? allNiches : allNiches.slice(0, 4);

    // 1. Fetch from Server (Filtered by Niche & Followers)
    const fetchInfluencers = async () => {
        setIsLoading(true);
        try {
            const res = await getPublicCreators({
                niche: selectedNiche === 'All' ? undefined : selectedNiche,
                minFollowers: debouncedFollowersRange[0] * 1000,
                maxFollowers: debouncedFollowersRange[1] * 1000
            });
            if (res.success) {
                setAllInfluencers(res.data as Influencer[]);
            }
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    // Trigger Fetch when specific server-side params change
    useEffect(() => {
        fetchInfluencers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTab, selectedNiche, debouncedFollowersRange]);

    // 2. Client-side Filtering (Search, Location, Price) & Pagination
    useEffect(() => {
        let results = allInfluencers;

        // Search
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            results = results.filter(inf =>
                inf.name.toLowerCase().includes(lowerQ) ||
                inf.handle.toLowerCase().includes(lowerQ) ||
                (inf.niche && inf.niche.toLowerCase().includes(lowerQ))
            );
        }

        // Location
        if (selectedLocation !== 'India') {
            results = results.filter(inf =>
                inf.location?.includes(selectedLocation)
            );
        }

        // Price
        // Assuming priceRangeStr format "₹100-500" or similar in `inf.priceRange`
        // We'll try to parse it. If logic is complex, might need robust parsing.
        // For now, let's assume we filter if we can parse.
        // If Price filter is critical, we need standardized price field.
        // Checking `Influencer` interface: priceRange: string.
        results = results.filter(inf => {
            if (!inf.priceRange) return true;
            const prices = inf.priceRange.replace(/[^0-9-]/g, '').split('-').map(Number);
            const minPrice = prices[0] || 0;
            const maxPrice = prices[1] || minPrice;

            // Check overlap
            const [filterMin, filterMax] = priceRange;
            return Math.max(minPrice, filterMin) <= Math.min(maxPrice, filterMax);
        });

        // Pagination
        setTotalItems(results.length);
        const startIndex = (currentPage - 1) * itemsPerPage;
        setFilteredInfluencers(results.slice(startIndex, startIndex + itemsPerPage));

    }, [allInfluencers, searchQuery, selectedLocation, selectedCity, priceRange, currentPage]);

    // Reset Page on Filter Change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedLocation, priceRange, selectedNiche, debouncedFollowersRange]);

    const handleReset = () => {
        setSelectedLocation('India');
        setSelectedCity('Mumbai');
        setSelectedNiche('All');
        setPriceRange([50, 5000]);
        setFollowersRange([0, 1000]);
        setSearchQuery('');
        // Fetch will trigger automatically due to effect on state change
    };

    const toggleSave = (id: string) => {
        setAllInfluencers(prev => prev.map(inf =>
            inf.id === id ? { ...inf, saved: !inf.saved } : inf
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}


            {/* Platform Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="flex items-center gap-1">
                        {[
                            { id: 'instagram', label: 'Instagram', icon: Instagram },
                            { id: 'youtube', label: 'YouTube', icon: Youtube },
                            { id: 'tv', label: 'TV Stars', icon: TvMinimal },
                            { id: 'music', label: 'Musicians', icon: Music }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3.5 font-medium transition-colors relative ${selectedTab === tab.id
                                    ? 'text-teal-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {selectedTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 to-teal-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 py-6">
                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <aside className="w-72 flex-shrink-0">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900">Refine Search</h3>
                                    <button
                                        onClick={handleReset}
                                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        Reset
                                    </button>
                                </div>

                                <div className="mb-6 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="space-y-6">
                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            Location
                                        </label>
                                        <select
                                            value={selectedLocation}
                                            onChange={(e) => setSelectedLocation(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option>India</option>
                                            <option>USA</option>
                                            <option>UK</option>
                                        </select>
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option>Mumbai</option>
                                            <option>Pune</option>
                                            <option>Karnataka</option>
                                        </select>
                                    </div>

                                    {/* Niche & Category */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Niche & Category
                                        </label>
                                        <div className="space-y-2">
                                            {visibleNiches.map((item) => (
                                                <label key={item} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedNiche === item}
                                                        onChange={() => setSelectedNiche(selectedNiche === item ? 'All' : item)}
                                                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{item}</span>
                                                </label>
                                            ))}
                                            <button
                                                onClick={() => setShowAllNiches(!showAllNiches)}
                                                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                            >
                                                {showAllNiches ? '− Show less' : `+ Show ${allNiches.length - 4} more`}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Followers */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Followers
                                            <span className="ml-2 text-teal-600 text-xs">{followersRange[0]}k - {followersRange[1] === 1000 ? '1M+' : followersRange[1] + 'k'}</span>
                                        </label>
                                        <div className="px-2">
                                            <Slider
                                                min={0}
                                                max={1000}
                                                step={10}
                                                value={followersRange}
                                                onValueChange={setFollowersRange}
                                                minStepsBetweenThumbs={1}
                                                className="py-4"
                                            />
                                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                                <span>0k</span>
                                                <span>1M+</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price per Post */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Price per Post
                                            <span className="ml-2 text-teal-600 text-xs">₹{priceRange[0]} - ₹{priceRange[1] === 5000 ? '5k+' : priceRange[1]}</span>
                                        </label>
                                        <div className="px-2">
                                            <Slider
                                                min={50}
                                                max={5000}
                                                step={50}
                                                value={priceRange}
                                                onValueChange={setPriceRange}
                                                minStepsBetweenThumbs={1}
                                                className="py-4"
                                            />
                                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                                <span>₹50</span>
                                                <span>₹5k+</span>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Explore Creators
                                <span className="text-sm font-normal text-gray-500 ml-3">
                                    Showing {totalItems} creators matching your criteria
                                </span>
                            </h1>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                            </button>
                        </div>

                        {/* Influencer Grid */}
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredInfluencers.length > 0 ? filteredInfluencers.map((influencer) => (
                                    <div key={influencer.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                                        {/* Thumbnail */}
                                        <div className={`relative h-48 bg-gray-200 overflow-hidden`}>
                                            {(influencer.thumbnail && (influencer.thumbnail.startsWith('/') || influencer.thumbnail.startsWith('http'))) ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={influencer.thumbnail}
                                                    alt={influencer.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${influencer.thumbnail || 'from-gray-300 to-gray-400'}`} />
                                            )}

                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1">
                                                    <Instagram className="w-3 h-3" />
                                                    {influencer.niche}
                                                </span>
                                                {influencer.verified && (
                                                    <span className="px-2.5 py-1 bg-teal-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        VERIFIED
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => toggleSave(influencer.id)}
                                                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all"
                                            >
                                                {influencer.saved ? (
                                                    <BookmarkCheck className="w-4 h-4 text-teal-600" />
                                                ) : (
                                                    <Bookmark className="w-4 h-4 text-gray-600" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{influencer.name}</h3>
                                                <p className="text-sm text-gray-500">{influencer.handle}</p>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-3 mb-4">
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        FOLLOWERS
                                                    </div>
                                                    <div className="font-bold text-gray-900">{influencer.followers}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" />
                                                        ENG. RATE
                                                    </div>
                                                    <div className="font-bold text-green-600">{influencer.engagementRate}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        REACH
                                                    </div>
                                                    <div className="font-bold text-gray-900">{influencer.avgViews}</div>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {influencer.tags.map((tag) => (
                                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Starting at</span>
                                                    <div className="font-bold text-gray-900">{influencer.priceRange}</div>
                                                </div>
                                                <Link
                                                    href={`/discover/${influencer.id}`}
                                                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all font-medium text-sm"
                                                >
                                                    View Profile
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-10 text-center text-gray-500">
                                        No creators found matching your criteria.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalItems > itemsPerPage && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => { if (currentPage > 1) { setCurrentPage(currentPage - 1); } }}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                {(() => {
                                    const totalPages = Math.ceil(totalItems / itemsPerPage);
                                    const pages: (number | string)[] = [];

                                    if (totalPages <= 7) {
                                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                                    } else {
                                        pages.push(1);
                                        if (currentPage > 3) pages.push('...');
                                        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                                            pages.push(i);
                                        }
                                        if (currentPage < totalPages - 2) pages.push('...');
                                        pages.push(totalPages);
                                    }

                                    return pages.map((page, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (typeof page === 'number') {
                                                    setCurrentPage(page);
                                                }
                                            }}
                                            disabled={page === '...'}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === currentPage
                                                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white'
                                                : page === '...'
                                                    ? 'border border-gray-300 text-gray-400 cursor-default'
                                                    : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ));
                                })()}
                                <button
                                    onClick={() => {
                                        const totalPages = Math.ceil(totalItems / itemsPerPage);
                                        if (currentPage < totalPages) {
                                            setCurrentPage(currentPage + 1);
                                        }
                                    }}
                                    disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
