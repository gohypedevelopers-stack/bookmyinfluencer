import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { redirect } from "next/navigation"
import MediaKitEditor from "./MediaKitEditor"

export default async function MediaKitPage() {
    const userId = await getAuthenticatedCreatorId()
    if (!userId) redirect("/verify")

    const creator = await db.creator.findUnique({
        where: { userId },
        select: { mediaKit: true, rawSocialData: true }
    })

    if (!creator) redirect("/creator/onboarding")

    let initialMediaKit = []
    let rawSocialData = []

    try {
        initialMediaKit = creator.mediaKit ? JSON.parse(creator.mediaKit) : []
    } catch (e) {
        console.error("Error parsing mediaKit:", e)
    }

    try {
        rawSocialData = creator.rawSocialData ? JSON.parse(creator.rawSocialData) : []
    } catch (e) {
        console.error("Error parsing rawSocialData:", e)
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Media Kit Customization</h1>

            <MediaKitEditor
                initialMediaKit={initialMediaKit}
                rawSocialData={rawSocialData}
            />
        </div>
    )
}
