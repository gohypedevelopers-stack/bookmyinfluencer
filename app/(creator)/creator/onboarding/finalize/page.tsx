
import { FinalizeProfileClient } from "./FinalizeProfileClient"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

export default async function FinalizeOnboardingPage() {
    const userId = await getVerifiedUserIdFromCookies()
    if (!userId) redirect("/verify")

    // Optional: Check if already onboarded to prevent re-onboarding
    const creator = await db.creator.findUnique({
        where: { userId },
        select: { pricing: true }
    })

    // If pricing exists (our proxy for full onboarding), maybe redirect?
    // For now, allowing re-entry to edit/finalize 

    return <FinalizeProfileClient />
}
