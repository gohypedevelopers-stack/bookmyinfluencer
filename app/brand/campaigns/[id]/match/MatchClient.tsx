'use client';

import { useState, useEffect } from 'react';
import { getMatchedCreators } from '@/app/brand/actions';
import { useRouter } from 'next/navigation';
import { Check, X, RefreshCw, IndianRupee, MapPin, Users, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export default function MatchClient({ campaignId, budget }: { campaignId: string, budget: number }) {
    const router = useRouter();
    const [creators, setCreators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectedIds, setRejectedIds] = useState<string[]>([]);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async (currentRejected: string[] = []) => {
        setLoading(true);
        const res = await getMatchedCreators(campaignId, currentRejected);
        if (res.success && res.data) {
            setCreators(res.data);
            setTotalCost(res.totalFollowers || 0);
        }
        setLoading(false);
    };

    const handleReject = async (creatorId: string) => {
        const newRejected = [...rejectedIds, creatorId];
        setRejectedIds(newRejected);
        // Remove locally immediately for snappy UI
        setCreators(prev => prev.filter(c => c.id !== creatorId));
        // Fetch replacement
        fetchMatches(newRejected);
    };

    const handleProceedToPayment = () => {
        router.push(`/brand/campaigns/${campaignId}/payment`);
    };

    return (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 pb-32">
            <div className="mb-6 flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Your AI Matches</h2>
                    <p className="text-gray-500 text-sm mt-1">Found creators adding up to ~{totalCost.toLocaleString()} followers.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Total Allocation</p>
                    <p className="text-2xl font-black text-gray-900">₹{budget.toLocaleString()}</p>
                </div>
            </div>

            {loading && creators.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-gray-400">
                    <RefreshCw className="w-10 h-10 animate-spin mb-4 text-teal-500" />
                    <p className="font-medium animate-pulse">Finding the perfect creators...</p>
                </div>
            ) : creators.length === 0 ? (
                <div className="py-24 text-center">
                    <p className="text-gray-500 font-medium">No more creators match your criteria.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {creators.map((creator) => (
                        <div key={creator.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-center hover:shadow-md transition-all">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm shrink-0">
                                {creator.profileImage ? (
                                    <Image src={creator.profileImage} alt={creator.name} width={80} height={80} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Users className="w-8 h-8 opacity-50" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                    {creator.name}
                                    {creator.verified && <Check className="w-4 h-4 text-white bg-blue-500 rounded-full p-0.5" />}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">{creator.niche}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md">
                                        <Users className="w-3.5 h-3.5" />
                                        {creator.followers}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        {creator.engagementRate || 'N/A'} ER
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        {creator.followersCount.toLocaleString()} Value
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => handleReject(creator.id)}
                                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-bold flex items-center gap-2 justify-center"
                                >
                                    <RefreshCw className="w-4 h-4" /> Replace
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Next steps</p>
                        <p className="font-bold text-gray-900 text-lg">Pay upfront to activate PM</p>
                    </div>
                    <button
                        onClick={handleProceedToPayment}
                        disabled={creators.length === 0 || loading}
                        className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl shadow-xl shadow-gray-900/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        Proceed to Payment <span className="material-symbols-outlined text-lg">payment</span>
                    </button>
                </div>
            </div>
        </main>
    );
}
