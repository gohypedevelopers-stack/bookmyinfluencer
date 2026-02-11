'use client';

import { pusherClient } from "@/lib/pusher";

import { useState, useOptimistic, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Ban,
    Trash2,
    Image as ImageIcon,
    Send,
    MoreVertical,
    Phone,
    Video,
    Search,
    Paperclip,
    Smile,
    ArrowLeft,
    Check,
    CheckCheck,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    Shield,
    User,
    Flag
} from 'lucide-react';
import { notifyTyping, markBrandMessagesRead, sendMessage, createOffer, finalizeOffer, blockUser, reportUser, deleteThread } from '@/app/brand/actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import CreatorSearchModal from './CreatorSearchModal';
import CallInterface from './CallInterface';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper for date formatting
const formatDate = (date: Date | string, formatStr: string) => {
    const d = new Date(date);
    if (formatStr === 'MMM d') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (formatStr === 'h:mm a') {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return d.toDateString();
}

// Types
interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    sender: {
        id: string;
        name: string | null;
        image: string | null;
    };
    read?: boolean;
    attachmentUrl?: string | null;
    attachmentType?: string | null;
}

interface Thread {
    id: string;
    candidateId?: string | null;
    lastMessage: Message | null;
    updatedAt: Date;
    influencer: {
        id: string;
        userId: string;
        instagramHandle?: string | null;
        user: {
            name: string | null;
            image: string | null;
        };
    };
    title: string;
    brandId?: string;
    offer?: {
        id: string;
        amount: number;
        deliverablesDescription: string;
        status: string;
    } | null;
    campaign?: {
        id: string;
        title: string;
    } | null;
}

interface ChatClientProps {
    threads: Thread[];
    selectedThreadId?: string;
    messages: Message[];
    currentUserId: string;
    brandProfileId: string;
}

export default function ChatClient({
    threads,
    selectedThreadId: initialThreadId,
    messages: initialMessages,
    currentUserId,
    brandProfileId
}: ChatClientProps) {
    const router = useRouter();
    const [activeThreadId, setActiveThreadId] = useState<string | undefined>(initialThreadId);
    const [localMessages, setLocalMessages] = useState<Message[]>(initialMessages);

    // Synchronize local messages when initialMessages change (from server refresh or thread switch)
    useEffect(() => {
        setLocalMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        if (activeThreadId) {
            markBrandMessagesRead(activeThreadId);
        }
    }, [activeThreadId]);

    const [messageInput, setMessageInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageCount = useRef(initialMessages.length);
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        localMessages,
        (state, newMessage: Message) => [...state, newMessage]
    );
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Call State
    const [isCallOpen, setIsCallOpen] = useState(false);
    const [initialIsVideo, setInitialIsVideo] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Audio
    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Notification sound
    }, []);

    // Derived State
    const activeThread = threads.find(t => t.id === activeThreadId);

    // Mark messages as read in DB when opening thread
    useEffect(() => {
        if (activeThreadId) {
            markBrandMessagesRead(activeThreadId);
        }
    }, [activeThreadId]);



    // Online Status State
    const [onlineMembers, setOnlineMembers] = useState<Set<string>>(new Set());

    // Pusher Integration
    useEffect(() => {
        pusherClient.subscribe(currentUserId);

        const channel = activeThreadId ? pusherClient.subscribe(`presence-thread-${activeThreadId}`) : null;

        const handleNewMessage = (newMessage: Message) => {
            // ... existing message logic ...
            if (activeThreadId && (newMessage as any).threadId === activeThreadId) {
                // If message is from other user, play sound and mark read
                if (newMessage.senderId !== currentUserId) {
                    audioRef.current?.play().catch(e => console.error("Audio play failed", e));
                    markBrandMessagesRead(activeThreadId);
                }

                setLocalMessages(prev => {
                    if (prev.some(m => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });

                router.refresh();
            } else {
                // Notification for other threads
                audioRef.current?.play().catch(e => console.error("Audio play failed", e));
                toast.info(`New message from ${newMessage.sender.name}`);
                router.refresh();
            }
        };

        const handleTyping = (data: { userId: string }) => {
            if (data.userId !== currentUserId) setIsTyping(true);
        };

        const handleStopTyping = (data: { userId: string }) => {
            if (data.userId !== currentUserId) setIsTyping(false);
        };

        const handleRead = (data: { userId: string }) => {
            // If other user read my messages
            if (data.userId !== currentUserId) {
                setLocalMessages(prev => prev.map(m => m.read ? m : { ...m, read: true, status: 'SEEN', seenAt: new Date() }));
                router.refresh();
            }
        };

        // Presence Events
        const handleMemberAdded = (member: any) => {
            setOnlineMembers(prev => new Set(prev).add(member.id));
        };
        const handleMemberRemoved = (member: any) => {
            setOnlineMembers(prev => {
                const newSet = new Set(prev);
                newSet.delete(member.id);
                return newSet;
            });
        };
        const handleSubscriptionSucceeded = (members: any) => {
            const membersSet = new Set<string>();
            members.each((member: any) => membersSet.add(member.id));
            setOnlineMembers(membersSet);
        };

        pusherClient.bind('message:new', handleNewMessage);

        if (channel) {
            channel.bind('typing:start', handleTyping);
            channel.bind('typing:stop', handleStopTyping);
            channel.bind('message:seen', handleRead);
            channel.bind('pusher:member_added', handleMemberAdded);
            channel.bind('pusher:member_removed', handleMemberRemoved);
            channel.bind('pusher:subscription_succeeded', handleSubscriptionSucceeded);
        }

        return () => {
            pusherClient.unsubscribe(currentUserId);
            if (activeThreadId) pusherClient.unsubscribe(`presence-thread-${activeThreadId}`);
            pusherClient.unbind('message:new', handleNewMessage);
            if (channel) {
                channel.unbind('typing:start', handleTyping);
                channel.unbind('typing:stop', handleStopTyping);
                channel.unbind('message:seen', handleRead);
                channel.unbind('pusher:member_added', handleMemberAdded);
                channel.unbind('pusher:member_removed', handleMemberRemoved);
                channel.unbind('pusher:subscription_succeeded', handleSubscriptionSucceeded);
            }
        };
    }, [activeThreadId, currentUserId, router]);

    // Report Dialog State
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isReporting, setIsReporting] = useState(false);



    // Scroll to bottom logic
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Determine if we should scroll
        const isInitialLoad = lastMessageCount.current === 0;
        const hasNewMessage = optimisticMessages.length > lastMessageCount.current;

        // Check if user is near bottom (within 100px)
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        // Scroll if:
        // 1. Initial load
        // 2. User just sent a message (we can detect this more reliably by checking senderId of last message)
        const lastMsg = optimisticMessages[optimisticMessages.length - 1];
        const isFromMe = lastMsg?.senderId === currentUserId;

        if (isInitialLoad || (hasNewMessage && (isNearBottom || isFromMe))) {
            messagesEndRef.current?.scrollIntoView({ behavior: isInitialLoad ? 'auto' : 'smooth' });
        }

        lastMessageCount.current = optimisticMessages.length;
    }, [optimisticMessages, currentUserId]);

    // Update active thread when URL changes
    useEffect(() => {
        if (initialThreadId && initialThreadId !== activeThreadId) {
            setActiveThreadId(initialThreadId);
            if (socket) {
                socket.emit('join-room', `thread:${initialThreadId}`);
            }
        }
    }, [initialThreadId, activeThreadId, socket]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!messageInput.trim() && !fileAttachment) || !activeThreadId) return;

        const currentInput = messageInput;
        const currentAttachment = fileAttachment;

        setMessageInput('');
        setFileAttachment(null);

        // Optimistic update
        startTransition(() => {
            addOptimisticMessage({
                id: 'config-temp-' + Date.now(),
                content: currentInput,
                senderId: currentUserId,
                createdAt: new Date(),
                sender: {
                    id: currentUserId,
                    name: 'Me',
                    image: null
                },
                read: false,
                attachmentUrl: currentAttachment?.url,
                attachmentType: currentAttachment?.type
            });
        });

        try {
            const result = await sendMessage(activeThreadId, currentUserId, currentInput, currentAttachment?.url, currentAttachment?.type);
            if (!result.success) {
                toast.error('Failed to send message');
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error('Error sending message');
        }
    };

    const [fileAttachment, setFileAttachment] = useState<{ url: string; type: string; name: string } | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setFileAttachment({
                url: data.url,
                type: file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
                name: file.name
            });
            toast.success("File attached");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCreateOffer = async (amount: number, description: string) => {
        if (!activeThread?.candidateId) return;

        try {
            const result = await createOffer(activeThread.candidateId, amount, description);
            if (result.success) {
                toast.success('Offer created!');
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to create offer');
        }
    };

    const handleFinalizeContract = async () => {
        if (!activeThread?.candidateId) return;

        try {
            const result = await finalizeOffer(activeThread.candidateId);
            if (result.success) {
                toast.success('Contract finalized!');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to finalize');
            }
        } catch (error) {
            toast.error('Failed to finalize contract');
        }
    };

    const handleBlockUser = async () => {
        if (!activeThread?.influencer?.userId) return;
        if (!confirm("Are you sure you want to block this user? They won't be able to message you.")) return;

        try {
            const result = await blockUser(activeThread.influencer.userId);
            if (result.success) {
                toast.success('User blocked successfully');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to block user');
            }
        } catch (error) {
            toast.error('Failed to block user');
        }
    };

    const handleClearChat = async () => {
        if (!activeThreadId) return;
        if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) return;

        try {
            const result = await deleteThread(activeThreadId);
            if (result.success) {
                toast.success('Conversation deleted');
                setActiveThreadId(undefined);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to delete conversation');
            }
        } catch (error) {
            toast.error('Failed to delete conversation');
        }
    };

    const handleReportUser = async () => {
        if (!activeThread?.influencer?.userId || !reportReason.trim()) return;
        setIsReporting(true);

        try {
            const result = await reportUser(activeThread.influencer.userId, reportReason);
            if (result.success) {
                toast.success('User reported. Our team will review this shortly.');
                setIsReportOpen(false);
                setReportReason('');
            } else {
                toast.error(result.error || 'Failed to report user');
            }
        } catch (error) {
            toast.error('Failed to report user');
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
            {/* Thread List Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-white z-10 ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>
                {/* Search Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => setIsSearchModalOpen(true)}
                        >
                            <span className="material-symbols-outlined">edit_square</span>
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                    </div>
                </div>

                {/* Thread List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {threads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-gray-400">chat_bubble_outline</span>
                            </div>
                            <p className="font-medium text-gray-900 mb-1">No messages yet</p>
                            <p className="text-sm mb-4">Start connecting with creators to see your conversations here.</p>
                            <Button onClick={() => setIsSearchModalOpen(true)} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                                Find Creators
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {threads.map((thread) => {
                                const lastMsgDate = thread.lastMessage ? new Date(thread.lastMessage.createdAt) : new Date(thread.updatedAt);
                                return (
                                    <Link
                                        key={thread.id}
                                        href={`/brand/chat?threadId=${thread.id}`}
                                        className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${activeThreadId === thread.id ? 'bg-teal-50/50 hover:bg-teal-50' : ''}`}
                                    >
                                        {activeThreadId === thread.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />
                                        )}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 p-[2px]">
                                                <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                                                    {thread.influencer.user.image ? (
                                                        <img src={thread.influencer.user.image} alt="" className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                                                            {thread.influencer.user.name?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`text-sm truncate ${activeThreadId === thread.id ? 'font-bold text-teal-900' : 'font-semibold text-gray-900'}`}>
                                                    {thread.title}
                                                </h3>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                    {formatDate(lastMsgDate, 'MMM d')}
                                                </span>
                                            </div>
                                            <p className={`text-sm truncate ${activeThreadId === thread.id ? 'text-teal-700 font-medium' : 'text-gray-500'}`}>
                                                {thread.lastMessage ? (
                                                    thread.lastMessage.senderId === currentUserId ? `You: ${thread.lastMessage.content}` : thread.lastMessage.content
                                                ) : (
                                                    <span className="italic">No messages yet</span>
                                                )}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {activeThread ? (
                <div className={`flex-1 flex flex-col items-stretch h-full bg-gray-50/50 z-0 ${activeThreadId ? 'flex' : 'hidden md:flex'}`}>
                    {/* Chat Header */}
                    <div className="h-16 px-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            {/* Mobile Back Button */}
                            <Link href="/brand/chat" className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>

                            <div className="relative">
                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100">
                                    {activeThread.influencer.user.image ? (
                                        <img src={activeThread.influencer.user.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                                            {activeThread.influencer.user.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                    {activeThread.title}
                                    {activeThread.candidateId && (
                                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider border border-teal-100">
                                            Campaign
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{activeThread.influencer.user.name}</span>
                                    {activeThread.influencer.instagramHandle && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">photo_camera</span>
                                                @{activeThread.influencer.instagramHandle}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                                onClick={() => {
                                    setInitialIsVideo(false);
                                    setIsCallOpen(true);
                                }}
                            >
                                <Phone className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                                onClick={() => {
                                    setInitialIsVideo(true);
                                    setIsCallOpen(true);
                                }}
                            >
                                <Video className="w-5 h-5" />
                            </Button>
                            <div className="w-px h-8 bg-gray-200 mx-2"></div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button suppressHydrationWarning variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={`/brand/influencers/${activeThread.influencer.userId}`} className="cursor-pointer">
                                            <User className="w-4 h-4 mr-2" />
                                            View Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleClearChat} className="text-orange-600 cursor-pointer">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear Chat
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setIsReportOpen(true)} className="text-amber-600 cursor-pointer">
                                        <Flag className="w-4 h-4 mr-2" />
                                        Report User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleBlockUser} className="text-red-600 cursor-pointer">
                                        <Ban className="w-4 h-4 mr-2" />
                                        Block User
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Report Dialog */}
                    {isReportOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Report User</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Please tell us why you are reporting this user. We take all reports seriously.
                                </p>
                                <textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="Describe the issue (e.g., spam, harassment, inappropriate content)..."
                                    className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none text-sm"
                                />
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsReportOpen(false)} disabled={isReporting}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleReportUser}
                                        disabled={!reportReason.trim() || isReporting}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isReporting ? 'Submitting...' : 'Submit Report'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages Area */}
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/patterns/subtle-dots.png')]"
                    >
                        {/* Offer/Contract Status Banner if applicable */}
                        {activeThread.offer && (
                            <div className="mx-auto max-w-lg mb-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-teal-100 text-teal-600 rounded-lg">
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-gray-900 text-sm">Offer Details</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                            ${activeThread.offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                activeThread.offer.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {activeThread.offer.status}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-2xl font-bold text-gray-900">₹{activeThread.offer.amount.toLocaleString()}</span>
                                            <span className="text-xs text-gray-500 uppercase font-semibold">Total Budget</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-4">{activeThread.offer.deliverablesDescription}</p>

                                        {activeThread.offer.status === 'ACCEPTED' && !activeThread.campaign?.id && ( // Placeholder check for contract status
                                            <Button onClick={handleFinalizeContract} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                                                Finalize Contract
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {optimisticMessages.map((msg, idx) => {
                            const isMe = msg.senderId === currentUserId;
                            const isConsecutive = idx > 0 && optimisticMessages[idx - 1].senderId === msg.senderId;

                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!isMe && !isConsecutive ? (
                                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                                {msg.sender.image ? (
                                                    <img src={msg.sender.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                        {msg.sender.name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-8 flex-shrink-0" />
                                        )}

                                        <div className={`group relative p-3.5 text-sm leading-relaxed shadow-sm
                                            ${isMe
                                                ? 'bg-teal-600 text-white rounded-2xl rounded-tr-sm'
                                                : 'bg-white text-gray-900 border border-gray-100 rounded-2xl rounded-tl-sm'
                                            } ${isConsecutive ? (isMe ? 'rounded-tr-2xl -mt-4' : 'rounded-tl-2xl -mt-4') : ''}
                                        `}>
                                            {msg.attachmentUrl && (
                                                <div className="mb-2">
                                                    {msg.attachmentType === 'IMAGE' ? (
                                                        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                                                            <img src={msg.attachmentUrl} alt="Attachment" className="w-full h-full object-cover" />
                                                        </a>
                                                    ) : (
                                                        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                                            <div className="p-2 bg-white rounded-md shadow-sm">
                                                                <FileText className="w-5 h-5 text-teal-600" />
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-700 underline truncate max-w-[150px]">
                                                                View Attachment
                                                            </span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {msg.content}
                                            <span className={`text-[10px] absolute bottom-1 ${isMe ? 'right-2 text-teal-200' : 'left-2 text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                {formatDate(new Date(msg.createdAt), 'h:mm a')}
                                                {isMe && (
                                                    <span className="ml-1 inline-flex">
                                                        {msg.read ? (
                                                            <CheckCheck className="w-3 h-3 text-blue-300" />
                                                        ) : (
                                                            <CheckCheck className="w-3 h-3 text-teal-200/70" />
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="flex items-end gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                        {activeThread.influencer.user.image ? (
                                            <img src={activeThread.influencer.user.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                {activeThread.influencer.user.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-50 transition-all">
                            <div className="flex items-center gap-1 pb-2 pl-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept="image/*,application/pdf"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full ${isUploading ? 'animate-pulse' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-full">
                                    <Smile className="w-5 h-5" />
                                </Button>
                            </div>
                            {fileAttachment && (
                                <div className="absolute bottom-full left-4 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-100 flex items-center gap-2">
                                    <div className="p-1 bg-teal-50 rounded">
                                        {fileAttachment.type === 'IMAGE' ? <ImageIcon className="w-4 h-4 text-teal-600" /> : <FileText className="w-4 h-4 text-teal-600" />}
                                    </div>
                                    <span className="text-xs font-medium max-w-[150px] truncate">{fileAttachment.name}</span>
                                    <button onClick={() => setFileAttachment(null)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <Textarea
                                value={messageInput}
                                onChange={(e) => {
                                    setMessageInput(e.target.value);
                                    if (activeThreadId) {
                                        // Debounced Server Action
                                        // We need to implement throttling or just fire it
                                        // For simplicity, just fire it (Pusher handles some load, but usually we debounce)
                                        notifyTyping(activeThreadId, true);

                                        // TODO: Implement proper debounce to avoid spamming server actions per keystroke
                                        // For now, let's just do it
                                        // Actually, we can't import server action directly inside useEffect easily if it's not passed or imported
                                        // We need to import `notifyTyping` at top
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Type your message..."
                                className="min-h-[44px] max-h-32 py-3 bg-transparent border-none focus-visible:ring-0 resize-none text-gray-900 placeholder:text-gray-400"
                            />
                            <div className="pb-1 pr-1">
                                <Button
                                    type="submit"
                                    disabled={!messageInput.trim() || isPending}
                                    className="h-10 w-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 p-0 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 text-center p-8">
                    <div className="w-24 h-24 bg-white rounded-full shadow-xl shadow-gray-200/50 flex items-center justify-center mb-6 animate-pulse-slow">
                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-teal-600">forum</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Conversations</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Select a conversation from the list or start a new one to connect with creators.
                    </p>
                    <Button onClick={() => setIsSearchModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 rounded-full text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-600/40 transition-all hover:-translate-y-1">
                        Find Creators to Message
                    </Button>
                </div>
            )}

            <CreatorSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
            />

            {activeThread && (
                <CallInterface
                    isOpen={isCallOpen}
                    onClose={() => setIsCallOpen(false)}
                    currentUserId={currentUserId}
                    currentUserName="Me" // Ideally fetch actual name
                    currentUserImage={null}
                    recipientId={activeThread.influencer.userId}
                    recipientName={activeThread.influencer.user.name || "Influencer"}
                    recipientImage={activeThread.influencer.user.image}
                    initialIsVideo={initialIsVideo}
                    socket={socket}
                />
            )}
        </div>
    );
}
