import { CreatorTopNav } from "@/components/dashboard/creator-top-nav"
import { CreatorSidebar } from "@/components/dashboard/creator-sidebar"

export default function CreatorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
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
