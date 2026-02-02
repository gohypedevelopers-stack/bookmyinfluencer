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
    Loader2
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
    const [payoutLoading, setPayoutLoading] = useState(false)
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

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Reels / Shorts */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Film className="w-4 h-4 text-purple-500" />
                                <span className="font-bold text-sm text-gray-900">Reels / Shorts</span>
                            </div>
                            <div className="relative mb-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                <Input
                                    value={getPrice("reel")}
                                    onChange={(e) => handlePriceChange("reel", e.target.value)}
                                    placeholder="0"
                                    className="h-14 pl-8 bg-white border-gray-200 text-lg font-bold rounded-xl focus-visible:ring-purple-500"
                                />
                            </div>
                            <p className="text-xs text-gray-400">Average market rate: ₹800 - ₹1,500</p>
                        </div>

                        {/* Stories */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Timer className="w-4 h-4 text-purple-500" />
                                <span className="font-bold text-sm text-gray-900">Stories (Set of 3)</span>
                            </div>
                            <div className="relative mb-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                <Input
                                    value={getPrice("story")}
                                    onChange={(e) => handlePriceChange("story", e.target.value)}
                                    placeholder="0"
                                    className="h-14 pl-8 bg-white border-gray-200 text-lg font-bold rounded-xl focus-visible:ring-purple-500"
                                />
                            </div>
                            <p className="text-xs text-gray-400">Average market rate: ₹300 - ₹600</p>
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
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <Input
                                value={getPrice("video")}
                                onChange={(e) => handlePriceChange("video", e.target.value)}
                                placeholder="0"
                                className="h-14 pl-8 bg-white border-gray-200 text-lg font-bold rounded-xl focus-visible:ring-purple-500"
                            />
                        </div>
                        <p className="text-xs text-gray-400">Average market rate: ₹2,000 - ₹4,500</p>
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
