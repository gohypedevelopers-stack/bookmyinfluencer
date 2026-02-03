import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { ProfileEditor } from "./ProfileEditor"

export default async function CreatorProfilePage() {
    const userId = await getVerifiedUserIdFromCookies()
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

    return <ProfileEditor creator={creator} />
}
