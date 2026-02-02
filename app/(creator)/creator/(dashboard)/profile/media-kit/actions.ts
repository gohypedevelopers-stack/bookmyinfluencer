"use server"

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function updateMediaKit(selectedPosts: any[]) {
    try {
        const userId = await getVerifiedUserIdFromCookies()
        if (!userId) return { error: "Unauthorized" }

        const creator = await db.creator.findUnique({ where: { userId } })
        if (!creator) return { error: "Creator not found" }

        await db.creator.update({
            where: { id: creator.id },
            data: {
                mediaKit: JSON.stringify(selectedPosts)
            }
        })

        revalidatePath("/creator/profile/media-kit")
        return { success: true }
    } catch (error) {
        console.error("Error updating media kit:", error)
        return { error: "Failed to update media kit" }
    }
}
