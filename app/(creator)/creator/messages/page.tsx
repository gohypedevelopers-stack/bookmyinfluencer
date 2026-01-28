"use client"

import Link from "next/link"
import Image from "next/image"
import {
    BarChart3,
    LayoutDashboard,
    Megaphone,
    Wallet,
    MessageSquare,
    Settings,
    Search,
    PenSquare,
    Phone,
    MoreVertical,
    Paperclip,
    Smile,
    Send,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CreatorMessagesPage() {
    const conversations = [
        {
            id: 1,
            name: "TechFlow Global",
            initials: "TG",
            bgColor: "bg-amber-700",
            lastMessage: "Draft looks amazing! Just...",
            time: "2M AGO",
            isTrio: true,
            active: true,
            avatar: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=100&h=100" // Abstract gold/orange
        },
        {
            id: 2,
            name: "Luxe Essence",
            initials: "LE",
            bgColor: "bg-stone-300",
            lastMessage: "The contract is ready for sig...",
            time: "1H AGO",
            isTrio: true,
            active: false,
            avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100&h=100" // Abstract light
        },
        {
            id: 3,
            name: "ActiveWear Co.",
            initials: "AC",
            bgColor: "bg-orange-300",
            lastMessage: "Looking forward to our next...",
            time: "YESTERDAY",
            isTrio: false,
            active: false,
            avatar: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=100&h=100" // Abstract tan
        }
    ]

    return (
        <div className="flex h-full font-sans overflow-hidden bg-gray-50">
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
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all relative ${conv.active
                                        ? 'bg-purple-50 border border-purple-100 shadow-sm'
                                        : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                            >
                                {conv.active && (
                                    <div className="absolute left-0 top-6 bottom-6 w-1 bg-purple-600 rounded-r-lg"></div>
                                )}

                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden relative">
                                        <Image src={conv.avatar} alt={conv.name} fill className="object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center p-0.5">
                                        <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                                            {/* Icon placeholder or status */}
                                            <span className="sr-only">Status</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 truncate pr-2">{conv.name}</h3>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide shrink-0">{conv.time}</span>
                                    </div>
                                    {conv.isTrio && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-600 mb-1 mr-2">TRIO</span>
                                    )}
                                    <p className={`text-sm truncate ${conv.active ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content - Chat Area */}
            <main className="flex-1 flex flex-col bg-slate-50 relative h-full min-w-0">
                {/* Chat Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 mb-4 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {/* Group Avatar Look */}
                            <div className="flex -space-x-4">
                                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative z-10">
                                    <Image src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=100&h=100" alt="Brand" fill className="object-cover" />
                                </div>
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center relative z-0">
                                    <span className="text-xs font-bold text-gray-500">TRIO</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>

                        <div>
                            <h2 className="font-bold text-gray-900">TechFlow Global Collaboration</h2>
                            <div className="flex items-center text-xs text-gray-500">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                Trio Chat Active • 3 Participants
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
                <ScrollArea className="flex-1 px-8">
                    <div className="flex justify-center mb-8">
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">Today</span>
                    </div>

                    <div className="space-y-8 pb-4">
                        {/* Brand Message */}
                        <div className="flex gap-4 max-w-3xl">
                            <div className="w-10 h-10 rounded-full bg-amber-500 shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-4 ring-white">
                                S
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-gray-900">Sarah (Brand Manager)</span>
                                </div>
                                <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm text-gray-700 leading-relaxed border border-gray-100">
                                    Hi Alex! We just reviewed the first draft of the Reel. The lighting in the setup scene is perfect! Could we just emphasize the software interface a bit more in the mid-section?
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium pl-1">10:42 AM</span>
                            </div>
                        </div>

                        {/* System Message */}
                        <div className="flex gap-4 max-w-3xl">
                            <div className="w-10 h-10 rounded-full bg-blue-100 shrink-0 flex items-center justify-center text-blue-600 shadow-sm ring-4 ring-white">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="space-y-1 w-full">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-blue-600">System Concierge</span>
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-xl shadow-sm text-blue-700 text-sm font-medium border border-blue-100 italic">
                                    Milestone 2 (Draft Approval) is currently pending brand confirmation.
                                </div>
                            </div>
                        </div>

                        {/* User Message (Right) */}
                        <div className="flex flex-row-reverse gap-4 max-w-3xl ml-auto">
                            <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden ring-4 ring-white shadow-sm relative">
                                <Image
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100"
                                    alt="Me"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2 justify-end">
                                    <span className="text-sm font-bold text-gray-500">Alex Sterling (You)</span>
                                </div>
                                <div className="bg-purple-600 p-5 rounded-2xl rounded-tr-none shadow-md text-white leading-relaxed">
                                    Absolutely, Sarah! I can re-shoot that 5-second transition to show a clearer close-up of the dashboard. Will have the updated version to you by tomorrow morning!
                                </div>
                                <div className="text-right pr-1">
                                    <span className="text-[10px] text-gray-400 font-medium">11:15 AM</span>
                                </div>
                            </div>
                        </div>

                        {/* Brand Reply */}
                        <div className="flex gap-4 max-w-3xl">
                            <div className="w-10 h-10 rounded-full bg-amber-500 shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-4 ring-white">
                                S
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-gray-900">Sarah (Brand Manager)</span>
                                </div>
                                <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm text-gray-700 leading-relaxed border border-gray-100">
                                    That sounds perfect. Thanks for the quick turnaround! 🚀
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium pl-1">11:18 AM</span>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="p-6 bg-white border-t border-gray-200 mt-auto">
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
                            />
                        </div>

                        <button className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all text-white">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
