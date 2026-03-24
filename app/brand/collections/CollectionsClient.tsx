"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Star, LayoutGrid, List, Search, SlidersHorizontal, MapPin, Instagram, Youtube, BookmarkCheck, Bookmark } from "lucide-react";
import { toggleSavedInfluencer } from "@/app/brand/savedActions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CollectionsClient({ initialCreators }: { initialCreators: any[] }) {
    const [creators, setCreators] = useState(initialCreators);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const visibleCreators = creators.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.handle.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleToggleSave = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const inf = creators.find(i => i.id === id);
        const originalSaved = inf?.saved || true;

        // Optimistically update
        setCreators(prev => prev.filter(c => c.id !== id));

        try {
            const res = await toggleSavedInfluencer(id);
            if (!res.success) throw new Error(res.error);
            toast.success("Removed from collection");
        } catch (error) {
            // Revert on failure
            toast.error("Failed to remove item");
            if (inf) {
                setCreators(prev => [...prev, inf]);
            }
        }
    };

    if (creators.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                    <Bookmark className="w-10 h-10 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Saved Influencers Yet</h3>
                <p className="text-gray-500 mb-8 max-w-md text-center">
                    You haven't added any influencers to your collection. Browse the marketplace and click the bookmark icon to save profiles here.
                </p>
                <Link href="/brand/discover">
                    <Button className="font-bold px-8 h-12 rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200">
                        Explore Creators
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search saved creators..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 border bg-gray-50 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleCreators.map(influencer => (
                    <div key={influencer.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
                        {/* Banner Area */}
                        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-teal-400 via-blue-400 to-indigo-500 p-4">
                            {/* Bookmark Buton */}
                            <button
                                onClick={(e) => handleToggleSave(influencer.id, e)}
                                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all shadow-sm z-10"
                                title="Remove from collection"
                            >
                                <BookmarkCheck className="w-4 h-4 text-teal-600 fill-current" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="relative px-6 pt-14 pb-6 flex-1 flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                                    {(influencer.profileImage && (influencer.profileImage.startsWith('/') || influencer.profileImage.startsWith('http') || influencer.profileImage.startsWith('data:'))) ? (
                                        <img src={influencer.profileImage} alt={influencer.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-3xl">
                                            {influencer.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {influencer.verified && (
                                    <div className="absolute bottom-1 right-0 bg-teal-500 text-white p-1 rounded-full border-2 border-white" title="Verified Creator">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-gray-900 flex justify-center items-center gap-1.5 leading-tight mb-1">
                                    {influencer.name}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-1">
                                    <span className="text-gray-400">@</span>{influencer.handle.replace('@', '')}
                                </p>
                            </div>

                            <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wider rounded-full mb-6">
                                {influencer.niche}
                            </span>

                            {/* Stats */}
                            <div className="w-full grid grid-cols-3 gap-0 border-y border-gray-50 py-4 mb-6">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Followers</p>
                                    <p className="font-extrabold text-gray-900 text-sm">
                                        {influencer.followers}
                                    </p>
                                </div>
                                <div className="border-l border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Engage</p>
                                    <p className="font-bold text-green-600 text-sm">{influencer.engagementRate}</p>
                                </div>
                                <div className="border-l border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Match</p>
                                    <p className="font-bold text-blue-600 text-sm">90%</p>
                                </div>
                            </div>

                            <Link href={`/brand/influencers/${influencer.id}`} className="w-full mt-auto">
                                <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 shadow-sm">
                                    View Full Profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {visibleCreators.length === 0 && searchQuery && (
                <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-100">
                    No saved influencers matching "{searchQuery}"
                </div>
            )}
        </div>
    );
}
