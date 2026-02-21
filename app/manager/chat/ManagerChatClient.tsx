'use client';

import { pusherClient } from "@/lib/pusher";
import { useState, useOptimistic, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Send,
    Search,
    Paperclip,
    Archive,
    MoreVertical,
    User,
    ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getManagerMessages } from "../actions";
import { sendMessage } from "@/app/brand/actions"; // Reuse brand action as it's generic enough? Check usage.

// We need a sendMessage that works for Managers. 
// The existing `sendMessage` in `app/brand/actions.ts` takes `threadId`, `senderId`, `content`.
// It checks participation via `thread.participants.split(',')`.
// Validates `pusher`.
// Since we updated `assignManagerToCampaign` to add Manager ID to participants, `sendMessage` should work!

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
    title: string;
    brand: {
        companyName: string;
        user: { name: string | null; email: string | null; image: string | null };
    };
    influencer: {
        user: { name: string | null; email: string | null; image: string | null };
    };
}

interface ManagerChatClientProps {
    threads: Thread[];
    selectedThreadId?: string;
    messages: Message[];
    currentUserId: string;
}

export default function ManagerChatClient({
    threads,
    selectedThreadId: initialThreadId,
    messages: initialMessages,
    currentUserId
}: ManagerChatClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeThreadId, setActiveThreadId] = useState<string | undefined>(initialThreadId);
    const [localMessages, setLocalMessages] = useState<Message[]>(initialMessages);

    // Update local messages when initialMessages change (from server refresh)
    useEffect(() => {
        setLocalMessages(initialMessages);
    }, [initialMessages]);

    // Keep activeThreadId in sync with URL
    useEffect(() => {
        const urlThreadId = searchParams.get('threadId');
        if (urlThreadId && urlThreadId !== activeThreadId) {
            setActiveThreadId(urlThreadId);
        }
    }, [searchParams, activeThreadId]);

    const activeThread = threads.find(t => t.id === activeThreadId);

    const [messageInput, setMessageInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        localMessages,
        (state, newMessage: Message) => [...state, newMessage]
    );

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [optimisticMessages]);

    // Pusher
    useEffect(() => {
        if (!currentUserId) return;

        // Subscribe to user channel for notifications
        pusherClient.subscribe(currentUserId);

        const handleNewMessage = (newMessage: Message) => {
            if (activeThreadId && (newMessage as any).threadId === activeThreadId) {
                setLocalMessages(prev => {
                    if (prev.some(m => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });
                // router.refresh(); // Refresh to update last message etc.
            } else {
                toast.info(`New message from ${newMessage.sender.name}`);
                router.refresh();
            }
        };

        pusherClient.bind('message:new', handleNewMessage);

        return () => {
            pusherClient.unsubscribe(currentUserId);
            pusherClient.unbind('message:new', handleNewMessage);
        };
    }, [activeThreadId, currentUserId, router]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeThreadId) return;

        const currentInput = messageInput;
        setMessageInput('');

        startTransition(() => {
            addOptimisticMessage({
                id: 'temp-' + Date.now(),
                content: currentInput,
                senderId: currentUserId,
                createdAt: new Date(),
                sender: {
                    id: currentUserId,
                    name: 'Me',
                    image: null
                }
            });
        });

        try {
            const result = await sendMessage(activeThreadId, currentUserId, currentInput);
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

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
            {/* Thread List Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-white z-10 ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Manager Chat</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Search campaigns..." className="pl-9 bg-gray-50" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {threads.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No conversations yet</div>
                    ) : (
                        threads.map(thread => (
                            <Link
                                key={thread.id}
                                href={`/manager/chat?threadId=${thread.id}`}
                                className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors ${activeThreadId === thread.id ? 'bg-teal-50/50' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                    {thread.brand?.companyName?.[0] || 'C'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm">{thread.title}</h3>
                                        {thread.updatedAt && (
                                            <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                                {new Date(thread.updatedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mb-1">
                                        {thread.brand?.companyName} • {thread.influencer?.user?.name}
                                    </p>
                                    <p className="text-sm text-gray-600 truncate">
                                        {thread.lastMessage ? (
                                            thread.lastMessage.senderId === currentUserId
                                                ? `You: ${thread.lastMessage.content}`
                                                : `${thread.lastMessage.sender.name}: ${thread.lastMessage.content}`
                                        ) : <span className="italic">No messages</span>}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {activeThread ? (
                <div className="flex-1 flex flex-col h-full bg-gray-50/50">
                    {/* Header */}
                    <div className="h-16 px-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <Link href="/manager/chat" className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h3 className="font-bold text-gray-900">{activeThread.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        Brand: {activeThread.brand?.user?.name || activeThread.brand?.companyName}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        Creator: {activeThread.influencer?.user?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {optimisticMessages.map((msg, i) => {
                            const isMe = msg.senderId === currentUserId;
                            // Determine role based on senderId? 
                            // We don't have sender role in message object easily without join.
                            // But we can check against thread participants if we had their IDs.

                            return (
                                <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${isMe
                                            ? 'bg-teal-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
                                        }`}>
                                        {!isMe && (
                                            <p className="text-[10px] font-bold text-gray-500 mb-1">
                                                {msg.sender.name}
                                            </p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-teal-100' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Button type="button" variant="ghost" size="icon" className="text-gray-400">
                                <Paperclip className="w-5 h-5" />
                            </Button>
                            <Input
                                value={messageInput}
                                onChange={e => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-50 border-gray-200"
                            />
                            <Button type="submit" disabled={!messageInput.trim() || isPending} className="bg-teal-600 hover:bg-teal-700 text-white">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 bg-gray-50/30">
                    <p>Select a conversation to start chatting</p>
                </div>
            )}
        </div>
    );
}
