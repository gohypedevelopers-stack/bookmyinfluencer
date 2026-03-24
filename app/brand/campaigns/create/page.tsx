import { redirect } from "next/navigation";

export default function LegacyCreateCampaignPage() {
    redirect("/brand/campaigns/new");
}

