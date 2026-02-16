import {
    LayoutDashboard,
    Clock,
    CheckCircle,
    User,
    Calendar
} from "lucide-react";
import { getManagerCampaigns, getManagerStats } from "../actions";

export default async function ManagerCampaignsPage() {
    const campaignsResult = await getManagerCampaigns();
    const campaigns = campaignsResult.data || [];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                                {campaign.brand.companyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{campaign.title}</h3>
                                <p className="text-gray-500 text-sm">{campaign.brand.companyName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <User className="w-4 h-4" />
                            {campaign.candidates.length} Candidate(s)
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <Calendar className="w-4 h-4" />
                            {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-lg uppercase tracking-wide">
                                {campaign.status}
                            </span>
                            <a href={`/manager/campaigns/${campaign.id}`} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                                Manage
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {campaigns.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    No campaigns found.
                </div>
            )}
        </div>
    );
}
