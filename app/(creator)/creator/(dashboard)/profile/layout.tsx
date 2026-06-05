import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { CreatorProfileSidebar } from "@/components/profile/profile-sidebar"

export default async function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userId = await getAuthenticatedCreatorId()
    if (!userId) redirect("/login")

    const creator = await db.creator.findUnique({
        where: { userId },
        select: {
            fullName: true,
            displayName: true,
            profileImageUrl: true,
            autoProfileImageUrl: true,
        },
    })

    const sidebarName = creator?.displayName || creator?.fullName || "User"
    const sidebarImage = creator?.profileImageUrl || creator?.autoProfileImageUrl || null

    return (
        <div className="flex h-full font-sans overflow-hidden bg-gray-50">
            <CreatorProfileSidebar
                name={sidebarName}
                image={sidebarImage}
                role="INFLUENCER"
            />
            <div className="flex-1 overflow-auto bg-gray-50/50">
                {children}
            </div>
        </div>
    )
}

