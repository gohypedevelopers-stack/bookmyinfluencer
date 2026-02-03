import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CampaignKanbanClient from "./CampaignKanbanClient";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== 'BRAND' && session.user.role !== 'ADMIN')) {
        redirect('/login');
    }

    const candidates = await db.campaignCandidate.findMany({
        where: {
            campaign: {
                brand: {
                    userId: session.user.id
                }
            }
        },
        include: {
            campaign: true, // Useful to show which campaign they are part of
            influencer: {
                include: { user: true }
            },
            offer: true,
            contract: true
        }
    });

    // Cast to expected type if necessary or update client props to accept campaign details
    return <CampaignKanbanClient candidates={candidates as any} />;
}
