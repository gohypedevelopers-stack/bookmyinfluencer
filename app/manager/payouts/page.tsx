import { CreditCard, Landmark, Receipt, Sparkles } from "lucide-react";
import { getManagerPayouts } from "../actions";

export default async function ManagerPayoutsPage() {
    const result = await getManagerPayouts();
    const payouts = result.data || [];
    const formatDate = (value: string | Date) =>
        new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
    const formatMoney = (value: number) =>
        `Rs.${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value || 0))}`;
    const totalPaid = payouts.reduce((sum: number, payout: any) => sum + Number(payout.amount || 0), 0);
    const uniqueCreators = new Set(payouts.map((p: any) => p.creator?.id).filter(Boolean)).size;

    const cards = [
        {
            label: "Payout Volume",
            value: formatMoney(totalPaid),
            note: "Total processed through manager payout records",
            icon: Landmark,
            tone: "from-indigo-500/16 via-violet-500/8 to-white",
            iconWrap: "bg-indigo-500/12 text-indigo-600",
        },
        {
            label: "Transfer Records",
            value: String(payouts.length),
            note: "Every processed transfer with audit trail and campaign context",
            icon: Receipt,
            tone: "from-sky-500/16 via-cyan-500/8 to-white",
            iconWrap: "bg-sky-500/12 text-sky-600",
        },
        {
            label: "Paid Creators",
            value: String(uniqueCreators),
            note: "Unique creators covered by recorded manager-side payouts",
            icon: CreditCard,
            tone: "from-emerald-500/16 via-teal-500/8 to-white",
            iconWrap: "bg-emerald-500/12 text-emerald-600",
        },
    ];

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_46%,#4338ca_100%)] p-8 text-white shadow-[0_32px_90px_-54px_rgba(79,70,229,0.85)]">
                <div className="pointer-events-none absolute right-[-60px] top-[-40px] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-100">
                            <Sparkles className="h-4 w-4" />
                            Payout Desk
                        </div>
                        <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Track manual creator payouts cleanly</h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                            Review processed transfers, audit UTR references, and keep manager-side payment visibility organized.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[540px]">
                        <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100">Total Paid</p>
                            <p className="mt-2 text-2xl font-black">{formatMoney(totalPaid)}</p>
                        </div>
                        <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100">Records</p>
                            <p className="mt-2 text-2xl font-black">{payouts.length}</p>
                        </div>
                        <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100">Creators Paid</p>
                            <p className="mt-2 text-2xl font-black">{uniqueCreators}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-5 md:grid-cols-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className={`overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.92)),linear-gradient(135deg,var(--tw-gradient-stops))] ${card.tone} p-6 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.3)]`}>
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconWrap}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{card.value}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-500">{card.note}</p>
                        </div>
                    );
                })}
            </div>

            <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white/94 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.3)]">
                <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] px-6 py-5">
                    <h2 className="text-xl font-black tracking-tight text-slate-950">Processed Payout History</h2>
                    <p className="mt-1 text-sm text-slate-500">Campaign, creator, method, and UTR reference in one table.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 font-medium text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Paid At</th>
                                <th className="px-6 py-4">Campaign</th>
                                <th className="px-6 py-4">Creator</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">UTR/Ref</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payouts.map((p: any) => (
                                <tr key={p.id} className="hover:bg-slate-50/70">
                                    <td className="px-6 py-4 text-slate-600">
                                        {formatDate(p.paidAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{p.campaign.title}</div>
                                        <div className="text-xs text-slate-500">{p.campaign.brand.companyName}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {p.creator.user.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {p.method}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                        {p.utr}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-slate-950">
                                        {formatMoney(p.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {payouts.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            No manual payouts recorded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
