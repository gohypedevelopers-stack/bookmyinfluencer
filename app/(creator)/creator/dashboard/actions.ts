'use server'

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function updateCreatorPricing(pricing: string) {
    const userId = await getVerifiedUserIdFromCookies()
    if (!userId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await db.creator.update({
            where: { userId },
            data: { pricing }
        })

        revalidatePath("/creator/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error updating pricing:", error)
        return { success: false, error: "Failed to update pricing" }
    }
}

export async function updateCreatorMediaKit(mediaKit: string) {
    const userId = await getVerifiedUserIdFromCookies()
    if (!userId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await db.creator.update({
            where: { userId },
            data: { mediaKit }
        })

        revalidatePath("/creator/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error updating media kit:", error)
        return { success: false, error: "Failed to update media kit" }
    }
}
