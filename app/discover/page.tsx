'use client';

import { useState, useEffect } from 'react';
import { Search, Instagram, Youtube, MapPin, TrendingUp, Users, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';

interface Creator {
    id: string;
    name: string;
    handle: string;
    niche: string;
    location: string;
    followers: number;
    engagementRate: number;
    profileImage: string;
    verified: boolean;
}

export default function PublicMarketplacePage() {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNiche, setSelectedNiche] = useState('All');

    useEffect(() => {
        fetchCreators();
    }, []);

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

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    const filteredCreators = creators.filter(creator => {
        const matchesSearch = !searchQuery ||
            creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            creator.handle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesNiche = selectedNiche === 'All' ||
            creator.niche.toLowerCase().includes(selectedNiche.toLowerCase());
        return matchesSearch && matchesNiche;
    });

    const niches = ['All', 'Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Music', 'Lifestyle'];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Discover Top Creators
                    </h1>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                        Connect with verified influencers across Instagram, YouTube, and more.
                        Find the perfect match for your brand.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search creators by name, niche, or location..."
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
                        {niches.map((niche) => (
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
                        {filteredCreators.length} Creators Found
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
                    </div>
                ) : filteredCreators.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCreators.map((creator) => (
                            <div key={creator.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Image */}
                                <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300">
                                    {creator.profileImage && (
                                        <Image
                                            src={creator.profileImage}
                                            alt={creator.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                    {creator.verified && (
                                        <span className="absolute top-3 right-3 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                            ✓ Verified
                                        </span>
                                    )}
                                    <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full flex items-center gap-1">
                                        <Instagram className="w-3 h-3" />
                                        {creator.niche.split(',')[0]}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 text-lg">{creator.name}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{creator.handle}</p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-gray-100">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 uppercase">Followers</p>
                                            <p className="font-bold text-gray-900">{formatFollowers(creator.followers)}</p>
                                        </div>
                                        <div className="text-center border-l border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase">Engage</p>
                                            <p className="font-bold text-green-600">{creator.engagementRate}%</p>
                                        </div>
                                        <div className="text-center border-l border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase">Location</p>
                                            <p className="font-bold text-gray-700 text-xs">{creator.location || 'India'}</p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/login?redirect=/brand/influencers/${creator.id}`}
                                        className="block w-full text-center py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No creators found matching your criteria.</p>
                        <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
