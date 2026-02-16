import {
    LayoutDashboard,
    Clock,
    CheckCircle
} from "lucide-react";
import { getManagerStats, getManagerCampaigns } from "./actions";

export default async function ManagerDashboard() {
    const statsResult = await getManagerStats();
    const stats = statsResult.data || { activeCampaigns: 0, pendingApprovals: 0, activeCandidates: 0 };
    const campaignsResult = await getManagerCampaigns();
    const campaigns = campaignsResult.data || [];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Campaigns</p>
                        <h2 className="text-2xl font-bold text-gray-900">{stats.activeCampaigns || 0}</h2>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pending Approvals</p>
                        <h2 className="text-2xl font-bold text-gray-900">{stats.pendingApprovals || 0}</h2>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Completed Campaigns</p>
                        <h2 className="text-2xl font-bold text-gray-900">{stats.completedCampaigns || 0}</h2>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Recent Assignments</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {campaigns.length > 0 ? (
                        campaigns.slice(0, 5).map((campaign: any) => (
                            <div key={campaign.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                        {campaign.brand.companyName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{campaign.title}</h4>
                                        <p className="text-xs text-gray-500">{campaign.brand.companyName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-lg uppercase tracking-wide">
                                        {campaign.status}
                                    </span>
                                    <a href={`/manager/campaigns/${campaign.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                                        Manage
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No campaigns assigned yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
