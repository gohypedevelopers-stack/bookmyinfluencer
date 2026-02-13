"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { NotificationPopover } from "./NotificationPopover"

export function BrandTopNav() {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const getPageTitle = () => {
        if (pathname === "/brand") return "Dashboard"
        if (pathname?.includes("/brand/campaigns")) return "Campaigns"
        if (pathname?.includes("/brand/chat")) return "Messages"
        if (pathname?.includes("/brand/discover")) return "Marketplace"
        if (pathname?.includes("/brand/analytics")) return "Analytics"
        if (pathname?.includes("/brand/wallet")) return "Wallet"
        if (pathname?.includes("/brand/settings")) return "Settings"
        return "Dashboard"
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
                {/* Left: Title */}
                <div className="flex items-center gap-10">
                    <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
                </div>

                {/* Right: Search + Notification */}
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search influencers..."
                            className="pl-10 w-56 h-10 bg-gray-50 border-gray-200 rounded-lg text-sm"
                        />
                    </div>

                    {mounted && (
                        <NotificationPopover />
                    )}
                </div>
            </div>
        </header>
    )
}
