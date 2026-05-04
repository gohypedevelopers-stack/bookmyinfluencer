"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
    BarChart3,
    LayoutDashboard,
    Megaphone,
    Settings,
    LogOut,
    User,
    Menu,
    X,
    Search
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
            name: "Marketplace",
            href: "/brand/discover",
            icon: Search,
        },
        {
            name: "Campaigns",
            href: "/brand/campaigns",
            icon: Megaphone,
        },
        {
            name: "Analytics",
            href: "/brand/analytics",
            icon: BarChart3,
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

                {/* User Menu & Mobile Toggle */}
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
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

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white py-4 px-6 space-y-2 animate-in slide-in-from-top duration-200">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/brand' && pathname?.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                    <div className="pt-4 border-t border-gray-100">
                        <Link
                            href="/brand/settings"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            <Settings className="w-5 h-5 text-gray-400" />
                            Settings
                        </Link>
                        <Link
                            href="/brand/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            <User className="w-5 h-5 text-gray-400" />
                            Profile
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}

