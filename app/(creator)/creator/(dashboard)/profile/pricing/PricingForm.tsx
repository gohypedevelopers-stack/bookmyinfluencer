"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
// Removed unused Select import
import {
    Tag,
    Wallet,
    Trash2,
    Plus,
    Link as LinkIcon,
    Film,
    Timer,
    Video,
    Landmark,
    QrCode,
    Loader2,
    Image,
    MessageSquare
} from "lucide-react"
import { updatePricing, addPayoutMethod, removePayoutMethod } from "./actions"
import { useRouter } from "next/navigation"

interface PricingFormProps {
    initialPricing: any[]
    initialPayoutMethods: any[]
}

export default function PricingForm({ initialPricing, initialPayoutMethods }: PricingFormProps) {
    const [pricing, setPricing] = useState(Array.isArray(initialPricing) ? initialPricing : [])
    const [loading, setLoading] = useState(false)
    const [royaltyDuration, setRoyaltyDuration] = useState("1m") // 1m, 6m, 1y
    const router = useRouter()

    // Helper to get price for a specific service type
    const getPrice = (type: string) => {
        const item = pricing.find((p: any) => p.type === type)
        return item ? item.price : ""
    }

    // Update local state when input changes
    const handlePriceChange = (type: string, value: string) => {
        const newPricing = [...pricing]
        const existingIndex = newPricing.findIndex((p: any) => p.type === type)

        if (existingIndex >= 0) {
            newPricing[existingIndex] = { ...newPricing[existingIndex], price: value }
        } else {
            newPricing.push({ type, price: value })
        }
        setPricing(newPricing)
    }

    const handleSavePricing = async () => {
        setLoading(true)
        await updatePricing(pricing)
        setLoading(false)
        router.refresh()
    }

    return (
        <div className="flex gap-8 items-start">
            {/* Main Content Column */}
            <div className="flex-1 space-y-8">

                {/* Influencer Service Rates */}
                <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Influencer Service Rates</h3>
                                <p className="text-sm text-gray-500">Set your starting prices for different content formats</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSavePricing}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-lg px-6"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Rates"}
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* INSTAGRAM SECTION */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Instagram</h4>

                            {/* Instagram Story */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-100 transition-all shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                                            <Timer className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Instagram Story</h4>
                                            <p className="text-xs text-gray-500">24h visibility story post</p>
                                        </div>
                                    </div>
                                    <div className="relative w-40">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                        <Input
                                            value={getPrice("instagram_story")}
                                            onChange={(e) => handlePriceChange("instagram_story", e.target.value)}
                                            placeholder="0"
                                            className="h-10 pl-7 text-right bg-gray-50 border-gray-200 font-bold focus-visible:ring-pink-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">INR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Insta Reel */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-100 transition-all shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                                            <Film className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Insta Reel</h4>
                                            <p className="text-xs text-gray-500">60s vertical video</p>
                                        </div>
                                    </div>
                                    <div className="relative w-40">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                        <Input
                                            value={getPrice("instagram_reel")}
                                            onChange={(e) => handlePriceChange("instagram_reel", e.target.value)}
                                            placeholder="0"
                                            className="h-10 pl-7 text-right bg-gray-50 border-gray-200 font-bold focus-visible:ring-pink-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">INR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Insta Post */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-100 transition-all shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                                            <Image className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Insta Post</h4>
                                            <p className="text-xs text-gray-500">Static image or carousel</p>
                                        </div>
                                    </div>
                                    <div className="relative w-40">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                        <Input
                                            value={getPrice("instagram_post")}
                                            onChange={(e) => handlePriceChange("instagram_post", e.target.value)}
                                            placeholder="0"
                                            className="h-10 pl-7 text-right bg-gray-50 border-gray-200 font-bold focus-visible:ring-pink-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">INR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Insta Royalty / Collaboration */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-100 transition-all shadow-sm">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                                <Wallet className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Insta Royalty / Collaboration</h4>
                                                <p className="text-xs text-gray-500">Long-term partnership rights</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pl-14">
                                        <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
                                            {['1m', '6m', '1y'].map((duration) => (
                                                <button
                                                    key={duration}
                                                    onClick={() => setRoyaltyDuration(duration)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${royaltyDuration === duration
                                                        ? 'bg-white text-blue-600 shadow-sm'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                        }`}
                                                >
                                                    {duration === '1m' ? '01 Month' : duration === '6m' ? '6 Month' : '1 Year'}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="relative w-40">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                            <Input
                                                value={getPrice(`instagram_royalty_${royaltyDuration}`)}
                                                onChange={(e) => handlePriceChange(`instagram_royalty_${royaltyDuration}`, e.target.value)}
                                                placeholder="0"
                                                className="h-10 pl-7 text-right bg-gray-50 border-gray-200 font-bold focus-visible:ring-blue-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">INR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* YOUTUBE SECTION */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">YouTube</h4>

                            {/* YouTube Shorts */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-red-100 transition-all shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                                            <Film className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">YouTube Shorts</h4>
                                            <p className="text-xs text-gray-500">60s vertical video</p>
                                        </div>
                                    </div>
                                    <div className="relative w-40">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                        <Input
                                            value={getPrice("youtube_shorts")}
                                            onChange={(e) => handlePriceChange("youtube_shorts", e.target.value)}
                                            placeholder="0"
                                            className="h-10 pl-7 text-right bg-gray-50 border-gray-200 font-bold focus-visible:ring-red-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">INR</span>
                                    </div>
                                </div>
                            </div>

                            {/* YouTube Video */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-red-100 transition-all shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">YouTube Video</h4>
                                            <p className="text-xs text-gray-500">Long-form video placement</p>
                                        </div>
                                    </div>
                                    <div className="relative w-40">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                        <Input
                                            value={getPrice("youtube_video")}
                                            onChange={(e) => handlePriceChange("youtube_video", e.target.value)}
                                            placeholder="0"
                                            className="h-10 pl-7 text-right bg-gray-50 border-gray-200 font-bold focus-visible:ring-red-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">INR</span>
                                    </div>
                                </div>
                            </div>

                            {/* YouTube Community Post */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-red-100 transition-all shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">YouTube Community Post</h4>
                                            <p className="text-xs text-gray-500">Text/Image post on community tab</p>
                                        </div>
                                    </div>
                                    <div className="relative w-40">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                        <Input
                                            value={getPrice("youtube_community")}
                                            onChange={(e) => handlePriceChange("youtube_community", e.target.value)}
                                            placeholder="0"
                                            className="h-10 pl-7 text-right bg-gray-50 border-gray-200 font-bold focus-visible:ring-red-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">INR</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </Card>

                {/* Payout Methods */}
                <PayoutMethodsSection initialMethods={initialPayoutMethods} />

            </div>
        </div>
    )
}

function PayoutMethodsSection({ initialMethods }: { initialMethods: any[] }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRemove = async (id: string) => {
        if (!confirm("Are you sure?")) return
        setLoading(true)
        await removePayoutMethod(id)
        setLoading(false)
        router.refresh()
    }

    return (
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
                {initialMethods.length === 0 && (
                    <div className="text-center py-8 text-gray-500 italic">No payout methods added yet.</div>
                )}
                {initialMethods.map((method: any) => (
                    <div key={method.id} className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                                {method.type === 'BANK' ? <Landmark className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">
                                        {method.type === 'BANK' ? method.bankName : 'UPI ID'}
                                    </span>
                                    <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                        <div className="w-1 h-1 bg-green-500 rounded-full"></div> Verified
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {method.type === 'BANK' ? `Savings Account •••• ${method.accountLast4}` : method.upiId}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemove(method.id)}
                            disabled={loading}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <AddBankDialog />
                <AddUPIDialog />
            </div>
        </Card>
    )
}

function AddBankDialog() {
    const [open, setOpen] = useState(false)
    const [bankName, setBankName] = useState("")
    const [accountLast4, setAccountLast4] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        setLoading(true)
        await addPayoutMethod({ type: 'BANK', bankName, accountLast4: accountLast4 || "0000" }) // Simulating partial data
        setLoading(false)
        setOpen(false)
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center justify-center gap-2 h-14 border border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <Plus className="w-4 h-4" />
                    Add New Bank
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Bank Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} />
                    <Input placeholder="Last 4 Digits" maxLength={4} value={accountLast4} onChange={e => setAccountLast4(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Bank"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AddUPIDialog() {
    const [open, setOpen] = useState(false)
    const [upiId, setUpiId] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        setLoading(true)
        await addPayoutMethod({ type: 'UPI', upiId })
        setLoading(false)
        setOpen(false)
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center justify-center gap-2 h-14 border border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <LinkIcon className="w-4 h-4" />
                    Add UPI / VPA
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add UPI ID</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="username@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add UPI"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
