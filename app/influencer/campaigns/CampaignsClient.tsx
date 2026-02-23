"use client";

import { useState } from "react";
import { updateCampaignInvitation } from "../actions";
import { CampaignCandidate, Campaign, BrandProfile } from "@prisma/client";
import { CandidateStatus } from "@/lib/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, MessageSquare, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

type CampaignWithDetails = CampaignCandidate & {
    campaign: Campaign & {
        brand: BrandProfile
    }
};

interface Props {
    campaigns: CampaignWithDetails[];
}

export default function CampaignsClient({ campaigns }: Props) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<'REQUESTS' | 'ACTIVE' | 'ALL'>('REQUESTS');
    const [processing, setProcessing] = useState<string | null>(null);

    const filtered = campaigns.filter(c => {
        if (statusFilter === 'REQUESTS') return c.status === CandidateStatus.CONTACTED;
        if (statusFilter === 'ACTIVE') return ['IN_NEGOTIATION', 'HIRED', 'CONTENT_REVIEW'].includes(c.status);
        return true;
    });

    const handleAction = async (id: string, action: 'ACCEPT' | 'REJECT') => {
        setProcessing(id);
        const res = await updateCampaignInvitation(id, action);
        if (res.success) {
            router.refresh();
        } else {
            alert('Action failed');
        }
        setProcessing(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
                <p className="text-gray-500">Manage your invitations and active collaborations.</p>
            </div>

            <div className="flex gap-2 mb-8 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setStatusFilter('REQUESTS')}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2 ${statusFilter === 'REQUESTS' ? 'border-teal-600 text-teal-600 bg-teal-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Invites {campaigns.filter(c => c.status === 'CONTACTED').length > 0 && <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{campaigns.filter(c => c.status === 'CONTACTED').length}</span>}
                </button>
                <button
                    onClick={() => setStatusFilter('ACTIVE')}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2 ${statusFilter === 'ACTIVE' ? 'border-teal-600 text-teal-600 bg-teal-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Active
                </button>
                <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2 ${statusFilter === 'ALL' ? 'border-teal-600 text-teal-600 bg-teal-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    All History
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
                    <p className="text-gray-500">You don&apos;t have any {statusFilter.toLowerCase()} campaigns yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                        {item.campaign.brand.companyName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{item.campaign.title}</h3>
                                        <p className="text-sm text-gray-500">{item.campaign.brand.companyName}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-sm text-gray-500 mt-2">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {new Date(item.updatedAt).toLocaleDateString()}
                                    </div>
                                    <Badge variant={
                                        item.status === 'CONTACTED' ? 'default' :
                                            item.status === 'HIRED' ? 'outline' : 'secondary'
                                    } className={
                                        item.status === 'CONTACTED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                            item.status === 'HIRED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''
                                    }>
                                        {item.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {item.status === 'CONTACTED' ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex-1 md:flex-none"
                                            onClick={() => handleAction(item.id, 'REJECT')}
                                            disabled={!!processing}
                                        >
                                            <X className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                        <Button
                                            className="bg-teal-600 hover:bg-teal-700 text-white flex-1 md:flex-none"
                                            onClick={() => handleAction(item.id, 'ACCEPT')}
                                            disabled={!!processing}
                                        >
                                            <Check className="w-4 h-4 mr-2" /> Accept Invite
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" className="flex-1 md:flex-none">
                                        <MessageSquare className="w-4 h-4 mr-2" /> Chat
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
