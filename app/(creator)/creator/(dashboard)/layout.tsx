import { CreatorTopNav } from "@/components/dashboard/creator-top-nav"
import { CreatorSidebar } from "@/components/dashboard/creator-sidebar"

export default function CreatorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f9ff_0%,#f8fafc_38%,#edf4ff_100%)]">
            <CreatorSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CreatorTopNav />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
