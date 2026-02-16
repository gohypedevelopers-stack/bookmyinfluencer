"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
    BarChart3,
    LayoutDashboard,
    Megaphone,
    Wallet,
    MessageSquare,
    Settings,
    ShoppingBag,
    LogOut,
    User
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function BrandNavbar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const navItems = [
        {
            name: "Dashboard",
            href: "/brand",
            icon: LayoutDashboard,
        },
        {
            name: "Campaigns",
            href: "/brand/campaigns",
            icon: Megaphone,
        },
        {
            name: "Messages",
            href: "/brand/chat",
            icon: MessageSquare,
        },
        {
            name: "Marketplace",
            href: "/brand/discover",
            icon: ShoppingBag,
        },
        {
            name: "Analytics",
            href: "/brand/analytics",
            icon: BarChart3,
        },
        {
            name: "Wallet",
            href: "/brand/wallet",
            icon: Wallet,
        }
    ]

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/brand" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                        B
                    </div>
                    <span className="font-bold text-lg text-gray-900 tracking-tight hidden md:inline-block">Brand Hub</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1 mx-6">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/brand' && pathname?.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-4">
                    {mounted ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none" asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                                >
                                    <Avatar className="h-8 w-8 border border-gray-100">
                                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs">
                                            {session?.user?.name?.[0] || "B"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-semibold text-gray-900 leading-none">{session?.user?.name || "Brand User"}</p>
                                        <p className="text-xs text-gray-500 mt-1">{session?.user?.role || "Brand"}</p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/brand/settings" className="flex items-center gap-2">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/brand/profile" className="flex items-center gap-2">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                    )}
                </div>
            </div>
        </nav>
    )
}
