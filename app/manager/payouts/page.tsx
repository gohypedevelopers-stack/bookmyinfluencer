import { getManagerPayouts } from "../actions";

export default async function ManagerPayoutsPage() {
    const result = await getManagerPayouts();
    const payouts = result.data || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Payout History</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Paid At</th>
                                <th className="px-6 py-4">Campaign</th>
                                <th className="px-6 py-4">Creator</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">UTR/Ref</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payouts.map((p: any) => (
                                <tr key={p.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(p.paidAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{p.campaign.title}</div>
                                        <div className="text-xs text-gray-500">{p.campaign.brand.companyName}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {p.creator.user.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {p.method}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {p.utr}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                                        ₹{p.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {payouts.length === 0 && (
                        <div className="p-10 text-center text-gray-400">
                            No manual payouts recorded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
