"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Instagram, Youtube, Music, Check, Wallet, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { completeOnboarding } from "../actions"

const NICHES = [
    "Tech & Gadgets",
    "Fitness",
    "Lifestyle",
    "Beauty",
    "Gaming",
    "Travel",
    "Fashion",
    "Food"
]

const PLATFORMS = [
    { id: "instagram", name: "Instagram", icon: Instagram, label: "Reels & Stories", color: "text-pink-600", bg: "bg-pink-50" },
    { id: "youtube", name: "YouTube", icon: Youtube, label: "Long-form", color: "text-red-600", bg: "bg-red-50" },
]


interface FinalizeProfileClientProps {
    initialData: any // Using any for simplicity, ideally simpler Creator type
}

export function FinalizeProfileClient({ initialData }: FinalizeProfileClientProps) {
    const router = useRouter()

    // Determine initial niche
    const [selectedNiche, setSelectedNiche] = useState(initialData?.niche || "")

    // Determine initial platforms based on connected accounts
    const initialPlatforms = []
    if (initialData?.socialAccounts) {
        if (initialData.socialAccounts.some((a: any) => a.provider === 'instagram')) initialPlatforms.push('instagram')
        if (initialData.socialAccounts.some((a: any) => a.provider === 'youtube')) initialPlatforms.push('youtube')
    }
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialPlatforms.length > 0 ? initialPlatforms : ["instagram"])

    const [pricing, setPricing] = useState({
        instagramReel: "850",
        youtubeIntegration: "",
        storyShoutout: "350"
    })
    const [loading, setLoading] = useState(false)

    // Extract Stats for Preview
    const igMetric = initialData?.metrics?.find((m: any) => m.provider === 'instagram')
    const ytMetric = initialData?.metrics?.find((m: any) => m.provider === 'youtube')

    const previewName = initialData?.autoDisplayName || initialData?.fullName || "Your Name"
    const previewHandle = initialData?.instagramUrl ? "@" + initialData.instagramUrl.split('/').pop() : (initialData?.youtubeUrl ? "@" + initialData.youtubeUrl.split('/').pop() : "@username")
    const previewImage = initialData?.autoProfileImageUrl || ""

    const followersDisplay = igMetric ? igMetric.followersCount.toLocaleString() : (ytMetric ? ytMetric.followersCount.toLocaleString() : "0")
    // Calc engagement: for IG use engagementRate, for YT maybe similar
    const engagementDisplay = igMetric ? `${igMetric.engagementRate.toFixed(1)}%` : (ytMetric ? `${ytMetric.engagementRate.toFixed(1)}%` : "0%")

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        )
    }

    const handleComplete = async () => {
        setLoading(true)
        try {
            // Prepare data payload
            const payload = {
                niche: selectedNiche,
                platforms: selectedPlatforms,
                pricing
            }

            // Call server action
            await completeOnboarding(payload)
            // Redirect handled in server action or here
            // router.push('/creator/dashboard') 
        } catch (error) {
            console.error("Failed to complete onboarding", error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 text-[#2dd4bf] flex items-center justify-center">
                        {/* Logo Placeholder */}
                        <div className="w-6 h-6 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#2dd4bf]" />
                        </div>
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Influencer Market</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                        <span>Explore</span>
                        <span>Community</span>
                        <span>Resources</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 gap-1.5 px-3 py-1.5 rounded-full font-normal">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Setup in progress
                        </Badge>
                        <button className="text-sm font-medium text-gray-500 hover:text-gray-900">Log Out</button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex gap-12">
                {/* Left Column - Form */}
                <div className="flex-1 max-w-2xl">
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-semibold text-gray-500">Step 3 of 3</span>
                            <span className="text-sm font-semibold text-gray-400">Registration Progress</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-[#2dd4bf] rounded-full" />
                        </div>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Finalize Your Profile</h1>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            Help brands find you by categorizing your content niche and setting clear pricing expectations.
                        </p>
                    </div>

                    {/* Primary Niche */}
                    <section className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Primary Niche</h3>
                            <span className="text-xs font-medium text-[#2dd4bf] bg-[#2dd4bf]/10 px-2.5 py-1 rounded-md">Select one</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {NICHES.map(niche => (
                                <button
                                    key={niche}
                                    onClick={() => setSelectedNiche(niche)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedNiche === niche
                                        ? "bg-[#2dd4bf] text-white shadow-lg shadow-teal-500/20"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {selectedNiche === niche && <Check className="w-3.5 h-3.5" />}
                                        {niche}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Platform Focus */}
                    <section className="mb-10">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Focus</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {PLATFORMS.map(platform => {
                                const isSelected = selectedPlatforms.includes(platform.id)
                                const Icon = platform.icon
                                return (
                                    <div
                                        key={platform.id}
                                        onClick={() => togglePlatform(platform.id)}
                                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                                            ? "border-[#2dd4bf] bg-teal-50/20"
                                            : "border-gray-100 bg-white hover:border-gray-200"
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-5 h-5 bg-[#2dd4bf] rounded-full flex items-center justify-center text-white">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                        {!isSelected && (
                                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-gray-200" />
                                        )}

                                        <div className={`w-10 h-10 ${platform.bg} rounded-xl flex items-center justify-center mb-3 ${platform.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="font-bold text-gray-900 text-sm mb-0.5">{platform.name}</div>
                                        <div className="text-xs text-gray-500">{platform.label}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Service Pricing */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Service Pricing</h3>
                            <span className="text-xs text-gray-500">Set your base rates (INR)</span>
                        </div>

                        <div className="space-y-4">
                            {/* Instagram Reel */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                                <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center text-pink-600 shrink-0">
                                    <Instagram className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-gray-900">Instagram Reel</div>
                                    <div className="text-xs text-gray-500">60s vertical video + caption</div>
                                </div>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <Input
                                        value={pricing.instagramReel}
                                        onChange={(e) => setPricing(p => ({ ...p, instagramReel: e.target.value }))}
                                        className="pl-7 pr-12 text-right font-medium border-gray-200 focus:border-[#2dd4bf] focus:ring-[#2dd4bf]"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">INR</span>
                                </div>
                            </div>

                            {/* YouTube Integration */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm opacity-60">
                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 shrink-0">
                                    <Youtube className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-gray-900">YouTube Integration</div>
                                    <div className="text-xs text-gray-500">30-60s mid-roll placement</div>
                                </div>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <Input
                                        placeholder="Not selected"
                                        disabled
                                        className="pl-7 pr-4 text-right font-medium border-gray-200 bg-gray-50"
                                    />
                                </div>
                            </div>

                            {/* Story Shoutout */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                                    <div className="w-5 h-5 border-2 border-purple-600 rounded-sm" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-gray-900">Story Shoutout</div>
                                    <div className="text-xs text-gray-500">3-frame story sequence with link</div>
                                </div>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <Input
                                        value={pricing.storyShoutout}
                                        onChange={(e) => setPricing(p => ({ ...p, storyShoutout: e.target.value }))}
                                        className="pl-7 pr-12 text-right font-medium border-gray-200 focus:border-[#2dd4bf] focus:ring-[#2dd4bf]"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">INR</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <Button
                        onClick={handleComplete}
                        disabled={loading}
                        className="bg-[#2dd4bf] hover:bg-[#25b0a0] text-white rounded-full px-8 h-14 font-bold text-lg shadow-lg shadow-teal-500/20 flex items-center gap-3 w-auto transition-all hover:translate-y-[-1px]"
                    >
                        {loading ? "Completing..." : "Complete Registration"}
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                    <p className="text-xs text-gray-400 mt-4 ml-1">By clicking Complete, you agree to our creator terms of service.</p>
                </div>

                {/* Right Column - Live Preview */}
                <div className="w-[380px] shrink-0 hidden xl:block">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Preview</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-[#2dd4bf] rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-[#2dd4bf]">Updating</span>
                        </div>
                    </div>

                    <Card className="p-6 rounded-3xl border-none shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] sticky top-32">

                        {/* Profile Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Youtube className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1">{previewName}</h3>
                                <div className="text-sm text-gray-500 mb-1.5">{previewHandle}</div>
                                {selectedNiche && (
                                    <div className="flex gap-1.5">
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium uppercase">{selectedNiche.split(' ')[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <div className="font-bold text-gray-900">{followersDisplay}</div>
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">Followers</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <div className="font-bold text-gray-900">{engagementDisplay}</div>
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">Eng. Rate</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <div className="font-bold text-gray-900">{ytMetric?.mediaCount || igMetric?.mediaCount || 0}</div>
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">Posts</div>
                            </div>
                        </div>

                        {/* Available On */}
                        <div className="mb-8">
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Available On</div>
                            <div className="flex gap-3">
                                {selectedPlatforms.includes('instagram') && (
                                    <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
                                        <Instagram className="w-5 h-5" />
                                    </div>
                                )}
                                {selectedPlatforms.includes('youtube') && (
                                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                                        <Youtube className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Starting From */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <div>
                                <div className="text-xs text-gray-500 mb-0.5">Starting from</div>
                                <div className="text-2xl font-bold text-[#2dd4bf]">₹{pricing.storyShoutout || "350"}</div>
                            </div>
                            <Button className="bg-gray-900 text-white rounded-full px-5 h-10 text-sm font-semibold">View Media Kit</Button>
                        </div>

                        {/* Pro Tip Alert */}
                        <div className="mt-8 bg-cyan-50 rounded-xl p-4 flex gap-3">
                            <div className="text-cyan-500 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="text-xs text-cyan-800 leading-relaxed font-medium">
                                <span className="font-bold">Pro Tip:</span> Profiles {selectedNiche ? `with "${selectedNiche}" niche ` : ''}with Reel rates under ₹80,000 see 25% more inquiries this month.
                            </div>
                        </div>

                    </Card>
                </div>

            </main>
        </div>
    )
}
