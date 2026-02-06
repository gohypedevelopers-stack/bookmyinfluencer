"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
    LayoutDashboard,
    Megaphone,
    ShoppingBag,
    BarChart3,
    Search,
    Settings,
    MessageSquare,
    LogOut,
    User,
    ChevronDown
} from "lucide-react"
import { NotificationPopover } from "./NotificationPopover"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { signOut } from "next-auth/react"

export function BrandTopNav() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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
                            B
                        </div>
                        <span className="text-lg font-bold text-gray-900">BrandCRM</span>
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

                    {mounted && (
                        <>
                            <NotificationPopover />

                            <Link href="/brand/settings" className="w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                                <Settings className="w-5 h-5" />
                            </Link>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="flex items-center gap-2 outline-none group">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md transition-transform group-hover:scale-105">
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
                                        </div>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2" align="end">
                                    <div className="px-2 py-1.5 mb-1 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{session?.user?.name || "Brand User"}</p>
                                        <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <Link href="/brand/settings" className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                                            <User className="w-4 h-4 text-gray-500" />
                                            Account Settings
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
