'use client';

import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ClipboardCheck, FileUp, Inbox, ShieldCheck } from "lucide-react";
import { submitDeliverable } from '../../actions';
import InvitationDetailsModal from './InvitationDetailsModal';
import SubmitDeliverableModal from './SubmitDeliverableModal';

interface CreatorCampaignsClientProps {
    candidates: any[];
    followerCount: number;
}

export default function CreatorCampaignsClient({ candidates, followerCount }: CreatorCampaignsClientProps) {
    const [selectedTab, setSelectedTab] = useState<'INVITATIONS' | 'ACTIVE' | 'COMPLETED'>('INVITATIONS');
    const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
    const [submitCandidate, setSubmitCandidate] = useState<any>(null);

    const invitations = useMemo(
        () => candidates.filter((candidate) => candidate.creatorDecision === 'PENDING'),
        [candidates]
    );
    const active = useMemo(
        () =>
            candidates.filter(
                (candidate) =>
                    candidate.creatorDecision === 'ACCEPTED' &&
                    candidate.managerReviewStatus !== 'READY_FOR_BRAND_REVIEW'
            ),
        [candidates]
    );
    const completed = useMemo(
        () =>
            candidates.filter(
                (candidate) =>
                    candidate.managerReviewStatus === 'READY_FOR_BRAND_REVIEW' ||
                    candidate.status === 'COMPLETED'
            ),
        [candidates]
    );

    const list = selectedTab === 'INVITATIONS' ? invitations : selectedTab === 'ACTIVE' ? active : completed;

    const onSubmitDeliverable = async (candidateId: string, url: string, notes: string) => {
        return submitDeliverable(candidateId, url, notes);
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50/50 min-h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h1>
                <p className="text-gray-500">
                    You receive curated, manager-led paid campaigns only. Follower count: {followerCount.toLocaleString()}.
                </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 border-gray-200">
                    <p className="text-xs uppercase font-semibold text-gray-400">Invitations</p>
                    <p className="text-2xl font-black text-gray-900">{invitations.length}</p>
                </Card>
                <Card className="p-4 border-gray-200">
                    <p className="text-xs uppercase font-semibold text-gray-400">Active</p>
                    <p className="text-2xl font-black text-gray-900">{active.length}</p>
                </Card>
                <Card className="p-4 border-gray-200">
                    <p className="text-xs uppercase font-semibold text-gray-400">Completed</p>
                    <p className="text-2xl font-black text-gray-900">{completed.length}</p>
                </Card>
            </div>

            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[
                    { key: 'INVITATIONS', label: `Invitations (${invitations.length})` },
                    { key: 'ACTIVE', label: `Active (${active.length})` },
                    { key: 'COMPLETED', label: `Completed (${completed.length})` },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setSelectedTab(tab.key as any)}
                        className={`px-4 py-3 text-sm font-bold border-b-2 ${selectedTab === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {list.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-gray-300 bg-white">
                    <div className="w-14 h-14 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-3">
                        {selectedTab === 'INVITATIONS' ? <Inbox className="w-7 h-7 text-gray-400" /> : selectedTab === 'ACTIVE' ? <ClipboardCheck className="w-7 h-7 text-gray-400" /> : <CheckCircle2 className="w-7 h-7 text-gray-400" />}
                    </div>
                    <p className="font-semibold text-gray-700">No {selectedTab.toLowerCase()} campaigns right now.</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {list.map((candidate) => (
                        <Card key={candidate.id} className="p-5 border-gray-200 bg-white flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase">{candidate.campaign.brand.companyName}</p>
                                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{candidate.campaign.title}</h3>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                                    {candidate.managerReviewStatus?.replaceAll('_', ' ')}
                                </span>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-semibold">Niche:</span> {candidate.campaign.niche || 'General'}</p>
                                <p><span className="font-semibold">Location:</span> {candidate.campaign.location || 'Any'}</p>
                                <p><span className="font-semibold">Platform:</span> {candidate.campaign.platform || 'Multi-platform'}</p>
                                <p><span className="font-semibold">Manager:</span> {candidate.campaign.assignment?.manager?.name || 'Assigned internally'}</p>
                            </div>

                            {candidate.managerReviewStatus === 'CHANGES_REQUESTED' && (
                                <div className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg p-2">
                                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                                    Changes requested: {candidate.managerReviewNotes || 'Please resubmit with corrections.'}
                                </div>
                            )}

                            <div className="mt-auto">
                                {selectedTab === 'INVITATIONS' && (
                                    <Button className="w-full" onClick={() => setSelectedInvitation(candidate)}>
                                        Review Invitation
                                    </Button>
                                )}
                                {selectedTab === 'ACTIVE' && (
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setSubmitCandidate(candidate)}>
                                        <FileUp className="w-4 h-4 mr-2" />
                                        Submit Content Link
                                    </Button>
                                )}
                                {selectedTab === 'COMPLETED' && (
                                    <Button className="w-full" variant="outline" disabled>
                                        Ready for brand review
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <InvitationDetailsModal
                isOpen={!!selectedInvitation}
                invitation={selectedInvitation}
                onClose={() => setSelectedInvitation(null)}
            />

            <SubmitDeliverableModal
                isOpen={!!submitCandidate}
                candidate={submitCandidate}
                onClose={() => setSubmitCandidate(null)}
                onSubmit={onSubmitDeliverable}
            />
        </div>
    );
}

