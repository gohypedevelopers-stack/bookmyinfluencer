"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Tag,
    Wallet,
    Trash2,
    Plus,
    Link as LinkIcon,
    ArrowLeft,
    Film,
    Timer,
    Video,
    Landmark,
    QrCode,
    Info,
    ArrowUpRight
} from "lucide-react"
import Link from "next/link"

export default function PricingPayoutsPage() {
    return (
        // Max width set to match the previous page for consistency
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/creator/profile">
                        <button className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Pricing & Payouts</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium">
                        Discard Changes
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-lg px-6">
                        Save Settings
                    </Button>
                </div>
            </div>

            <div className="flex gap-8 items-start">
                {/* Main Content Column */}
                <div className="flex-1 space-y-8">

                    {/* Influencer Service Rates */}
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 bg-white">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Influencer Service Rates</h3>
                                <p className="text-sm text-gray-500">Set your starting prices for different content formats</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* Reels / Shorts */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Film className="w-4 h-4 text-purple-500" />
                                    <span className="font-bold text-sm text-gray-900">Reels / Shorts</span>
                                </div>
                                <div className="relative mb-2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <Input
                                        defaultValue="1200"
                                        className="h-14 pl-8 bg-white border-gray-200 text-lg font-bold rounded-xl focus-visible:ring-purple-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Average market rate: $800 - $1,500</p>
                            </div>

                            {/* Stories */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Timer className="w-4 h-4 text-purple-500" />
                                    <span className="font-bold text-sm text-gray-900">Stories (Set of 3)</span>
                                </div>
                                <div className="relative mb-2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <Input
                                        defaultValue="450"
                                        className="h-14 pl-8 bg-white border-gray-200 text-lg font-bold rounded-xl focus-visible:ring-purple-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Average market rate: $300 - $600</p>
                            </div>
                        </div>

                        {/* Long-form Video */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-purple-500" />
                                    <span className="font-bold text-sm text-gray-900">Long-form Video (YT Integrated)</span>
                                </div>
                                <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Popular</span>
                            </div>
                            <div className="relative mb-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <Input
                                    defaultValue="2800"
                                    className="h-14 pl-8 bg-white border-gray-200 text-lg font-bold rounded-xl focus-visible:ring-purple-500"
                                />
                            </div>
                            <p className="text-xs text-gray-400">Average market rate: $2,000 - $4,500</p>
                        </div>
                    </Card>

                    {/* Payout Methods */}
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 bg-white">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Payout Methods</h3>
                                <p className="text-sm text-gray-500">Manage where you receive your earnings</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            {/* Bank Item */}
                            <div className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                                        <Landmark className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">Global Trust Bank</span>
                                            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                                <div className="w-1 h-1 bg-green-500 rounded-full"></div> Verified
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Savings Account •••• 8829</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* UPI Item */}
                            <div className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                                        <QrCode className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">UPI ID</span>
                                            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                                <div className="w-1 h-1 bg-green-500 rounded-full"></div> Verified
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">alexsterling@upi</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <button className="flex items-center justify-center gap-2 h-14 border border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                <Plus className="w-4 h-4" />
                                Add New Bank
                            </button>
                            <button className="flex items-center justify-center gap-2 h-14 border border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                <LinkIcon className="w-4 h-4" />
                                Add UPI / VPA
                            </button>
                        </div>
                    </Card>

                </div>

                {/* Right Column - History & Tax */}
                <div className="w-80 shrink-0 space-y-6">
                    {/* Payment History */}
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 text-sm">Payment History</h3>
                            <button className="text-[10px] font-bold text-blue-600 uppercase hover:underline">View All</button>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: "TechBrand Campaign", date: "Oct 12, 2023", amount: "$2,400", status: "COMPLETED", statusColor: "text-green-600 bg-green-50" },
                                { title: "Lifestyle Reel Sync", date: "Oct 08, 2023", amount: "$850", status: "PROCESSING", statusColor: "text-blue-600 bg-blue-50" },
                                { title: "Story Bonus", date: "Sep 28, 2023", amount: "$120", status: "COMPLETED", statusColor: "text-green-600 bg-green-50" },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-xs text-gray-900 mb-0.5">{item.title}</p>
                                        <p className="text-[10px] text-gray-400">{item.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xs text-gray-900 mb-1">{item.amount}</p>
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${item.statusColor}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 bg-purple-50 rounded-2xl p-6 text-center">
                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide mb-1">TOTAL PAYOUTS (YTD)</p>
                            <p className="text-2xl font-bold text-gray-900">$34,580.00</p>
                        </div>
                    </Card>

                    {/* Tax Information */}
                    <Card className="rounded-[2rem] border-none shadow-lg p-6 bg-gray-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Info className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-purple-300">
                                <Info className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-sm">Tax Information</h3>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6 relative z-10">
                            You have pending tax documentation. Please complete your W-9 form to avoid payout delays.
                        </p>
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none rounded-xl h-10 font-bold text-xs relative z-10">
                            Upload Documents
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
