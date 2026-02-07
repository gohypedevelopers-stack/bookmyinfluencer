'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, Instagram, Youtube, Loader2, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length < 2) {
                setCreators([]);
                return;
            }

            setIsSearching(true);
            const result = await searchCreators(searchQuery);
            setIsSearching(false);

            if (result.success) {
                setCreators(result.creators);
            } else {
                toast.error(result.error || 'Failed to search creators');
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-gray-100">
                    <DialogTitle className="text-xl font-bold text-gray-900">Find Creators</DialogTitle>
                    <DialogDescription>
                        Search for verified creators to start a conversation
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-4">
                    {/* Search Input */}
                    <div className="relative mb-6">
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

                    {/* Results */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {searchQuery.trim().length < 2 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">
                                    Type at least 2 characters to search
                                </p>
                            </div>
                        ) : creators.length === 0 && !isSearching ? (
                            <div className="text-center py-12">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">
                                    No creators found. Try a different search.
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
