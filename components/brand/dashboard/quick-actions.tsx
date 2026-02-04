import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ShoppingBag, Bookmark, Users, MessageSquare } from "lucide-react"

export function QuickActions() {
    const actions = [
        {
            name: "Browse Marketplace",
            href: "/brand/discover",
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            name: "Saved Collections",
            href: "/brand/collections",
            icon: Bookmark,
            color: "text-blue-600",
            bg: "bg-blue-50" // In design it's blue icon
        },
        {
            name: "Bulk Invite Influencers",
            href: "/brand/campaigns/invite", // Placeholder
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            name: "Unread Messages (3)",
            href: "/brand/chat",
            icon: MessageSquare,
            color: "text-blue-600",
            bg: "bg-blue-50"
        }
    ]

    return (
        <Card className="p-6 rounded-2xl border-gray-100 shadow-sm h-fit">
            <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Quick Actions</h3>
            <div className="space-y-4">
                {actions.map((action, i) => (
                    <Link href={action.href} key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-105 transition-transform`}>
                            <action.icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-gray-900">{action.name}</span>
                    </Link>
                ))}
            </div>
        </Card>
    )
}
