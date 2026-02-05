"use client"

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
    MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect, useRef } from "react"
import { getCreatorThreads, getThreadMessages, sendMessage } from "@/app/(creator)/creator/actions"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface Thread {
    id: string
    name: string
    image: string | null
    lastMessage: string
    updatedAt: Date
    unread: boolean
}

interface Message {
    id: string
    content: string
    senderId: string
    senderName: string
    senderImage: string | null
    createdAt: Date
    isMe: boolean
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
    const scrollRef = useRef<HTMLDivElement>(null)

    // Fetch threads on mount
    useEffect(() => {
        fetchThreads()
    }, [])

    async function fetchThreads() {
        try {
            const data = await getCreatorThreads()
            setThreads(data as Thread[])
            if (data.length > 0 && !activeThreadId) {
                setActiveThreadId(data[0].id)
            }
        } catch (error) {
            toast.error("Failed to load chats")
        } finally {
            setIsLoadingThreads(false)
        }
    }

    // Fetch messages when active thread changes
    useEffect(() => {
        if (!activeThreadId) return

        const fetchMessages = async () => {
            setIsLoadingMessages(true)
            const data = await getThreadMessages(activeThreadId)
            setMessages(data as Message[])
            setIsLoadingMessages(false)
            scrollToBottom()
        }

        fetchMessages()

        // Poll for new messages
        const interval = setInterval(async () => {
            const data = await getThreadMessages(activeThreadId)
            setMessages(data as Message[]) // Simple replace for now, could be optimized
        }, 5000)

        return () => clearInterval(interval)
    }, [activeThreadId])

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    const handleSendMessage = async () => {
        if (!activeThreadId || !newMessage.trim()) return

        setIsSending(true)
        // Optimistic update
        const tempMsg: Message = {
            id: 'temp-' + Date.now(),
            content: newMessage,
            senderId: session?.user?.id || 'me',
            senderName: 'Me',
            senderImage: session?.user?.image || null,
            createdAt: new Date(),
            isMe: true
        }
        setMessages(prev => [...prev, tempMsg])
        const messageToSend = newMessage
        setNewMessage("")
        scrollToBottom()

        try {
            const result = await sendMessage(activeThreadId, messageToSend)
            if (result.success) {
                // Refresh messages to get real ID
                const data = await getThreadMessages(activeThreadId)
                setMessages(data as Message[])
            } else {
                toast.error("Failed to send")
                // Remove temp message
                setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
            }
        } catch (error) {
            toast.error("Error sending message")
        } finally {
            setIsSending(false)
        }
    }

    const activeThread = threads.find(t => t.id === activeThreadId)

    return (
        <div className="flex h-[calc(100vh-64px)] font-sans overflow-hidden bg-gray-50">
            {/* Sidebar - Conversation List */}
            <aside className="w-96 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                        <button className="text-gray-400 hover:text-gray-600">
                            <PenSquare className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search brands..."
                            className="pl-9 bg-gray-50 border-gray-100 rounded-xl focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col p-4 gap-2">
                        {isLoadingThreads ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : threads.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No conversations yet.
                            </div>
                        ) : (
                            threads.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setActiveThreadId(conv.id)}
                                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all relative ${activeThreadId === conv.id
                                        ? 'bg-purple-50 border border-purple-100 shadow-sm'
                                        : 'hover:bg-gray-50 border border-transparent'
                                        }`}
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
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide shrink-0">
                                                {new Date(conv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${activeThreadId === conv.id ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                                            {conv.lastMessage}
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
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                        Active Now
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto px-8 pb-4" ref={scrollRef}>
                            {isLoadingMessages && messages.length === 0 ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}>
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
                                                <div className={`text-[10px] text-gray-400 font-medium ${msg.isMe ? 'text-right pr-1' : 'pl-1'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={scrollRef} />
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-6 bg-white border-t border-gray-200 mt-auto shrink-0">
                            <div className="max-w-4xl mx-auto flex items-end gap-3">
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
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        disabled={isSending}
                                    />
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || isSending}
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
        </div>
    )
}
