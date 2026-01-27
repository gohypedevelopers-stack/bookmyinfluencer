'use client';

import { useState, useEffect } from 'react';
import { Search, MoreVertical, Paperclip, Send, CheckCircle2, Clock, FileText, DollarSign, Calendar, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendMessage } from '../actions';
import { ChatThread, Message, User, InfluencerProfile } from '@prisma/client';

type ThreadWithDetails = ChatThread & {
    influencer: InfluencerProfile & { user: User };
    lastMessage?: Message;
    messages?: Message[];
    candidate?: any;
};

interface ChatClientProps {
    threads: ThreadWithDetails[];
    selectedThreadId?: string;
    messages: (Message & { sender: User })[];
    currentUserId: string;
    brandProfileId: string;
}

export default function ChatClient({ threads, selectedThreadId, messages, currentUserId, brandProfileId }: ChatClientProps) {
    const router = useRouter();
    const [messageInput, setMessageInput] = useState('');
    const [optimisticMessages, setOptimisticMessages] = useState(messages);
    const [showNegotiation, setShowNegotiation] = useState(true);

    // Find active thread
    const activeThread = threads.find(t => t.id === selectedThreadId) || (threads.length > 0 ? threads[0] : null);
    const candidate = activeThread?.candidate;
    const currentOffer = candidate?.offer;

    useEffect(() => {
        setOptimisticMessages(messages);
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeThread) return;

        const content = messageInput;
        setMessageInput('');

        // Optimistic UI
        const tempMsg: any = {
            id: 'temp-' + Date.now(),
            content,
            senderId: currentUserId,
            sender: { name: 'You' }, // Mock
            createdAt: new Date(),
        };
        setOptimisticMessages([...optimisticMessages, tempMsg]);

        await sendMessage(activeThread.id, currentUserId, content);
        router.refresh();
    };

    if (!activeThread && threads.length === 0) {
        return <div className="p-10 text-white">No active chats.</div>;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            {/* Top Header */}
            <header className="bg-gray-900 border-b border-gray-800 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/brand/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">Trio-Chat CRM</span>
                        </Link>
                        <div className="flex items-center gap-4 text-sm">
                            <Link href="/brand/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
                            <Link href="/brand/campaigns" className="text-teal-400 font-semibold">Negotiations</Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Contacts Sidebar */}
                <aside className="w-80 bg-gray-950 border-r border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-800">
                        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            Inbox <span className="ml-auto w-6 h-6 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">{threads.length}</span>
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" placeholder="Filter messages..." className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => router.push(`?threadId=${thread.id}`)}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-900 transition border-l-2 ${activeThread?.id === thread.id ? 'bg-gray-900 border-teal-500' : 'border-transparent'}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                                        {thread.influencer.user.name?.[0]}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-white text-sm">{thread.influencer.user.name}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-xs truncate mb-1">
                                        {thread.id === activeThread?.id && optimisticMessages.length > 0 ? optimisticMessages[optimisticMessages.length - 1].content : 'Click to view'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Chat Area */}
                {activeThread ? (
                    <main className="flex-1 flex flex-col bg-gray-900">
                        <div className="bg-gray-950 border-b border-gray-800 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold">
                                        {activeThread.influencer.user.name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{activeThread.influencer.user.name}</h3>
                                        <p className="text-gray-500 text-xs">{activeThread.influencer.instagramHandle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowNegotiation(!showNegotiation)}
                                        className={`p-2 rounded-lg transition ${showNegotiation ? 'bg-teal-500/10 text-teal-500' : 'text-gray-400 hover:bg-gray-800'}`}
                                    >
                                        <DollarSign className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            <div className="flex-1 flex flex-col min-w-0">
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {optimisticMessages.map((message) => {
                                        const isMe = message.senderId === currentUserId;
                                        return (
                                            <div key={message.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 ${isMe ? 'bg-blue-600' : 'bg-pink-600'} flex items-center justify-center text-white text-xs`}>
                                                    {isMe ? 'Me' : message.sender?.name?.[0] || activeThread.influencer.user.name?.[0]}
                                                </div>
                                                <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        <span className={`text-xs font-semibold ${isMe ? 'text-blue-300' : 'text-gray-400'}`}>{isMe ? 'You' : message.sender?.name || activeThread.influencer.user.name}</span>
                                                        <span className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-800 text-gray-100 rounded-tl-sm shadow-lg shadow-black/20'}`}>
                                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="bg-gray-950 border-t border-gray-800 p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Type your message..."
                                                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
                                            />
                                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                                                <Paperclip className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button onClick={handleSendMessage} className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all font-semibold flex items-center gap-2 shrink-0">
                                            Send <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Negotiation Sidebar */}
                            {showNegotiation && (
                                <aside className="w-80 bg-gray-950 border-l border-gray-800 overflow-y-auto hidden lg:flex flex-col animate-in slide-in-from-right duration-300">
                                    <div className="p-6 border-b border-gray-800">
                                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-teal-500" /> Negotiation Status
                                        </h4>
                                        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</span>
                                                <span className="px-2 py-0.5 bg-teal-500/10 text-teal-500 rounded text-[10px] font-bold uppercase tracking-tight">
                                                    {candidate?.status || 'Active'}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Offer</p>
                                                        <p className="text-sm text-white font-bold">${currentOffer?.amount || '0.00'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Timeline</p>
                                                        <p className="text-sm text-white font-bold">14 Days</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h5 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Campaign Info</h5>
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <FileText className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-white font-medium line-clamp-1">{candidate?.campaign?.title || 'Direct Collaboration'}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">Goal: Brand awareness and engagement through lifestyle reels.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-800">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-xs text-gray-500 uppercase font-bold tracking-widest">Offers</h5>
                                                <button className="text-[10px] text-teal-500 font-bold hover:underline">HISTORY</button>
                                            </div>

                                            {!currentOffer ? (
                                                <div className="text-center py-8 px-4 bg-gray-900 rounded-xl border border-dashed border-gray-800">
                                                    <AlertCircle className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                                                    <p className="text-xs text-gray-500 mb-4">No active offer yet. Start the negotiation now.</p>
                                                    <button className="w-full py-2.5 bg-teal-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all">
                                                        Create New Offer
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <button className="w-full py-2.5 bg-gray-800 text-white text-xs font-bold rounded-lg border border-gray-700 hover:bg-gray-700 transition">
                                                        Counter Offer
                                                    </button>
                                                    <button className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all">
                                                        Approve &amp; Contract
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-gray-800">
                                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                                                <div className="flex gap-2 mb-2">
                                                    <Shield className="w-4 h-4 text-yellow-500 shrink-0" />
                                                    <span className="text-[10px] font-bold text-yellow-500 uppercase">Bookmyinfluencer Escrow</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 leading-relaxed">
                                                    Payments are held secure in escrow once contract is signed. Funds released only after work is approved.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            )}
                        </div>
                    </main>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">Select a thread</div>
                )}
            </div>
        </div>
    );
}
