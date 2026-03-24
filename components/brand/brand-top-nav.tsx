"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
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
        if (pathname?.includes("/brand/analytics")) return "Analytics"
        if (pathname?.includes("/brand/settings")) return "Settings"
        return "Brand Portal"
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
                <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
                {mounted && <NotificationPopover />}
            </div>
        </header>
    )
}

