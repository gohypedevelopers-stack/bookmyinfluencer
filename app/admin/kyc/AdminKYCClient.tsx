'use client';

import { updateKYCStatus } from "../actions";
import { KYCSubmission, InfluencerProfile, User } from "@prisma/client";
import { KYCStatus } from "@prisma/client";
import { Check, X, Clock } from "lucide-react";

type Submission = KYCSubmission & {
    profile: InfluencerProfile & { user: User };
};

export default function AdminKYCClient({ submissions }: { submissions: Submission[] }) {

    const handleAction = async (id: string, status: KYCStatus) => {
        if (confirm(`Are you sure you want to ${status} this submission?`)) {
            await updateKYCStatus(id, status);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">KYC Verifications</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-900 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Influencer</th>
                            <th className="px-6 py-4">Submitted At</th>
                            <th className="px-6 py-4">Docs</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {submissions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {sub.profile.user.name}
                                    <div className="text-xs text-gray-500 font-normal">{sub.profile.user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <a href="#" className="text-blue-600 hover:underline">View Docs</a>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                     ${sub.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                            sub.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'}
                                   `}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    {sub.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(sub.id, 'APPROVED')}
                                                className="p-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAction(sub.id, 'REJECTED')}
                                                className="p-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {submissions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No pending submissions.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
