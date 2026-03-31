"use client"

import { usePathname } from "next/navigation"
import { CreatorNotificationPopover } from "./CreatorNotificationPopover"
import { CreatorMobileSidebar } from "./creator-mobile-sidebar"

export function CreatorTopNav() {
    const pathname = usePathname()

    // Simple breadcrumbs or title based on path
    const getPageTitle = () => {
        if (pathname?.includes("/dashboard")) return "Dashboard"
        if (pathname?.includes("/campaigns")) return "Campaigns"

        if (pathname?.includes("/analytics")) return "Analytics"
        if (pathname?.includes("/earnings")) return "Earnings"
        if (pathname?.includes("/profile")) return "Profile"
        return "Dashboard"
    }

    return (
        <header className="sticky top-0 z-50 shrink-0 border-b border-white/70 bg-white/80 px-6 backdrop-blur-xl shadow-[0_10px_40px_-30px_rgba(15,23,42,0.45)] md:px-8">
            <div className="flex items-center justify-between py-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Creator Workspace</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{getPageTitle()}</h1>
                </div>

                <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 md:block">
                    Manager-led campaign workflow
                </div>

                <div className="flex items-center gap-4">
                    <CreatorMobileSidebar />
                    <CreatorNotificationPopover />
                </div>
            </div>
        </header>
    )
}
