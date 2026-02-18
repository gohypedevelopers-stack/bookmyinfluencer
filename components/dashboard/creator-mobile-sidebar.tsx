"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    BarChart3,
    LayoutDashboard,
    Megaphone,
    Wallet,
    MessageSquare,
    Settings,
    LogOut,
    Sparkles,
    Menu,
    X
} from "lucide-react"

export function CreatorMobileSidebar() {
    const [isOpen, setIsOpen] = useState(false)
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
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        />

                        {/* Sidebar */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl overflow-y-auto"
                        >
                            <div className="flex flex-col h-full">
                                <div className="p-6 flex items-center justify-between border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                            C
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-gray-900 leading-none">Creator Hub</span>
                                            <span className="text-[10px] font-medium text-purple-600 uppercase mt-0.5">Elite Portal</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <nav className="flex-1 px-4 py-6 space-y-1">
                                    <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href

                                        return (
                                            <Link
                                                href={item.href}
                                                key={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-colors duration-200 ${isActive
                                                    ? "bg-purple-50 text-purple-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                    }`}
                                            >
                                                <item.icon className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-gray-400"}`} strokeWidth={isActive ? 2.5 : 2} />
                                                <span>{item.name}</span>
                                            </Link>
                                        )
                                    })}
                                </nav>

                                <div className="p-4 border-t border-gray-100">
                                    <Link
                                        href="/creator/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm ring-2 ring-white">
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
                                            <div className="font-bold text-sm text-gray-900 truncate">
                                                {session?.user?.name || "User"}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                View Profile
                                            </div>
                                        </div>
                                        <Settings className="w-4 h-4 text-gray-400" />
                                    </Link>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
