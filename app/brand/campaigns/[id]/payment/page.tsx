import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import PaymentClient from "./PaymentClient";

export default async function CampaignPaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BRAND') {
        redirect('/login');
    }

    const campaign = await db.campaign.findUnique({
        where: { id: resolvedParams.id, brand: { userId: session.user.id } },
        include: { brand: true }
    });

    if (!campaign) {
        redirect('/brand/campaigns');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 px-4">
            <PaymentClient campaignId={campaign.id} amount={campaign.budget || 0} />
        </div>
    );
}
