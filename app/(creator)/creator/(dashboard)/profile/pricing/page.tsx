export const dynamic = "force-dynamic"
import { Card } from "@/components/ui/card"
import {
    IndianRupee,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { redirect } from "next/navigation"
import PaymentHistory from "./PaymentHistory"

export default async function PricingPayoutsPage() {
    const userId = await getAuthenticatedCreatorId()
    if (!userId) redirect("/login")

    const creator = await db.creator.findUnique({
        where: { userId },
        select: { pricing: true, payoutMethods: true, paymentHistory: true }
    })

    if (!creator) redirect("/creator/onboarding")

    let initialPaymentHistory = []

    try {
        const parsed = creator.paymentHistory ? JSON.parse(creator.paymentHistory) : []
        if (Array.isArray(parsed)) initialPaymentHistory = parsed
    } catch (e) {
        console.error("Error parsing paymentHistory JSON:", e)
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/creator/profile">
                        <button className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Payouts</h1>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
                <Card className="rounded-3xl border-gray-100 shadow-sm p-8 bg-white">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Internal Pricing Model</h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Creator pricing is managed internally by the platform. You no longer need to set per-post rates.
                                Campaign payout details are shared with you after invitation acceptance.
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <PaymentHistory initialHistory={initialPaymentHistory} />
                </div>
            </div>
        </div>
    )
}

