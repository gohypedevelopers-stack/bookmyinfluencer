import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ChevronRight, MoreHorizontal } from "lucide-react"

export function TopCollections() {
    // Mock data
    const collections = [
        { id: 1, name: "Fall Fashion '24", count: 12, images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'] },
        { id: 2, name: "Fitness Creators", count: 8, images: ['/placeholder.jpg', '/placeholder.jpg'] }
    ]

    return (
        <Card className="p-6 rounded-2xl border-gray-100 shadow-sm h-fit">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider">Top Collections</h3>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>

            <div className="space-y-4 mb-4">
                {collections.map((collection) => (
                    <div key={collection.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden grid grid-cols-2 gap-0.5">
                                {/* Simple collage placeholder */}
                                <div className="bg-gray-300"></div>
                                <div className="bg-gray-400"></div>
                                <div className="bg-gray-500"></div>
                                <div className="bg-gray-600"></div>
                            </div>
                            <div>
                                <div className="font-bold text-sm text-gray-900">{collection.name}</div>
                                <div className="text-xs text-gray-500">{collection.count} Influencers</div>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                    </div>
                ))}
            </div>

            <Link href="/brand/collections" className="block text-center text-sm font-bold text-blue-600 hover:text-blue-700">
                View all collections
            </Link>
        </Card>
    )
}
