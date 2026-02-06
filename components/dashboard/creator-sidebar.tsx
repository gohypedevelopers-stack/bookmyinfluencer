"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import {
    BarChart3,
    LayoutDashboard,
    Megaphone,
    Wallet,
    MessageSquare,
    Settings
} from "lucide-react"

export function CreatorSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    // Hide global sidebar on profile page as it has its own settings sidebar
    if (pathname === "/creator/profile" || pathname?.startsWith("/creator/profile/")) {
        return null
    }

    const navItems = [
        {
            name: "Dashboard",
            href: "/creator/dashboard",
            icon: LayoutDashboard,
            activeColor: "bg-purple-50 text-purple-600"
        },
        {
            name: "Campaigns",
            href: "/creator/campaigns",
            icon: Megaphone,
            activeColor: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200"
        },
        {
            name: "Analytics",
            href: "/creator/analytics",
            icon: BarChart3,
            activeColor: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200"
        },
        {
            name: "Earnings",
            href: "/creator/earnings",
            icon: Wallet,
            activeColor: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200"
        },
        {
            name: "Messages",
            href: "/creator/messages",
            icon: MessageSquare,
            activeColor: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200"
        }
    ]

    // Default branding - blue for analytics/campaigns, but let's stick to the Purple Elite Hub for Dashboard/Global
    // The reference images showed slightly different branding colors (Blue vs Purple), 
    // but "Elite Hub" title is consistently there.

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shrink-0">
            <div className="p-6">
                <Link href="/creator/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform">
                        C
                    </div>
                    <span className="font-bold text-xl text-gray-900 tracking-tight">Creator Hub</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link href={item.href} key={item.href}>
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? item.activeColor // Use specific active color based on page type if needed, or unify
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-current" : "text-gray-400"}`} />
                                {item.name}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                    <Link href="/creator/profile" className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-bold shrink-0">
                            {/* Use an image if available, else initial */}
                            {/* Use an image if available, else initial */}
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-xl">{session?.user?.name?.[0] || "U"}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-sm text-gray-900 truncate">
                                {session?.user?.name || "User"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {session?.user?.role || "Creator"}
                            </div>
                        </div>
                    </Link>
                    <Link href="/creator/profile">
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </Link>
                </div>
            </div>
        </aside>
    )
}
