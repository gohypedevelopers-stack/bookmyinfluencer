import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { ProfileEditor } from "./ProfileEditor"

export default async function CreatorProfilePage() {
    const userId = await getAuthenticatedCreatorId()
    if (!userId) redirect("/verify")

    const creator = await db.creator.findUnique({
        where: { userId },
        include: {
            socialAccounts: true,
            user: true,
            metrics: true,
            selfReportedMetrics: true
        }
    })

    if (!creator) redirect("/creator/onboarding")

    // Fetch background_image_url manually via raw query to bypass potentially stale Prisma types
    const rawCreator = await db.$queryRawUnsafe<any[]>(
        `SELECT background_image_url FROM creators WHERE user_id = $1`,
        userId
    )

    // Merge the raw field if found
    const enhancedCreator = {
        ...creator,
        backgroundImageUrl: rawCreator[0]?.background_image_url || (creator as any).backgroundImageUrl
    }

    return <ProfileEditor creator={enhancedCreator} />
}
