"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import {
    LayoutDashboard,
    Megaphone,
    ShoppingBag,
    BarChart3,
    Search,
    Settings,
    MessageSquare,
} from "lucide-react"
import { NotificationPopover } from "./NotificationPopover"

export function BrandTopNav() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const navItems = [
        { name: "Dashboard", href: "/brand", icon: LayoutDashboard },
        { name: "Campaigns", href: "/brand/campaigns", icon: Megaphone },
        { name: "Messages", href: "/brand/chat", icon: MessageSquare },
        { name: "Marketplace", href: "/brand/discover", icon: ShoppingBag },
        { name: "Analytics", href: "/brand/analytics", icon: BarChart3 },
    ]

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-10">
                    <Link href="/brand" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
                            I
                        </div>
                        <span className="text-lg font-bold text-gray-900">InfluencerCRM</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/brand' && pathname?.startsWith(item.href))
                            return (
                                <Link href={item.href} key={item.href}>
                                    <div
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                        {item.name}
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Right: Search + Actions + Profile */}
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search influencers..."
                            className="pl-10 w-56 h-10 bg-gray-50 border-gray-200 rounded-lg text-sm"
                        />
                    </div>

                    <NotificationPopover />

                    <Link href="/brand/settings" className="w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                        <Settings className="w-5 h-5" />
                    </Link>

                    <Link href="/brand/settings" className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
                        {session?.user?.image ? (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                width={40}
                                height={40}
                                className="object-cover"
                            />
                        ) : (
                            <span>{session?.user?.name?.[0] || "B"}</span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    )
}
