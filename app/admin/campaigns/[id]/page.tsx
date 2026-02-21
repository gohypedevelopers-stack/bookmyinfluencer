
import { notFound } from "next/navigation";
import { getAdminCampaignDetails, getManagerUsers } from "../../actions";
import AdminCampaignDetailsClient from "./AdminCampaignDetailsClient";

export default async function AdminCampaignDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const campaignResult = await getAdminCampaignDetails(id);
    const managersResult = await getManagerUsers();

    if (!campaignResult.success || !campaignResult.data) {
        if (campaignResult.error === "Campaign not found") {
            notFound();
        }
        return <div className="p-10 text-center text-red-600">
            Error loading campaign: {campaignResult.error}
        </div>;
    }

    return (
        <AdminCampaignDetailsClient
            data={campaignResult.data}
            managers={managersResult.data || []}
        />
    );
}
