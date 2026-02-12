import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Info,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { redirect } from "next/navigation"
import PricingForm from "./PricingForm"
import PaymentHistory from "./PaymentHistory"

export default async function PricingPayoutsPage() {
    const userId = await getAuthenticatedCreatorId()
    if (!userId) redirect("/verify")

    const creator = await db.creator.findUnique({
        where: { userId },
        select: { pricing: true, payoutMethods: true, paymentHistory: true }
    })

    if (!creator) redirect("/creator/onboarding")

    let initialPricing = []
    let initialPayoutMethods = []
    let initialPaymentHistory = []

    try {
        const parsed = creator.pricing ? JSON.parse(creator.pricing) : []
        if (Array.isArray(parsed)) initialPricing = parsed
    } catch (e) {
        console.error("Error parsing pricing JSON:", e)
    }

    try {
        const parsed = creator.payoutMethods ? JSON.parse(creator.payoutMethods) : []
        if (Array.isArray(parsed)) initialPayoutMethods = parsed
    } catch (e) {
        console.error("Error parsing payoutMethods JSON:", e)
    }

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
                    <h1 className="text-xl font-bold text-gray-900">Pricing & Payouts</h1>
                </div>
            </div>

            <div className="flex gap-8 items-start">

                {/* Main Content Column (Form) */}
                <div className="flex-1">
                    <PricingForm initialPricing={initialPricing} initialPayoutMethods={initialPayoutMethods} />
                </div>

                {/* Right Column - History & Tax */}
                <div className="w-80 shrink-0 space-y-6">
                    {/* Payment History Component */}
                    <PaymentHistory initialHistory={initialPaymentHistory} />

                    {/* Tax Information */}
                    <Card className="rounded-[2rem] border-none shadow-lg p-6 bg-gray-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Info className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-purple-300">
                                <Info className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-sm">Tax Information</h3>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6 relative z-10">
                            You have pending tax documentation. Please complete your W-9 form to avoid payout delays.
                        </p>
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none rounded-xl h-10 font-bold text-xs relative z-10">
                            Upload Documents
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
