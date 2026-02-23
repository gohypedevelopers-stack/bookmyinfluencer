"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import {
    Search,
    PenSquare,
    Phone,
    MoreVertical,
    Paperclip,
    Smile,
    Send,
    CheckCircle2,
    Loader2,
    MessageSquare,
    Flag,
    Ban,
    Trash2,
    User,
    CheckCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect, useRef } from "react"
import { getCreatorThreads, getThreadMessages, sendMessage, markMessagesRead, deleteThread, blockBrand, reportBrand, notifyTyping } from "@/app/(creator)/creator/actions"
import { pusherClient } from "@/lib/pusher"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Thread {
    id: string
    name: string
    image: string | null
    lastMessage: string
    updatedAt: Date
    unread: boolean
    brandUserId: string | null
    isLastMessageMe?: boolean
    contractStatus?: string | null
    isCampaign?: boolean
    brandId?: string | null // Added to fix build error
}

interface Message {
    id: string
    content: string
    senderId: string
    senderName: string
    senderImage: string | null
    createdAt: Date
    isMe: boolean
    read?: boolean
}



export default function CreatorMessagesPage() {
    const { data: session } = useSession()
    const [threads, setThreads] = useState<Thread[]>([])
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isLoadingThreads, setIsLoadingThreads] = useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isEditMode, setIsEditMode] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isTyping, setIsTyping] = useState(false)
    const [onlineMembers, setOnlineMembers] = useState<Set<string>>(new Set())
    const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null)

    // Initialize Audio
    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }, [])

    // Report Dialog State
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [reportReason, setReportReason] = useState("")
    const [isReporting, setIsReporting] = useState(false)

    // Fetch threads on mount
    useEffect(() => {
        fetchThreads()
    }, [])

    async function fetchThreads() {
        try {
            const data = await getCreatorThreads()
            setThreads(data as any[])
            if (data.length > 0 && !activeThreadId) {
                setActiveThreadId(data[0].id)
            }
        } catch (error) {
            toast.error("Failed to load chats")
        } finally {
            setIsLoadingThreads(false)
        }
    }


    // Fetch messages when active thread changes & Real-time via Pusher
    useEffect(() => {
        if (!activeThreadId || !session?.user?.id) return

        const fetchMessages = async () => {
            setIsLoadingMessages(true)
            const data = await getThreadMessages(activeThreadId)

            // Find first unread message from active thread that is NOT from me
            const messages = data as Message[]
            const unread = messages.find(m => !m.isMe && !m.read)
            if (unread) setFirstUnreadId(unread.id)
            else setFirstUnreadId(null)

            setMessages(messages)
            setIsLoadingMessages(false)
            setTimeout(scrollToBottom, 500) // Increase timeout slightly for layout shift

            // Mark messages as read
            await markMessagesRead(activeThreadId)

            // Update local state to read
            setMessages(prev => prev.map(m => (!m.isMe && !m.read) ? { ...m, read: true } : m))
        }

        fetchMessages()

        // Pusher Subscription
        pusherClient.subscribe(session.user.id)
        const channel = pusherClient.subscribe(`presence-thread-${activeThreadId}`)

        // Presence handlers
        const handleMemberAdded = (member: any) => {
            setOnlineMembers((prev) => new Set(prev).add(member.id));
        }

        const handleMemberRemoved = (member: any) => {
            setOnlineMembers((prev) => {
                const next = new Set(prev);
                next.delete(member.id);
                return next;
            });
        }

        const handleSubscriptionSucceeded = (members: any) => {
            const membersSet = new Set<string>();
            members.each((member: any) => membersSet.add(member.id));
            setOnlineMembers(membersSet);
        }

        channel.bind("pusher:member_added", handleMemberAdded)
        channel.bind("pusher:member_removed", handleMemberRemoved)
        channel.bind("pusher:subscription_succeeded", handleSubscriptionSucceeded)

        const handleNewMessage = (data: any) => {
            // Avoid duplicating if we just sent it (Pusher echoes to everyone subscribed usually, or we filter by senderId)
            if (data.senderId !== session.user.id) {
                // Play sound
                audioRef.current?.play().catch(e => console.error("Audio play failed", e))

                // Emit read (server action)
                markMessagesRead(activeThreadId)

                setMessages((prev) => {
                    if (prev.some(m => m.id === data.id)) return prev
                    return [...prev, {
                        id: data.id || Math.random().toString(),
                        content: data.content,
                        senderId: data.senderId,
                        senderName: data.sender?.name || "Brand",
                        senderImage: data.sender?.image || null,
                        createdAt: new Date(data.createdAt),
                        isMe: false,
                        read: false
                    }]
                })
                setTimeout(scrollToBottom, 100)
            }
        }

        const handleTyping = (data: { userId: string }) => {
            if (data.userId !== session.user.id) {
                setIsTyping(true)
                setTimeout(scrollToBottom, 100)
            }
        }

        const handleStopTyping = (data: { userId: string }) => {
            if (data.userId !== session.user.id) {
                setIsTyping(false)
            }
        }

        const handleRead = (data: { userId: string }) => {
            if (data.userId !== session.user.id) {
                setMessages(prev => prev.map(m => ({ ...m, read: true })))
            }
        }

        pusherClient.bind('message:new', handleNewMessage)
        channel.bind('typing:start', handleTyping)
        channel.bind('typing:stop', handleStopTyping)
        channel.bind('message:seen', handleRead)

        return () => {
            pusherClient.unsubscribe(session.user.id)
            pusherClient.unsubscribe(`presence-thread-${activeThreadId}`)
            pusherClient.unbind('message:new', handleNewMessage)
            channel.unbind('typing:start', handleTyping)
            channel.unbind('typing:stop', handleStopTyping)
            channel.unbind('message:seen', handleRead)
            channel.unbind('pusher:member_added', handleMemberAdded)
            channel.unbind('pusher:member_removed', handleMemberRemoved)
            channel.unbind('pusher:subscription_succeeded', handleSubscriptionSucceeded)
        }
    }, [activeThreadId, session?.user?.id])

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        } else if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    async function handleSendMessage() {
        if (!newMessage.trim() || !activeThreadId) return

        const tempId = Math.random().toString()
        const messagePayload = {
            id: tempId,
            content: newMessage,
            senderId: session?.user?.id || '',
            senderName: session?.user?.name || 'Me',
            senderImage: session?.user?.image || null,
            createdAt: new Date(),
            isMe: true
        }

        // Optimistic UI
        setMessages((prev) => [...prev, messagePayload])
        setNewMessage("")
        setTimeout(scrollToBottom, 100)

        // Stop typing notification
        notifyTyping(activeThreadId, false)

        // Persist to DB
        try {
            await sendMessage(activeThreadId, newMessage)
        } catch (error) {
            toast.error("Failed to send message")
        }
    }

    // Delete conversation handler
    async function handleDeleteConversation(threadId: string) {
        if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) return;

        try {
            // Optimistically remove from UI
            setThreads(prev => prev.filter(t => t.id !== threadId))

            // If deleted thread was active, clear selection
            if (activeThreadId === threadId) {
                setActiveThreadId(null)
                setMessages([])
            }

            toast.success("Conversation deleted")
            await deleteThread(threadId)
        } catch (error) {
            toast.error("Failed to delete conversation")
            // Revert on error
            fetchThreads()
        }
    }

    // Block Brand handler
    async function handleBlockBrand(brandUserId: string) {
        if (!confirm("Are you sure you want to block this brand? You won't be able to message each other.")) return;

        try {
            const res = await blockBrand(brandUserId);
            if (res.success) {
                toast.success("Brand blocked successfully");
                // Maybe redirect or refresh?
            } else {
                toast.error(res.error || "Failed to block brand");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    }

    // Report Brand handler
    async function handleReportBrand() {
        if (!activeThreadId || !reportReason.trim()) return;
        setIsReporting(true);

        // We need brandUserId. It's not directly in activeThread object unless we parse participants or fetch it.
        // Quick fix: Get it from participants string or passed in thread object if available.
        // In getCreatorThreads, we don't pass participants array cleanly, just string usually.
        // Let's rely on finding the OTHER participant from the thread participant string.

        // Actually, fetching brandUserId is tricky if we don't have it handy.
        // `activeThread` has `id`. We can pass threadId to report, OR we parse participants.
        // Let's Assume the ActiveThread object has the Brand User ID implicitly or we can extract it.
        // getCreatorThreads returns: participants string.

        const thread = threads.find(t => t.id === activeThreadId);
        if (!thread) return;

        const brandUserId = thread.brandUserId || thread.brandId; // Use brandUserId preferably

        if (!brandUserId) {
            toast.error("Could not identify brand to report");
            setIsReporting(false);
            return;
        }

        try {
            const res = await reportBrand(brandUserId, reportReason);
            if (res.success) {
                toast.success("Report submitted. We will review it shortly.");
                setIsReportOpen(false);
                setReportReason("");
            } else {
                toast.error(res.error || "Failed to submit report");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsReporting(false);
        }
    }

    // Filter threads based on search query
    const filteredThreads = threads.filter(thread =>
        thread.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const activeThread = threads.find(t => t.id === activeThreadId)
    const isLocked = activeThread?.isCampaign && !['ACTIVE', 'COMPLETED', 'DISPUTED'].includes(activeThread.contractStatus || '');

    return (
        <div className="flex h-[calc(100vh-64px)] font-sans overflow-hidden bg-gray-50">
            {/* Sidebar - Conversation List */}
            <aside className="w-96 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isEditMode
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {isEditMode ? (
                                <span>Cancel</span>
                            ) : (
                                <PenSquare className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search brands..."
                            className="pl-9 bg-gray-50 border-gray-100 rounded-xl focus:bg-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col p-4 gap-2">
                        {isLoadingThreads ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : filteredThreads.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                {searchQuery ? 'No conversations found.' : 'No conversations yet.'}
                            </div>
                        ) : (
                            filteredThreads.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`flex items-start gap-4 p-4 rounded-xl transition-all relative ${activeThreadId === conv.id
                                        ? 'bg-purple-50 border border-purple-100 shadow-sm'
                                        : 'hover:bg-gray-50 border border-transparent'
                                        } ${isEditMode ? '' : 'cursor-pointer'}`}
                                    onClick={() => !isEditMode && setActiveThreadId(conv.id)}
                                >
                                    {activeThreadId === conv.id && (
                                        <div className="absolute left-0 top-6 bottom-6 w-1 bg-purple-600 rounded-r-lg"></div>
                                    )}

                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden relative bg-gray-200">
                                            {conv.image ? (
                                                <Image src={conv.image} alt={conv.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-200">
                                                    {conv.name[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-gray-900 truncate pr-2">{conv.name}</h3>
                                            {isEditMode ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteConversation(conv.id);
                                                    }}
                                                    className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors shrink-0"
                                                >
                                                    Delete
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide shrink-0">
                                                    {new Date(conv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm truncate ${activeThreadId === conv.id ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                                            {conv.isLastMessageMe ? `You: ${conv.lastMessage}` : conv.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content - Chat Area */}
            <main className="flex-1 flex flex-col bg-slate-50 relative h-full min-w-0">
                {activeThread ? (
                    <>
                        {/* Chat Header */}
                        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 mb-4 shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative z-10 bg-gray-200">
                                        {activeThread.image ? (
                                            <Image src={activeThread.image} alt="Brand" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                {activeThread.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>

                                <div>
                                    <h2 className="font-bold text-gray-900">{activeThread.name}</h2>
                                    <div className="flex items-center text-xs text-gray-500">
                                        {(activeThread.brandUserId && onlineMembers.has(activeThread.brandUserId)) || (onlineMembers.size > 1) ? (
                                            <>
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                                Active Now
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                                                Offline
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => toast.info("Audio calling feature is coming soon!")}
                                    className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                </button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button suppressHydrationWarning className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {(activeThread.brandId || activeThread.brandUserId) ? (
                                            <DropdownMenuItem asChild>
                                                <Link href={`/creator/brands/${activeThread.brandId || activeThread.brandUserId}`} className="cursor-pointer">
                                                    <User className="w-4 h-4 mr-2" />
                                                    View Profile
                                                </Link>
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem disabled className="cursor-not-allowed text-gray-400">
                                                <User className="w-4 h-4 mr-2" />
                                                View Profile
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => handleDeleteConversation(activeThread.id)} className="text-orange-600 cursor-pointer">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Clear Chat
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setIsReportOpen(true)} className="text-amber-600 cursor-pointer">
                                            <Flag className="w-4 h-4 mr-2" />
                                            Report Brand
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (activeThread.brandUserId) handleBlockBrand(activeThread.brandUserId);
                                                else if (activeThread.brandId) handleBlockBrand(activeThread.brandId);
                                            }}
                                            className="text-red-600 cursor-pointer"
                                        >
                                            <Ban className="w-4 h-4 mr-2" />
                                            Block Brand
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </header>

                        {/* Report Dialog */}
                        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Report Brand</DialogTitle>
                                    <DialogDescription>
                                        Please describe why you are reporting this brand. We take all reports seriously.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Reason</Label>
                                        <Textarea
                                            placeholder=" Describe the issue..."
                                            value={reportReason}
                                            onChange={(e) => setReportReason(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsReportOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={handleReportBrand}
                                        disabled={isReporting || !reportReason.trim()}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isReporting ? "Submitting..." : "Submit Report"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto px-8 pb-4" ref={scrollRef}>
                            {isLoadingMessages && messages.length === 0 ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {messages.map((msg) => (
                                        <React.Fragment key={msg.id}>
                                            <div className={`flex gap-4 max-w-3xl ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                                                <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden ring-4 ring-white shadow-sm relative bg-gray-200">
                                                    {msg.senderImage ? (
                                                        <Image
                                                            src={msg.senderImage}
                                                            alt={msg.senderName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">
                                                            {msg.senderName[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className={`flex items-baseline gap-2 ${msg.isMe ? 'justify-end' : ''}`}>
                                                        <span className={`text-sm font-bold ${msg.isMe ? 'text-gray-500' : 'text-gray-900'}`}>{msg.senderName}</span>
                                                    </div>
                                                    <div className={`p-5 rounded-2xl shadow-sm leading-relaxed ${msg.isMe
                                                        ? 'bg-purple-600 text-white rounded-tr-none shadow-md'
                                                        : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <div className={`text-[10px] text-gray-400 font-medium ${msg.isMe ? 'text-right pr-1 justify-end' : 'pl-1 justify-start'} flex items-center gap-1`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {msg.isMe && (
                                                            <span>
                                                                {msg.read ? (
                                                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                                                ) : (
                                                                    <CheckCheck className="w-3 h-3 text-gray-300" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {msg.id === firstUnreadId && (
                                                <div className="flex items-center my-6">
                                                    <div className="flex-1 h-px bg-purple-100"></div>
                                                    <div className="px-4 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full border border-purple-100 uppercase tracking-wider shadow-sm">
                                                        Unread Messages
                                                    </div>
                                                    <div className="flex-1 h-px bg-purple-100"></div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}

                                    {/* Typing Indicator */}
                                    {isTyping && (
                                        <div className="flex gap-4 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden ring-4 ring-white shadow-sm relative bg-gray-200">
                                                {activeThread.image ? (
                                                    <Image src={activeThread.image} alt={activeThread.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">
                                                        {activeThread.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-6 bg-white border-t border-gray-200 mt-auto shrink-0 relative">
                            {isLocked && (
                                <div className="absolute inset-x-0 bottom-full mb-2 mx-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-medium text-center shadow-sm">
                                    Chat will be enabled once the brand activates the campaign.
                                </div>
                            )}
                            <div className={`max-w-4xl mx-auto flex items-end gap-3 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex gap-2 pb-2 text-gray-400">
                                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 focus-within:ring-2 focus-within:ring-purple-100 focus-within:border-purple-300 transition-all">
                                    <Input
                                        className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 text-gray-700 placeholder:text-gray-400 h-6"
                                        placeholder={isLocked ? "Chat is locked..." : "Type your message..."}
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value)
                                            // Notify typing via Pusher
                                            if (activeThreadId && e.target.value.trim()) {
                                                notifyTyping(activeThreadId, true)
                                            } else if (activeThreadId) {
                                                notifyTyping(activeThreadId, false)
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        disabled={isSending || isLocked}
                                    />
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || isSending || isLocked}
                                    className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all text-white disabled:opacity-50"
                                >
                                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Your Messages</h3>
                        <p className="max-w-xs mt-2 text-sm">Select a conversation to start messaging with brands.</p>
                    </div>
                )}
            </main>
        </div >
    )
}
