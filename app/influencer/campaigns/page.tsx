import { getInfluencerCampaigns } from "../actions";
import CampaignsClient from "./CampaignsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InfluencerCampaignsPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INFLUENCER') {
        redirect('/login');
    }

    const res = await getInfluencerCampaigns();
    const campaigns = res.success ? res.campaigns : [];

    return <CampaignsClient campaigns={campaigns as any} />;
}
