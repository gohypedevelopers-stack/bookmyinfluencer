import { Card } from "@/components/ui/card"
// No icons used in stats headers for now

interface BrandStatsProps {
    stats: {
        totalSpent: number
        activeEscrow: number
        completedCampaigns: number
    }
}

export function BrandStats({ stats }: BrandStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">Total Budget Spent</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                            ₹{stats.totalSpent.toLocaleString()}
                        </h3>
                    </div>
                    <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                        +12.4%
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-600 h-1.5 rounded-full w-3/4"></div>
                </div>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">Active Escrows</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                            ₹{stats.activeEscrow.toLocaleString()}
                        </h3>
                    </div>
                    <div className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">
                        Stable
                    </div>
                </div>
                <div className="flex gap-1 mt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-8 flex-1 rounded-sm ${i > 3 ? 'bg-blue-500' : 'bg-blue-100'}`}></div>
                    ))}
                </div>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">Completed Campaigns</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stats.completedCampaigns}
                        </h3>
                    </div>
                    <div className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md">
                        -2%
                    </div>
                </div>
                <div className="flex gap-1 mt-4 items-end h-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{ height: `${Math.random() * 100}%` }} className="w-full bg-blue-100 rounded-t-sm"></div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
