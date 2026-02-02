import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { FinalizeProfileClient } from "./FinalizeProfileClient"

export default async function FinalizeProfilePage() {
    const userId = await getVerifiedUserIdFromCookies()
    if (!userId) redirect("/verify")

    const creator = await db.creator.findUnique({
        where: { userId },
        include: {
            metrics: {
                orderBy: { date: 'desc' },
                take: 5 // Take a few to match providers
            },
            socialAccounts: true
        }
    })

    return <FinalizeProfileClient initialData={creator} />
}
