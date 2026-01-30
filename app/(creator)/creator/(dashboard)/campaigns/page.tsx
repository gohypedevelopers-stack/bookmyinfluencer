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
    Filter,
    Plus,
    FileText,
    Video,
    MessageSquare as ChatIcon,
    MoreHorizontal,
    Compass,
    DollarSign,
    PlaySquare,
    Images as ImagesIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CreatorCampaignsPage() {
    return (
        <div className="h-full overflow-y-auto p-10 bg-gray-50">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Campaigns</h1>
                    <p className="text-gray-500">Manage your active collaborations and discover new opportunities.</p>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 h-11 px-6">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>

                    <Button className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2 h-11 px-6 shadow-lg shadow-indigo-100">
                        <Plus className="w-4 h-4" />
                        New Pitch
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <div className="flex gap-8">
                    <button className="pb-4 border-b-2 border-indigo-600 text-indigo-600 font-semibold text-sm">
                        Ongoing (4)
                    </button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
                        Invitations (2)
                    </button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
                        Completed
                    </button>
                </div>
            </div>

            {/* Ongoing Campaigns */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                {/* Card 1 */}
                <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 bg-white">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-4">
                            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white p-2">
                                {/* Placeholder Logo */}
                                <span className="font-serif text-[10px] transform -rotate-12">BRA AD</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Urban Nomads</h3>
                                <p className="text-gray-500 text-sm">Spring 2024 Travel Collection</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">LIVE</span>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            <span>Campaign Progress</span>
                            <span className="text-gray-900">75%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-orange-50/50 rounded-2xl p-4 flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">NEXT DELIVERABLE</p>
                                <p className="font-bold text-sm text-gray-900">IG Reel & Caption Review</p>
                            </div>
                        </div>
                        <span className="text-orange-500 text-xs font-bold bg-orange-100 px-2 py-1 rounded-md">In 2 days</span>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 border-gray-200 text-gray-900 h-12 font-bold rounded-xl hover:bg-gray-50">
                            <ChatIcon className="w-4 h-4 mr-2" />
                            Open Trio-Chat
                        </Button>
                        <Button variant="outline" className="w-12 border-gray-200 text-gray-500 h-12 rounded-xl hover:bg-gray-50 px-0">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </Card>

                {/* Card 2 */}
                <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 bg-white">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-4">
                            <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-white p-2">
                                {/* Placeholder Logo */}
                                <span className="font-mono text-xs">AT</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Aura Tech</h3>
                                <p className="text-gray-500 text-sm">Wireless Audio Series</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">PRODUCTION</span>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            <span>Campaign Progress</span>
                            <span className="text-gray-900">30%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[30%] rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                <Video className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">NEXT DELIVERABLE</p>
                                <p className="font-bold text-sm text-gray-900">Product Unboxing Video</p>
                            </div>
                        </div>
                        <span className="text-gray-400 text-xs font-medium">Oct 24th</span>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 border-gray-200 text-gray-900 h-12 font-bold rounded-xl hover:bg-gray-50">
                            <ChatIcon className="w-4 h-4 mr-2" />
                            Open Trio-Chat
                        </Button>
                        <Button variant="outline" className="w-12 border-gray-200 text-gray-500 h-12 rounded-xl hover:bg-gray-50 px-0">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Invitations</h2>
                <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">2</span>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Invitation 1 */}
                <Card className="rounded-3xl border-gray-100 shadow-sm p-6 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white text-xs">LS</div>
                        <div>
                            <h3 className="font-bold text-gray-900">Lumina Skincare</h3>
                            <p className="text-xs text-gray-500">Beauty & Wellness</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                                <DollarSign className="w-3 h-3 text-purple-600" />
                            </div>
                            $2,500.00
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                                <PlaySquare className="w-3 h-3 text-purple-600" />
                            </div>
                            3x Reels, 5x Stories
                        </div>
                    </div>

                    <Button variant="outline" className="w-full border-purple-100 text-purple-600 hover:bg-purple-50 hover:text-purple-700 h-10 rounded-xl font-semibold">
                        Review Brief
                    </Button>
                </Card>

                {/* Invitation 2 */}
                <Card className="rounded-3xl border-gray-100 shadow-sm p-6 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-green-800 rounded-xl flex items-center justify-center text-white text-xs">VK</div>
                        <div>
                            <h3 className="font-bold text-gray-900">Velo Kitchen</h3>
                            <p className="text-xs text-gray-500">Home & Lifestyle</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                                <DollarSign className="w-3 h-3 text-purple-600" />
                            </div>
                            $1,800.00
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                                <Video className="w-3 h-3 text-purple-600" />
                            </div>
                            1x YouTube Video
                        </div>
                    </div>

                    <Button variant="outline" className="w-full border-purple-100 text-purple-600 hover:bg-purple-50 hover:text-purple-700 h-10 rounded-xl font-semibold">
                        Review Brief
                    </Button>
                </Card>

                {/* Discover More */}
                <div className="rounded-3xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-gray-300 hover:bg-gray-50/50 transition-all cursor-pointer group h-full">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Compass className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Discover More</h3>
                    <p className="text-xs text-gray-400 leading-relaxed px-4">Browse hundreds of active brand opportunities in the marketplace</p>
                </div>
            </div>
        </div>
    )
}
