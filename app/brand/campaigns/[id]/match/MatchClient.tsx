'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, RefreshCw, ShieldAlert, TrendingUp, Users } from 'lucide-react';
import {
    decideCampaignMatch,
    getCampaignMatchState,
    shuffleAcceptedCampaignInfluencer,
} from '@/app/brand/campaigns/flow-actions';

type MatchClientProps = {
    campaignId: string;
    budget: number;
    paymentStatus: string;
};

export default function MatchClient({ campaignId, budget, paymentStatus }: MatchClientProps) {
    const router = useRouter();
    const [state, setState] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const paid = paymentStatus === 'PAID';

    const loadState = async () => {
        setLoading(true);
        const response = await getCampaignMatchState(campaignId);
        if (response.success) setState(response);
        setLoading(false);
    };

    useEffect(() => {
        loadState();
    }, []);

    const pendingMatches = useMemo(
        () => (state?.matches || []).filter((match: any) => match.brandDecision === 'PENDING'),
        [state]
    );
    const acceptedMatches = useMemo(
        () => (state?.matches || []).filter((match: any) => match.brandDecision === 'ACCEPTED'),
        [state]
    );

    const targetCreatorCount = Number(state?.summary?.targetCreatorCount || 0);
    const canProceedToPayment = acceptedMatches.length > 0 && (targetCreatorCount === 0 || acceptedMatches.length >= targetCreatorCount);

    const handleDecision = (candidateId: string, decision: 'ACCEPT' | 'REJECT') => {
        startTransition(async () => {
            await decideCampaignMatch(campaignId, candidateId, decision);
            await loadState();
        });
    };

    const handleShuffleAccepted = (candidateId: string) => {
        startTransition(async () => {
            await shuffleAcceptedCampaignInfluencer(campaignId, candidateId);
            await loadState();
        });
    };

    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-3 text-teal-600" />
                Loading matched influencers...
            </div>
        );
    }

    return (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 pb-28">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Selection Summary</h2>
                    <p className="text-sm text-gray-500">
                        Accepted: {state?.summary?.acceptedCount || 0} | Pending: {state?.summary?.pendingCount || 0} | Rejected: {state?.summary?.rejectedCount || 0}
                    </p>
                    <p className="text-xs font-semibold text-indigo-600 mt-1">
                        Target creators: {targetCreatorCount || 0} ({state?.campaign?.followerLabel || 'Follower band'})
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold uppercase text-gray-400">Budget</p>
                    <p className="text-2xl font-black text-gray-900">Rs.{Number(budget).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Remaining: Rs.{Number(state?.summary?.remainingBudget || 0).toLocaleString()}</p>
                </div>
            </div>

            {acceptedMatches.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase text-teal-700 mb-3">Accepted Influencers</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {acceptedMatches.map((match: any) => (
                            <div key={match.id} className="relative bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center gap-3">
                                {!paid && (
                                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center px-4">
                                        <p className="text-xs font-bold text-slate-700 text-center">Make payment to unlock creator details and start project.</p>
                                    </div>
                                )}
                                <div className={`w-12 h-12 rounded-full overflow-hidden bg-white ${!paid ? 'blur-sm' : ''}`}>
                                    {match.image ? (
                                        <Image src={match.image} alt={match.name} width={48} height={48} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-teal-700 font-bold">{match.name?.[0] || 'C'}</div>
                                    )}
                                </div>
                                <div className={`flex-1 min-w-0 ${!paid ? 'blur-sm' : ''}`}>
                                    <p className="font-bold text-gray-900 truncate">{paid ? match.name : 'Creator locked'}</p>
                                    <p className="text-xs text-gray-600 truncate">{match.niche || 'General'} - {match.location || 'Any location'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {paid && (
                                        <button
                                            onClick={() => handleShuffleAccepted(match.id)}
                                            disabled={isPending}
                                            className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 text-xs font-bold hover:bg-amber-50 disabled:opacity-50"
                                        >
                                            Shuffle
                                        </button>
                                    )}
                                    <Check className="w-5 h-5 text-teal-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Pending Recommendations</h3>
                {pendingMatches.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
                        No pending matches left. Accept creators or shuffle by rejecting existing recommendations.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingMatches.map((match: any) => (
                            <div key={match.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
                                    {match.image ? (
                                        <Image src={match.image} alt={match.name} width={56} height={56} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{match.name?.[0] || 'C'}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{match.name}</h4>
                                    <p className="text-sm text-gray-500 truncate">{match.niche || 'General'} - {match.location || 'Any location'}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600">
                                            <Users className="w-3.5 h-3.5" />
                                            {Number(match.followerCount || 0).toLocaleString()} followers
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            {Number(match.engagementRate || 0).toFixed(1)}% ER
                                        </span>
                                        {match.fakeEngagementFlag && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                Quality flag
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDecision(match.id, 'REJECT')}
                                        disabled={isPending || paid}
                                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Reject + Shuffle
                                    </button>
                                    <button
                                        onClick={() => handleDecision(match.id, 'ACCEPT')}
                                        disabled={isPending || paid}
                                        className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        Accept
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Next step</p>
                        <p className="font-semibold text-gray-900">
                            {paid ? 'Campaign already paid and active' : 'Confirm upfront payment to activate manager-led execution'}
                        </p>
                        {!paid && targetCreatorCount > 0 && acceptedMatches.length < targetCreatorCount && (
                            <p className="text-xs font-semibold text-amber-600 mt-1">
                                Payment requires {targetCreatorCount} accepted creators ({acceptedMatches.length}/{targetCreatorCount}).
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => router.push(`/brand/campaigns/${campaignId}/payment`)}
                        disabled={!canProceedToPayment || paid}
                        className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold disabled:opacity-40"
                    >
                        {paid ? 'Already Paid' : 'Proceed to Payment'}
                    </button>
                </div>
            </div>
        </main>
    );
}
