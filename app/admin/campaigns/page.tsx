import AdminCampaignsClient from "./AdminCampaignsClient";
import { getAllCampaignsForAdmin, getManagerUsers } from "../actions";

export default async function AdminCampaignsPage() {
    const campaignsResult = await getAllCampaignsForAdmin();
    const managersResult = await getManagerUsers();

    if (!campaignsResult.success || !managersResult.success) {
        return <div className="p-10 text-center text-red-600">
            Error loading data: {campaignsResult.error || managersResult.error}
        </div>;
    }

    return (
        <AdminCampaignsClient
            campaigns={campaignsResult.data || []}
            managers={managersResult.data || []}
        />
    );
}
