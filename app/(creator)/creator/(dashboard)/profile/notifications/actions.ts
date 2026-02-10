"use server"

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { revalidatePath } from "next/cache"

export const DEFAULT_NOTIFICATION_SETTINGS = {
    campaigns: {
        opportunities: { push: false, email: true, sms: false },
        approvals: { push: true, email: false, sms: false }
    },
    payments: {
        processed: { push: true, email: true, sms: true },
        taxes: { push: false, email: true, sms: false }
    },
    social: {
        visits: { push: true, email: false, sms: false },
        messages: { push: true, email: true, sms: false }
    }
}

export async function getNotificationSettings() {
    try {
        const userId = await getVerifiedUserIdFromCookies()
        if (!userId) return { error: "Unauthorized" }

        const creator = await db.creator.findUnique({
            where: { userId },
            select: { notificationSettings: true } as any
        }) as any

        if (!creator) return { error: "Creator profile not found" }

        if (creator.notificationSettings) {
            try {
                return { success: true, settings: JSON.parse(creator.notificationSettings) }
            } catch (e) {
                console.error("Failed to parse notification settings:", e)
                return { success: true, settings: DEFAULT_NOTIFICATION_SETTINGS }
            }
        }

        return { success: true, settings: DEFAULT_NOTIFICATION_SETTINGS }
    } catch (error) {
        console.error("Error fetching notification settings:", error)
        return { error: "Failed to fetch notification settings" }
    }
}

export async function saveNotificationSettings(settings: any) {
    try {
        const userId = await getVerifiedUserIdFromCookies()
        if (!userId) return { error: "Unauthorized" }

        const creator = await db.creator.findUnique({
            where: { userId },
            select: { id: true }
        })

        if (!creator) return { error: "Creator profile not found" }

        await (db.creator.update as any)({
            where: { id: creator.id },
            data: {
                notificationSettings: JSON.stringify(settings)
            }
        })

        revalidatePath("/creator/profile/notifications")
        return { success: true }
    } catch (error) {
        console.error("Error saving notification settings:", error)
        return { error: "Failed to save notification settings" }
    }
}

export async function resetNotificationSettings() {
    return await saveNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS)
}
