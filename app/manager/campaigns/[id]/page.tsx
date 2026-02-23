import { getManagerCampaignDetails } from "../../actions";
import ManagerCampaignDetailsClient from "./ManagerCampaignDetailsClient";
import { notFound } from "next/navigation";

export default async function ManagerCampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getManagerCampaignDetails(id);

    if (!result.success || !result.data) {
        if (result.error === "Unauthorized") {
            return <div className="p-10 text-center text-red-600">Unauthorized Access</div>;
        }
        return notFound();
    }

    return (
        <ManagerCampaignDetailsClient
            campaign={result.data.campaign}
            auditLogs={result.data.auditLogs}
        />
    );
}
