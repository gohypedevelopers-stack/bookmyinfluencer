"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
    BarChart3,
    LayoutDashboard,
    Megaphone,
    Wallet,
    MessageSquare,
    Settings,
    LogOut,
    Sparkles
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
        },
        {
            name: "Campaigns",
            href: "/creator/campaigns",
            icon: Megaphone,
        },
        {
            name: "Analytics",
            href: "/creator/analytics",
            icon: BarChart3,
        },
        {
            name: "Earnings",
            href: "/creator/earnings",
            icon: Wallet,
        },
        {
            name: "Messages",
            href: "/creator/messages",
            icon: MessageSquare,
        }
    ]

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden md:flex w-72 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 shrink-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
        >
            <div className="p-8 pb-4">
                <Link href="/creator/dashboard" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-xl group-hover:scale-105 transition-transform duration-300">
                            C
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl text-gray-900 tracking-tight leading-none">Creator Hub</span>
                        <span className="text-xs font-medium text-purple-600 tracking-wider uppercase mt-1">Elite Portal</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
                <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link href={item.href} key={item.href}>
                            <motion.div
                                className={`relative flex items-center gap-3.5 px-5 py-3.5 rounded-2xl font-medium transition-colors duration-200 group overflow-hidden ${isActive
                                    ? "text-purple-700"
                                    : "text-gray-500 hover:text-gray-900"
                                    }`}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarActiveBg"
                                        className="absolute inset-0 bg-purple-50 rounded-2xl"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <span className="relative z-10 flex items-center justify-center w-6 h-6">
                                    <item.icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-purple-600" : "text-gray-400 group-hover:text-purple-500"}`} strokeWidth={isActive ? 2.5 : 2} />
                                </span>
                                <span className={`relative z-10 text-[15px] ${isActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>

                                {/* Hover Effect for non-active items */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl -z-10" />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Pro Card */}
            <div className="px-6 pb-6">

                <div className="border-t border-gray-100 pt-6">
                    <Link href="/creator/profile" className="flex items-center gap-3 group p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md ring-2 ring-white">
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-lg">{session?.user?.name?.[0] || "U"}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                                {session?.user?.name || "User"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                View Profile
                            </div>
                        </div>
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </Link>
                </div>
            </div>
        </motion.aside>
    )
}
