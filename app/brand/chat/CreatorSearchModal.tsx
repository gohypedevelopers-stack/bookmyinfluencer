'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, Instagram, Youtube, Loader2, MessageSquare, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { searchCreators, createOrGetThread } from '../actions';
import { toast } from 'sonner';

interface Creator {
    id: string;
    userId: string;
    fullName: string | null;
    displayName: string | null;
    profileImage: string | null;
    niche: string | null;
    instagramUrl: string | null;
    youtubeUrl: string | null;
    bio: string | null;
    followers: number;
    email: string | null;
}

interface CreatorSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreatorSearchModal({ isOpen, onClose }: CreatorSearchModalProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [creators, setCreators] = useState<Creator[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState<string | null>(null);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [platformFilter, setPlatformFilter] = useState<string>('all');
    const [minFollowers, setMinFollowers] = useState<string>('0');

    const handleSearch = async (currPage = 1) => {
        setIsSearching(true);
        const result = await searchCreators(searchQuery, currPage, {
            platform: platformFilter !== 'all' ? platformFilter : undefined,
            minFollowers: parseInt(minFollowers) > 0 ? parseInt(minFollowers) : undefined
        });
        setIsSearching(false);

        if (result.success) {
            setCreators(result.creators);
            setTotalPages(result.totalPages || 1);
            setPage(result.page || 1);
        } else {
            toast.error(result.error || 'Failed to search creators');
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 0) { // Allow searching with empty query to see all/filtered
                handleSearch(1);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, platformFilter, minFollowers]);

    const handleStartChat = async (creator: Creator) => {
        setIsStartingChat(creator.userId);

        const result = await createOrGetThread(creator.userId);

        setIsStartingChat(null);

        if (result.success) {
            toast.success(result.isNew ? 'Conversation started!' : 'Opening conversation...');
            onClose();
            router.push(`/brand/chat?threadId=${result.threadId}`);
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to start conversation');
        }
    };

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            handleSearch(newPage);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-6 pb-4 border-b border-gray-100 flex-shrink-0">
                    <DialogTitle className="text-xl font-bold text-gray-900">Find Creators</DialogTitle>
                    <DialogDescription>
                        Search for verified creators to start a conversation
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-4 flex-1 overflow-hidden flex flex-col">
                    {/* Search & Filters */}
                    <div className="space-y-4 mb-6 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by name, niche, or social handle..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 text-base border-gray-200 focus:ring-2 focus:ring-teal-500"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-600 animate-spin" />
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Select value={platformFilter} onValueChange={setPlatformFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Platforms</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={minFollowers} onValueChange={setMinFollowers}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Followers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Any Followers</SelectItem>
                                    <SelectItem value="10000">10k+</SelectItem>
                                    <SelectItem value="50000">50k+</SelectItem>
                                    <SelectItem value="100000">100k+</SelectItem>
                                    <SelectItem value="500000">500k+</SelectItem>
                                    <SelectItem value="1000000">1M+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {creators.length === 0 && !isSearching ? (
                            <div className="text-center py-12">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">
                                    No creators found. Try a different search or filter.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {creators.map((creator) => (
                                    <div
                                        key={creator.id}
                                        className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-teal-300 transition-all"
                                    >
                                        {/* Profile Image */}
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                                            {creator.profileImage ? (
                                                <img src={creator.profileImage} alt={creator.fullName || 'Creator'} className="w-full h-full object-cover" />
                                            ) : (
                                                creator.fullName?.[0] || creator.displayName?.[0] || 'C'
                                            )}
                                        </div>

                                        {/* Creator Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base mb-1 truncate">
                                                {creator.displayName || creator.fullName || 'Anonymous Creator'}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                                                {creator.bio || 'Content creator'}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs">
                                                {creator.niche && (
                                                    <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-md font-medium">
                                                        {creator.niche}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-gray-500">
                                                    <Users className="w-3 h-3" />
                                                    {formatFollowers(creator.followers)} followers
                                                </span>
                                                {creator.instagramUrl && (
                                                    <Instagram className="w-4 h-4 text-pink-500" />
                                                )}
                                                {creator.youtubeUrl && (
                                                    <Youtube className="w-4 h-4 text-red-500" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Message Button */}
                                        <Button
                                            onClick={() => handleStartChat(creator)}
                                            disabled={isStartingChat === creator.userId}
                                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 h-auto rounded-lg whitespace-nowrap"
                                        >
                                            {isStartingChat === creator.userId ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Starting...
                                                </>
                                            ) : (
                                                <>
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Message
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 flex-shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1 || isSearching}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>
                            <span className="text-sm text-gray-500">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages || isSearching}
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
