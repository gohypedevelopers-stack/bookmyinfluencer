"use server"

import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { revalidatePath } from "next/cache"

export async function updatePricing(pricingData: any[]) {
    try {
        const userId = await getAuthenticatedCreatorId()
        if (!userId) return { error: "Unauthorized" }

        const creator = await db.creator.findUnique({ where: { userId } })
        if (!creator) return { error: "Creator not found" }

        await db.creator.update({
            where: { id: creator.id },
            data: {
                pricing: JSON.stringify(pricingData)
            }
        })

        revalidatePath("/creator/profile/pricing")
        return { success: true }
    } catch (error) {
        console.error("Error updating pricing:", error)
        return { error: "Failed to update pricing" }
    }
}

export async function addPayoutMethod(method: any) {
    try {
        const userId = await getAuthenticatedCreatorId()
        if (!userId) return { error: "Unauthorized" }

        const creator = await db.creator.findUnique({ where: { userId } })
        if (!creator) return { error: "Creator not found" }

        const currentMethods = creator.payoutMethods ? JSON.parse(creator.payoutMethods) : []
        const newMethods = [...currentMethods, { ...method, id: crypto.randomUUID() }]

        await db.creator.update({
            where: { id: creator.id },
            data: {
                payoutMethods: JSON.stringify(newMethods)
            }
        })

        revalidatePath("/creator/profile/pricing")
        return { success: true }
    } catch (error) {
        console.error("Error adding payout method:", error)
        return { error: "Failed to add payout method" }
    }
}

export async function addPaymentRecord(payment: any) {
    try {
        const userId = await getAuthenticatedCreatorId()
        if (!userId) return { error: "Unauthorized" }

        const creator = await db.creator.findUnique({ where: { userId } })
        if (!creator) return { error: "Creator not found" }

        const currentHistory = creator.paymentHistory ? JSON.parse(creator.paymentHistory) : []
        const newHistory = [{ ...payment, id: crypto.randomUUID() }, ...currentHistory]

        await db.creator.update({
            where: { id: creator.id },
            data: {
                paymentHistory: JSON.stringify(newHistory)
            }
        })

        revalidatePath("/creator/profile/pricing")
        return { success: true }
    } catch (error) {
        console.error("Error adding payment record:", error)
        return { error: "Failed to add payment record" }
    }
}

export async function removePayoutMethod(methodId: string) {
    try {
        const userId = await getAuthenticatedCreatorId()
        if (!userId) return { error: "Unauthorized" }

        const creator = await db.creator.findUnique({ where: { userId } })
        if (!creator) return { error: "Creator not found" }

        const currentMethods = creator.payoutMethods ? JSON.parse(creator.payoutMethods) : []
        const newMethods = currentMethods.filter((m: any) => m.id !== methodId)

        await db.creator.update({
            where: { id: creator.id },
            data: {
                payoutMethods: JSON.stringify(newMethods)
            }
        })

        revalidatePath("/creator/profile/pricing")
        return { success: true }
    } catch (error) {
        console.error("Error removing payout method:", error)
        return { error: "Failed to remove payout method" }
    }
}
