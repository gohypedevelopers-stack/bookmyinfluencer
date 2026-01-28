import Link from "next/link"
import { CreatorProfileSidebar } from "@/components/profile/profile-sidebar"

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-full font-sans overflow-hidden bg-gray-50">
            <CreatorProfileSidebar />
            <div className="flex-1 overflow-auto bg-gray-50/50">
                {children}
            </div>
        </div>
    )
}
