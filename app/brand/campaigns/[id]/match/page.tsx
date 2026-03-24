import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MatchClient from "./MatchClient";
import { db } from "@/lib/db";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["BRAND", "ADMIN"].includes(session.user.role as string)) {
        redirect("/login");
    }

    const campaign = await db.campaign.findFirst({
        where: {
            id,
            brand: { userId: session.user.id },
        },
        select: {
            id: true,
            budget: true,
            paymentStatus: true,
        },
    });

    if (!campaign) {
        redirect("/brand/campaigns");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">Campaign Matches</h1>
                    <p className="text-sm text-gray-500">
                        Match, accept, and shuffle micro influencers before confirming upfront payment.
                    </p>
                </div>
            </header>

            <MatchClient
                campaignId={campaign.id}
                budget={campaign.budget || 0}
                paymentStatus={campaign.paymentStatus}
            />
        </div>
    );
}

