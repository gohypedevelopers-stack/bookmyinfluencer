"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import {
    BarChart3,
    LayoutDashboard,
    Megaphone,
    ShoppingBag,
    MessageSquare,
    Settings,
    Search
} from "lucide-react"

export function BrandSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const navItems = [
        {
            name: "Dashboard",
            href: "/brand",
            icon: LayoutDashboard,
            activeColor: "bg-blue-50 text-blue-600"
        },
        {
            name: "Campaigns",
            href: "/brand/campaigns",
            icon: Megaphone,
            activeColor: "bg-blue-50 text-blue-600"
        },
        {
            name: "Marketplace",
            href: "/brand/discover",
            icon: ShoppingBag,
            activeColor: "bg-blue-50 text-blue-600"
        },
        {
            name: "Analytics",
            href: "/brand/analytics", // Placeholder path
            icon: BarChart3,
            activeColor: "bg-blue-50 text-blue-600"
        },
        {
            name: "Messages",
            href: "/brand/chat",
            icon: MessageSquare,
            activeColor: "bg-blue-50 text-blue-600"
        }
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shrink-0">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        I
                    </div>
                    <span className="text-xl font-bold text-gray-900">InfluencerCRM</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/brand' && pathname?.startsWith(item.href))

                    return (
                        <Link href={item.href} key={item.href}>
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                                {item.name}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                    <Link href="/brand/settings" className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || "Brand"}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-xl">{session?.user?.name?.[0] || "B"}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-sm text-gray-900 truncate">
                                {session?.user?.name || "Brand User"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {session?.user?.role || "Brand"}
                            </div>
                        </div>
                    </Link>
                    <Link href="/brand/settings">
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </Link>
                </div>
            </div>
        </aside>
    )
}
