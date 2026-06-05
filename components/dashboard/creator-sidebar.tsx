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
    Settings,
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

    ]

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden md:flex h-screen w-72 shrink-0 flex-col border-r border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_52%,#f4f7ff_100%)] sticky top-0 z-40 shadow-[10px_0_40px_-34px_rgba(15,23,42,0.4)]"
        >
            <div className="p-8 pb-5">
                <Link href="/creator/dashboard" className="group flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-purple-600 blur opacity-20 transition-opacity duration-500 group-hover:opacity-40" />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#4f46e5_100%)] text-2xl font-black text-white shadow-[0_20px_35px_-18px_rgba(79,70,229,0.75)] transition-transform duration-300 group-hover:scale-105">
                            C
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="leading-none tracking-tight text-slate-950 text-[1.65rem] font-black">Creator Hub</span>
                        <span className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-violet-600">Elite Portal</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-6">
                <div className="mb-3 px-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Menu</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link href={item.href} key={item.href}>
                            <motion.div
                                className={`group relative flex items-center gap-3.5 overflow-hidden rounded-2xl px-5 py-3.5 transition-colors duration-200 ${isActive
                                    ? "text-violet-700"
                                    : "text-slate-500 hover:text-slate-900"
                                    }`}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarActiveBg"
                                        className="absolute inset-0 rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,rgba(124,58,237,0.10),rgba(79,70,229,0.07))]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <span className="relative z-10 flex h-6 w-6 items-center justify-center">
                                    <item.icon className={`h-5 w-5 transition-colors duration-200 ${isActive ? "text-violet-600" : "text-slate-400 group-hover:text-violet-500"}`} strokeWidth={isActive ? 2.5 : 2} />
                                </span>
                                <span className={`relative z-10 text-[15px] ${isActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>

                                {/* Hover Effect for non-active items */}
                                {!isActive && (
                                    <div className="absolute inset-0 -z-10 rounded-2xl bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            <div className="px-6 pb-6">
                <div className="rounded-[28px] border border-violet-100 bg-[linear-gradient(180deg,rgba(124,58,237,0.08),rgba(79,70,229,0.02))] p-4 shadow-[0_18px_50px_-36px_rgba(79,70,229,0.55)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-500">Creator Profile</p>
                    <Link href="/creator/profile" className="mt-3 flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-white/70">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-white shadow-md ring-2 ring-white">
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-lg">{session?.user?.name?.[0] || "U"}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-violet-700">
                                {session?.user?.name || "User"}
                            </div>
                            <div className="truncate text-xs text-slate-500">
                                Manage public profile
                            </div>
                        </div>
                        <Settings className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600" />
                    </Link>
                </div>
            </div>
        </motion.aside>
    )
}

