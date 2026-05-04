"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react"

interface Influencer {
    id: string
    name: string
    niche: string
    profileImage: string
    stats: {
        followers: string | number
        engagement: string | number
        match: number
    }
}

interface RecommendedInfluencersProps {
    influencers: Influencer[]
}

export function RecommendedInfluencers({ influencers }: RecommendedInfluencersProps) {
    const [startIndex, setStartIndex] = useState(0)
    const itemsPerPage = 3

    const canGoBack = startIndex > 0
    const canGoForward = startIndex + itemsPerPage < influencers.length

    const visibleInfluencers = influencers.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">Micro Influencer Signals</h2>
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">Read-only</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className={`h-8 w-8 rounded-full ${!canGoBack ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => canGoBack && setStartIndex((prev) => Math.max(0, prev - itemsPerPage))} disabled={!canGoBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className={`h-8 w-8 rounded-full ${!canGoForward ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => canGoForward && setStartIndex((prev) => Math.min(influencers.length - itemsPerPage, prev + itemsPerPage))} disabled={!canGoForward}>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleInfluencers.map((influencer) => (
                    <Card key={influencer.id} className="p-5 border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                <Image
                                    src={influencer.profileImage && influencer.profileImage.length > 0 ? influencer.profileImage : "/images/elena.png"}
                                    alt={influencer.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{influencer.name}</h3>
                                <p className="text-xs text-gray-500">{influencer.niche || "General"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-lg p-2">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase">Followers</p>
                                <p className="font-bold text-xs text-gray-900">{typeof influencer.stats.followers === 'number' ? Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(influencer.stats.followers) : influencer.stats.followers}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase">Eng</p>
                                <p className="font-bold text-xs text-green-600">{influencer.stats.engagement}%</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase">Match</p>
                                <p className="font-bold text-xs text-blue-600">{influencer.stats.match}%</p>
                            </div>
                        </div>
                    </Card>
                ))}

                {visibleInfluencers.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-gray-500">
                        No micro creators available right now.
                        <div className="mt-3">
                            <Link href="/brand/campaigns/new">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create Campaign</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

