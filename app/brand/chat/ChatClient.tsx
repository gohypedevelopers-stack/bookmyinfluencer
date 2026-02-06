'use client';

import { useState, useOptimistic, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Paperclip, MoreVertical, IndianRupee, Calendar, TrendingUp, AlertCircle, Shield, CheckCircle2, Search, FileText } from 'lucide-react';
import { sendMessage, createOffer, finalizeOffer } from '../actions'; // Import Actions
import { toast } from 'sonner';

// UI Imports
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    sender: { name: string; image: string | null };
}

interface Thread {
    id: string;
    candidateId?: string;
    lastMessage: Message | null;
    influencer: {
        id: string;
        userId: string;
        instagramHandle: string | null;
        user: { name: string | null; image: string | null };
    };
    candidate?: {
        id: string;
        status: string;
        campaign: { id: string; title: string; brandId: string };
        offer?: { id: string; amount: number; deliverablesDescription: string; status: string };
    }
}

interface ChatClientProps {
    threads: Thread[];
    selectedThreadId?: string;
    messages: Message[];
    currentUserId: string;
    brandProfileId: string;
}

import { io } from "socket.io-client";

// ... previous imports

export default function ChatClient({
    threads,
    selectedThreadId: initialThreadId,
    messages: initialMessages,
    currentUserId,
    brandProfileId
}: ChatClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeThreadId = initialThreadId || searchParams.get('threadId');

    const activeThread = threads.find(t => t.id === activeThreadId);
    const messages = initialMessages;
    const candidate = activeThread?.candidate;
    const currentOffer = candidate?.offer;

    // Socket Ref
    const socketRef = useRef<any>(null);

    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        messages,
        (state: Message[], newMessage: Message) => [...state, newMessage]
    );

    const [isPending, startTransition] = useTransition();
    const [messageInput, setMessageInput] = useState('');
    const [showNegotiation, setShowNegotiation] = useState(true);

    // Socket Connection Effect
    useEffect(() => {
        // Connect to the custom server (default URL is /)
        socketRef.current = io();

        if (activeThreadId) {
            socketRef.current.emit("join_room", activeThreadId);
        }

        socketRef.current.on("receive_message", (data: any) => {
            // Only add if it's not from us (we add our own optimistically)
            if (data.senderId !== currentUserId) {
                const incomingMessage = {
                    id: data.id || Math.random().toString(),
                    content: data.message, // Map 'message' to 'content'
                    senderId: data.senderId,
                    createdAt: new Date(),
                    sender: { name: "Creator", image: null } // Placeholder, logic can be refined
                };
                startTransition(() => {
                    addOptimisticMessage(incomingMessage);
                });
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [activeThreadId, currentUserId]);



    // Offer State
    const [isOfferOpen, setIsOfferOpen] = useState(false);
    const [offerAmount, setOfferAmount] = useState(currentOffer?.amount?.toString() || '');
    const [offerDeliverables, setOfferDeliverables] = useState(currentOffer?.deliverablesDescription || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form when thread changes
    useEffect(() => {
        if (currentOffer) {
            setOfferAmount(currentOffer.amount.toString());
            setOfferDeliverables(currentOffer.deliverablesDescription);
        } else {
            setOfferAmount('');
            setOfferDeliverables('');
        }
    }, [currentOffer]);

    async function handleSendMessage() {
        if (!messageInput.trim() || !activeThread) return;

        const newMessageStub = {
            id: Math.random().toString(),
            content: messageInput,
            senderId: currentUserId,
            createdAt: new Date(),
            sender: { name: "Me", image: null }
        };

        // 1. Optimistic Update (Immediate Feedback)
        startTransition(() => {
            addOptimisticMessage(newMessageStub);
        });

        // 2. Clear Input
        setMessageInput('');

        // 3. Emit to Socket (Real-time Broadcast)
        if (socketRef.current) {
            socketRef.current.emit("send_message", {
                room: activeThread.id,
                message: newMessageStub.content,
                senderId: currentUserId
            });
        }

        // 4. Persist to DB (Server Action)
        await sendMessage(activeThread.id, currentUserId, newMessageStub.content);
    }

    async function handleCreateOffer() {
        if (!candidate) return;
        if (!offerAmount || !offerDeliverables) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        const result = await createOffer(candidate.id, parseFloat(offerAmount), offerDeliverables);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Offer sent successfully!");
            setIsOfferOpen(false);
        } else {
            toast.error(result.error || "Failed to send offer");
        }
    }

    async function handleFinalizeContract() {
        if (!candidate) return;

        setIsSubmitting(true);
        const result = await finalizeOffer(candidate.id);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Contract generated and offer accepted!");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to finalize");
        }
    }
    if (!activeThread && threads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-gray-50 text-gray-500">
                <Search className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900">No active conversations</p>
                <p className="text-sm">Start a campaign to connect with influencers.</p>
                <Link href="/brand/campaigns" className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                    Go to Campaigns
                </Link>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex bg-gray-50 overflow-hidden">
            {/* Contacts Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                        Inbox <span className="ml-auto w-6 h-6 bg-teal-100 text-teal-700 text-xs rounded-full flex items-center justify-center">{threads.length}</span>
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter messages..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {threads.map((thread) => (
                        <button
                            key={thread.id}
                            onClick={() => router.push(`?threadId=${thread.id}`)}
                            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition border-l-4 ${activeThread?.id === thread.id ? 'bg-teal-50/50 border-teal-500' : 'border-transparent'}`}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {thread.influencer.user.name?.[0]}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-start justify-between mb-1">
                                    <span className="font-semibold text-gray-900 text-sm truncate">{thread.influencer.user.name}</span>
                                    {thread.lastMessage && (
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(thread.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs truncate mb-1 ${activeThread?.id === thread.id ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                    {thread.id === activeThread?.id && optimisticMessages.length > 0 ? optimisticMessages[optimisticMessages.length - 1].content : (thread.lastMessage?.content || 'No messages yet')}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Chat Area */}
            {activeThread ? (
                <main className="flex-1 flex flex-col bg-white">
                    <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                                {activeThread.influencer.user.name?.[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                    {activeThread.influencer.user.name}
                                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                </h3>
                                <p className="text-gray-500 text-xs">{activeThread.influencer.instagramHandle || '@creator'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowNegotiation(!showNegotiation)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showNegotiation ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <IndianRupee className="w-4 h-4" />
                                <span>Offer Details</span>
                            </button>
                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden bg-gray-50/50">
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {optimisticMessages.map((message) => {
                                    const isMe = message.senderId === currentUserId;
                                    return (
                                        <div key={message.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            {!isMe && (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm mb-1">
                                                    {message.sender?.name?.[0] || activeThread.influencer.user.name?.[0]}
                                                </div>
                                            )}

                                            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe
                                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                                    : 'bg-white text-gray-700 rounded-bl-sm border border-gray-200'
                                                    }`}>
                                                    <p>{message.content}</p>
                                                </div>
                                                <span className={`text-[10px] text-gray-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-white border-t border-gray-200 p-4">
                                <div className="max-w-4xl mx-auto flex items-end gap-3">
                                    <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all flex items-center px-4 py-2">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:outline-none text-sm h-10"
                                        />
                                        <button className="text-gray-400 hover:text-gray-600 transition p-2">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className="h-14 w-14 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all flex items-center justify-center disabled:opacity-50 disabled:shadow-none"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Negotiation Sidebar */}
                        {showNegotiation && (
                            <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto hidden lg:flex flex-col animate-in slide-in-from-right duration-300 shadow-xl shadow-gray-200/50 z-20">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2 text-sm">
                                        <TrendingUp className="w-4 h-4 text-teal-600" /> Negotiation Status
                                    </h4>
                                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Current State</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${candidate?.status === 'HIRED' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                {candidate?.status || 'Active'}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                                    <IndianRupee className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Offer Amount</p>
                                                    <p className="text-sm text-gray-900 font-bold">₹{currentOffer?.amount || '0.00'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Timeline</p>
                                                    <p className="text-sm text-gray-900 font-bold">14 Days</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div>
                                        <h5 className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-3">Campaign Context</h5>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-900 font-bold line-clamp-1">{candidate?.campaign?.title || 'Direct Collaboration'}</p>
                                                    <Link href={`/brand/campaigns/${candidate?.campaign?.id}`} className="text-xs text-blue-600 hover:underline mt-1 block">
                                                        View Campaign Brief
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h5 className="text-xs text-gray-400 uppercase font-bold tracking-widest">Actions</h5>
                                        </div>

                                        {!currentOffer ? (
                                            <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-xs text-gray-500 mb-4">No active offer yet.</p>
                                                <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                                                    <DialogTrigger asChild>
                                                        <button className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                                                            Create New Offer
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Make an Offer</DialogTitle>
                                                            <DialogDescription>
                                                                Propose terms for this collaboration. The influencer will be notified.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="amount">Offer Amount (₹)</Label>
                                                                <Input
                                                                    id="amount"
                                                                    type="number"
                                                                    value={offerAmount}
                                                                    onChange={(e) => setOfferAmount(e.target.value)}
                                                                    placeholder="e.g. 5000"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="deliverables">Deliverables</Label>
                                                                <Textarea
                                                                    id="deliverables"
                                                                    value={offerDeliverables}
                                                                    onChange={(e) => setOfferDeliverables(e.target.value)}
                                                                    placeholder="e.g. 1 Reel, 2 Stories, raw usage rights..."
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsOfferOpen(false)}>Cancel</Button>
                                                            <Button onClick={handleCreateOffer} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                                                                {isSubmitting ? 'Sending...' : 'Send Offer'}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                                                    <DialogTrigger asChild>
                                                        <button className="w-full py-2.5 bg-white text-gray-700 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition shadow-sm">
                                                            Update / Counter Offer
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Update Offer</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label>Amount (₹)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={offerAmount}
                                                                    onChange={(e) => setOfferAmount(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Deliverables</Label>
                                                                <Textarea
                                                                    value={offerDeliverables}
                                                                    onChange={(e) => setOfferDeliverables(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsOfferOpen(false)}>Cancel</Button>
                                                            <Button onClick={handleCreateOffer} disabled={isSubmitting}>Update Offer</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>

                                                {candidate?.status !== 'HIRED' && (
                                                    <button
                                                        onClick={handleFinalizeContract}
                                                        disabled={isSubmitting}
                                                        className="w-full py-2.5 bg-teal-600 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-200 hover:bg-teal-700 transition-all disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? 'Processing...' : 'Approve & Generate Contract'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                                            <div className="flex gap-2 mb-2">
                                                <Shield className="w-4 h-4 text-yellow-600 shrink-0" />
                                                <span className="text-[10px] font-bold text-yellow-700 uppercase">Secure Escrow</span>
                                            </div>
                                            <p className="text-[10px] text-gray-600 leading-relaxed">
                                                Funds are held safely in escrow until you approve the work.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                </main>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                        {/* eslint-disable-next-line lucide-react/no-lines-around-comment */}
                        <div className="w-10 h-10 text-gray-300">
                            {/* Use a simple svg or icon if needed, avoiding import conflicts */}
                            <Search className="w-10 h-10" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Select a Conversation</h3>
                    <p className="max-w-xs mt-2 text-sm text-gray-500">Choose a thread from the sidebar to view message history and negotiation details.</p>
                </div>
            )}
        </div>
    );
}
