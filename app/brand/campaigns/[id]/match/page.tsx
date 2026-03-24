import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MatchClient from "./MatchClient";
import { db } from "@/lib/db";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') {
        redirect('/login');
    }

    const campaign = await db.campaign.findUnique({
        where: { id: resolvedParams.id, brand: { userId: session.user.id } }
    });

    if (!campaign) {
        redirect('/brand/campaigns');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">Campaign Matches</h1>
                        <p className="text-sm text-gray-500">Auto-matched within your ₹{campaign.budget} budget.</p>
                    </div>
                </div>
            </header>
            
            <MatchClient campaignId={resolvedParams.id} budget={campaign.budget || 0} />
        </div>
    );
}
