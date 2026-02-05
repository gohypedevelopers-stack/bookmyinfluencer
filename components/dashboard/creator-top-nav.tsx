"use client"

import { usePathname } from "next/navigation"
import { CreatorNotificationPopover } from "./CreatorNotificationPopover"

export function CreatorTopNav() {
    const pathname = usePathname()

    // Simple breadcrumbs or title based on path
    const getPageTitle = () => {
        if (pathname?.includes("/dashboard")) return "Dashboard"
        if (pathname?.includes("/campaigns")) return "Campaigns"
        if (pathname?.includes("/messages")) return "Messages"
        if (pathname?.includes("/analytics")) return "Analytics"
        if (pathname?.includes("/earnings")) return "Earnings"
        if (pathname?.includes("/profile")) return "Profile"
        return "Dashboard"
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-8 h-16 flex items-center justify-between shrink-0">
            <div>
                <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-4">
                <CreatorNotificationPopover />
            </div>
        </header>
    )
}
