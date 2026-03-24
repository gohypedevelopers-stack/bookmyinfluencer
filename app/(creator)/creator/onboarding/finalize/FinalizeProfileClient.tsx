"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Check, Instagram, Youtube } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
    { id: "instagram", name: "Instagram", icon: Instagram },
    { id: "youtube", name: "YouTube", icon: Youtube },
]

interface FinalizeProfileClientProps {
    initialData: any
}

export function FinalizeProfileClient({ initialData }: FinalizeProfileClientProps) {
    const initialPlatforms = []
    if (initialData?.socialAccounts) {
        if (initialData.socialAccounts.some((a: any) => a.provider === "instagram")) initialPlatforms.push("instagram")
        if (initialData.socialAccounts.some((a: any) => a.provider === "youtube")) initialPlatforms.push("youtube")
    }

    const [selectedNiche, setSelectedNiche] = useState(initialData?.niche || "")
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialPlatforms.length > 0 ? initialPlatforms : ["instagram"])
    const [loading, setLoading] = useState(false)

    const previewName = initialData?.autoDisplayName || initialData?.fullName || "Your Name"
    const previewImage = initialData?.autoProfileImageUrl || ""

    const primaryMetric = useMemo(() => {
        const ig = initialData?.metrics?.find((m: any) => m.provider === "instagram")
        const yt = initialData?.metrics?.find((m: any) => m.provider === "youtube")
        return ig || yt || null
    }, [initialData])

    const followersDisplay = (primaryMetric?.followersCount || 0).toLocaleString()
    const engagementDisplay = `${Number(primaryMetric?.engagementRate || 0).toFixed(1)}%`

    const togglePlatform = (id: string) => {
        setSelectedPlatforms((prev) =>
            prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
        )
    }

    const handleComplete = async () => {
        setLoading(true)
        try {
            await completeOnboarding({
                niche: selectedNiche,
                platforms: selectedPlatforms,
            })
        } catch (error) {
            console.error("Failed to complete onboarding", error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-10">
                <div>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalize Your Profile</h1>
                        <p className="text-gray-500">Pricing is managed internally. Confirm your niche and platforms to finish onboarding.</p>
                    </div>

                    <Card className="p-6 rounded-2xl mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Primary Niche</h2>
                        <div className="flex flex-wrap gap-2">
                            {NICHES.map((niche) => (
                                <button
                                    key={niche}
                                    onClick={() => setSelectedNiche(niche)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border ${selectedNiche === niche ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                                >
                                    {niche}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 rounded-2xl mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Focus</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {PLATFORMS.map((platform) => {
                                const Icon = platform.icon
                                const selected = selectedPlatforms.includes(platform.id)
                                return (
                                    <button
                                        key={platform.id}
                                        onClick={() => togglePlatform(platform.id)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border ${selected ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-700"}`}
                                    >
                                        <span className="flex items-center gap-2 font-semibold">
                                            <Icon className="w-4 h-4" />
                                            {platform.name}
                                        </span>
                                        {selected && <Check className="w-4 h-4" />}
                                    </button>
                                )
                            })}
                        </div>
                    </Card>

                    <Card className="p-4 rounded-2xl bg-indigo-50 border-indigo-100 text-indigo-900 text-sm mb-8">
                        Brand pricing inputs are disabled. The platform calculates campaign charge and creator payout internally.
                    </Card>

                    <Button
                        onClick={handleComplete}
                        disabled={loading || !selectedNiche || selectedPlatforms.length === 0}
                        className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                        {loading ? "Completing..." : "Complete Registration"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                <Card className="p-6 rounded-3xl h-fit sticky top-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Live Preview</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {previewImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 font-bold text-xl">{previewName[0] || "C"}</span>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{previewName}</p>
                            <p className="text-xs text-gray-500">Micro Influencer</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-sm font-bold text-gray-900">{followersDisplay}</p>
                            <p className="text-[10px] uppercase text-gray-400">Followers</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-sm font-bold text-gray-900">{engagementDisplay}</p>
                            <p className="text-[10px] uppercase text-gray-400">Engagement</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedPlatforms.map((platform) => (
                            <Badge key={platform} variant="secondary" className="capitalize">{platform}</Badge>
                        ))}
                        {selectedNiche && <Badge variant="secondary">{selectedNiche}</Badge>}
                    </div>
                </Card>
            </div>
        </div>
    )
}

