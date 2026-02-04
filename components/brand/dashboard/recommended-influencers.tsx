
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowLeft } from "lucide-react"

interface Influencer {
    id: string
    name: string
    handle: string
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
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                        Niche Match
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {influencers.slice(0, 3).map((influencer) => (
                    <Card key={influencer.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`h-24 ${influencer.niche.includes('Lifestyle') ? 'bg-blue-50' :
                                influencer.niche.includes('Teach') ? 'bg-green-50' : 'bg-pink-50'
                            }`}></div>
                        <div className="px-6 pb-6 mt-[-30px]">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white mb-3">
                                <Image
                                    src={influencer.profileImage || "/placeholder.jpg"}
                                    alt={influencer.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="font-bold text-gray-900">{influencer.name}</h3>
                            <p className="text-sm text-gray-500 mb-3">{influencer.handle}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {influencer.niche.split(',').slice(0, 2).map((tag, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded uppercase">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>

                            <div className="flex justify-between items-center py-3 border-t border-b border-gray-50 mb-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Followers</p>
                                    <p className="font-bold text-gray-900">{typeof influencer.stats.followers === 'number' ?
                                        Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(influencer.stats.followers) :
                                        influencer.stats.followers}
                                    </p>
                                </div>
                                <div className="text-center border-l border-gray-100 pl-4">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Engage</p>
                                    <p className="font-bold text-green-600">{influencer.stats.engagement}%</p>
                                </div>
                                <div className="text-center border-l border-gray-100 pl-4">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Match</p>
                                    <p className="font-bold text-blue-600">{influencer.stats.match}%</p>
                                </div>
                            </div>

                            <Link href={`/brand/discover?id=${influencer.id}`} className="w-full">
                                <Button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-none">
                                    View Profile
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
