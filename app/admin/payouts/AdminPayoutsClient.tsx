'use client';

import { updatePayoutStatus } from "../actions";
import { PayoutRequest, InfluencerProfile, User } from "@prisma/client";
import { PayoutStatus } from "@prisma/client";
import { Check, X } from "lucide-react";

type Payout = PayoutRequest & {
    influencer: InfluencerProfile & { user: User };
};

export default function AdminPayoutsClient({ payouts }: { payouts: Payout[] }) {

    const handleAction = async (id: string, status: PayoutStatus) => {
        if (confirm(`Confirm ${status} action for this payout?`)) {
            await updatePayoutStatus(id, status);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Payout Requests</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-900 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Influencer</th>
                            <th className="px-6 py-4">Requested At</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payouts.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {p.influencer.user.name}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(p.requestedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    ${p.amount}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                     ${p.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                                            p.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200'}
                                   `}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    {p.status === 'REQUESTED' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(p.id, 'PAID')}
                                                className="px-3 py-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100 text-xs font-bold"
                                            >
                                                Mark Paid
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
