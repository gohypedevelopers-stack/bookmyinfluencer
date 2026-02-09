'use client';

import { useState, useEffect } from 'react';
import { Search, Instagram, Youtube, MapPin, TrendingUp, Users, Building2, Loader2, Briefcase, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNiche, setSelectedNiche] = useState('All');

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

    const filteredCreators = creators.filter(creator => {
        const matchesSearch = !searchQuery ||
            creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            creator.handle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesNiche = selectedNiche === 'All' ||
            creator.niche.toLowerCase().includes(selectedNiche.toLowerCase());
        return matchesSearch && matchesNiche;
    });

    const filteredBrands = brands.filter(brand => {
        const matchesSearch = !searchQuery ||
            brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            brand.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesNiche = selectedNiche === 'All' ||
            brand.industry.toLowerCase().includes(selectedNiche.toLowerCase());
        return matchesSearch && matchesNiche;
    });

    const creatorNiches = ['All', 'Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Music', 'Lifestyle'];
    const brandIndustries = ['All', 'Technology', 'Fashion', 'Food & Beverage', 'Health', 'Finance', 'Entertainment', 'E-commerce'];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {activeTab === 'creators' ? 'Discover Top Creators' : 'Explore Leading Brands'}
                    </h1>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                        {activeTab === 'creators'
                            ? 'Connect with verified influencers across Instagram, YouTube, and more. Find the perfect match for your brand.'
                            : 'Explore brands actively looking for creators. Find collaboration opportunities and grow your career.'}
                    </p>

                    {/* Tab Switcher */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('creators')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${activeTab === 'creators'
                                ? 'bg-white text-slate-900 shadow-lg'
                                : 'bg-slate-700 text-white hover:bg-slate-600'
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            Creators
                        </button>
                        <button
                            onClick={() => setActiveTab('brands')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${activeTab === 'brands'
                                ? 'bg-white text-slate-900 shadow-lg'
                                : 'bg-slate-700 text-white hover:bg-slate-600'
                                }`}
                        >
                            <Building2 className="w-5 h-5" />
                            Brands
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={activeTab === 'creators'
                                ? "Search creators by name, niche, or location..."
                                : "Search brands by name or industry..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        {(activeTab === 'creators' ? creatorNiches : brandIndustries).map((niche) => (
                            <button
                                key={niche}
                                onClick={() => setSelectedNiche(niche)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedNiche === niche
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {niche}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-6 py-8">
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
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCreators.map((creator) => (
                                <div key={creator.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                                    {/* Thumbnail */}
                                    <div className="relative h-48 bg-gray-200 overflow-hidden">
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
                                            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500" />
                                        )}

                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1">
                                                <Instagram className="w-3 h-3" />
                                                {creator.niche?.split(',')[0] || 'Creator'}
                                            </span>
                                            {creator.verified && (
                                                <span className="px-2.5 py-1 bg-teal-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white flex items-center gap-1">
                                                    ✓ VERIFIED
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{creator.name}</h3>
                                            <p className="text-sm text-gray-500">{creator.handle}</p>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    FOLLOWERS
                                                </div>
                                                <div className="font-bold text-gray-900">{creator.followers}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" />
                                                    ENG. RATE
                                                </div>
                                                <div className="font-bold text-green-600">{creator.engagementRate}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">
                                                    REACH
                                                </div>
                                                <div className="font-bold text-gray-900">{creator.avgViews || 'N/A'}</div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {creator.tags && creator.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {creator.tags.map((tag) => (
                                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="text-sm">
                                                <span className="text-gray-500">Starting at</span>
                                                <div className="font-bold text-gray-900">{creator.priceRange || '₹100-500'}</div>
                                            </div>
                                            <Link
                                                href={`/login?redirect=/brand/discover/${creator.dbId || creator.id}`}
                                                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                                            >
                                                View Profile
                                            </Link>
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
                    /* Brands Grid */
                    filteredBrands.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    );
}
