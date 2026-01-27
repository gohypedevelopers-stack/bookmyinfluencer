
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import CampaignKanbanClient from "./CampaignKanbanClient";

export default async function CampaignsPage() {
    const candidates = await db.campaignCandidate.findMany({
        include: {
            influencer: {
                include: { user: true }
            },
            offer: true,
            contract: true
        }
    });

    return <CampaignKanbanClient candidates={candidates} />;
}
