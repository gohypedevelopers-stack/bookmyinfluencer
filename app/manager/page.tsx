import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    FolderKanban,
    Sparkles,
} from "lucide-react";
import { getManagerStats, getManagerCampaigns } from "./actions";

export default async function ManagerDashboard() {
    const statsResult = await getManagerStats();
    const stats = statsResult.data || { activeCampaigns: 0, pendingApprovals: 0, completedCampaigns: 0 };
    const campaignsResult = await getManagerCampaigns();
    const campaigns = campaignsResult.data || [];
    const formatMoney = (value: number) =>
        `Rs.${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value || 0))}`;

    const cards = [
        {
            label: "Active Campaigns",
            value: stats.activeCampaigns || 0,
            note: "Live assignments currently under manager execution",
            icon: FolderKanban,
            tone: "from-indigo-500/16 via-violet-500/8 to-white",
            iconWrap: "bg-indigo-500/12 text-indigo-600",
        },
        {
            label: "Pending Approvals",
            value: stats.pendingApprovals || 0,
            note: "Creator submissions waiting for your review decision",
            icon: Clock3,
            tone: "from-amber-500/16 via-orange-500/8 to-white",
            iconWrap: "bg-amber-500/12 text-amber-600",
        },
        {
            label: "Completed Campaigns",
            value: stats.completedCampaigns || 0,
            note: "Projects fully reviewed and closed from the manager side",
            icon: CheckCircle2,
            tone: "from-emerald-500/16 via-teal-500/8 to-white",
            iconWrap: "bg-emerald-500/12 text-emerald-600",
        },
    ];

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_48%,#4f46e5_100%)] p-8 text-white shadow-[0_32px_90px_-54px_rgba(79,70,229,0.9)]">
                <div className="pointer-events-none absolute right-[-40px] top-[-60px] h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-80px] left-[-50px] h-56 w-56 rounded-full bg-fuchsia-400/15 blur-3xl" />

                <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-100">
                            <Sparkles className="h-4 w-4" />
                            Manager Command Center
                        </div>
                        <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                            Keep delivery moving without mixing brand and creator channels
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                            Review creator submissions, push campaign updates, and keep every assignment execution-ready from one clean workspace.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                        <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100">Active</p>
                            <p className="mt-2 text-3xl font-black">{stats.activeCampaigns || 0}</p>
                        </div>
                        <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100">Pending Review</p>
                            <p className="mt-2 text-3xl font-black">{stats.pendingApprovals || 0}</p>
                        </div>
                        <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100">Completed</p>
                            <p className="mt-2 text-3xl font-black">{stats.completedCampaigns || 0}</p>
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

            <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.3)]">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] px-6 py-5">
                    <div>
                        <h3 className="text-xl font-black tracking-tight text-slate-950">Recent Assignments</h3>
                        <p className="mt-1 text-sm text-slate-500">Jump back into active delivery boards and approval queues.</p>
                    </div>
                    <Link href="/manager/campaigns" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-950">
                        View all
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="divide-y divide-slate-100">
                    {campaigns.length > 0 ? (
                        campaigns.slice(0, 5).map((campaign: any) => (
                            <div key={campaign.id} className="flex flex-col gap-4 p-6 transition-colors hover:bg-slate-50/80 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_55%,#4f46e5_100%)] text-sm font-black text-white shadow-[0_18px_36px_-24px_rgba(79,70,229,0.85)]">
                                        {campaign.brand.companyName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-slate-950">{campaign.title}</h4>
                                        <p className="text-sm text-slate-500">{campaign.brand.companyName}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                        {campaign.status}
                                    </div>
                                    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                                        {campaign.paymentStatus}
                                    </div>
                                    <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                                        {formatMoney(campaign.budget || 0)}
                                    </div>
                                    <Link href={`/manager/campaigns/${campaign.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">
                                        Manage
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-sm text-slate-400">
                            No campaigns assigned yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
