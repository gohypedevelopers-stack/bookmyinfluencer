import Link from "next/link";
import {
    ArrowRight,
    Calendar,
    FolderKanban,
    Sparkles,
    User,
} from "lucide-react";
import { getManagerCampaigns } from "../actions";

export default async function ManagerCampaignsPage() {
    const campaignsResult = await getManagerCampaigns();
    const campaigns = campaignsResult.data || [];
    const formatDate = (value: string | Date) =>
        new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
    const formatMoney = (value: number) =>
        `Rs.${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value || 0))}`;

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_45%,#4338ca_100%)] p-8 text-white shadow-[0_32px_90px_-54px_rgba(79,70,229,0.85)]">
                <div className="pointer-events-none absolute right-[-60px] top-[-40px] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-90px] left-[-20px] h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-100">
                            <Sparkles className="h-4 w-4" />
                            Execution Queue
                        </div>
                        <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Campaigns under your manager workflow</h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                            Open live assignments, review creator status, and move each campaign cleanly from paid activation to final delivery.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                        <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100">Assigned</p>
                            <p className="mt-2 text-3xl font-black">{campaigns.length}</p>
                        </div>
                        <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100">Live Flow</p>
                            <p className="mt-2 text-3xl font-black">Manager-led</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="flex flex-col gap-5 rounded-[30px] border border-white/80 bg-white/95 p-6 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.32)]">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_55%,#4f46e5_100%)] text-lg font-black text-white shadow-[0_18px_36px_-24px_rgba(79,70,229,0.85)]">
                                {campaign.brand.companyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{campaign.brand.companyName}</p>
                                <h3 className="mt-1 text-xl font-black leading-tight text-slate-950">{campaign.title}</h3>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Budget</p>
                                <p className="mt-2 text-sm font-black text-slate-950">{formatMoney(campaign.budget || 0)}</p>
                            </div>
                            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Niche</p>
                                <p className="mt-2 text-sm font-black text-slate-950">{campaign.niche || "General"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                            <User className="h-4 w-4" />
                            {campaign._count?.candidates || 0} Candidate(s)
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(campaign.createdAt)}
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                    {campaign.status}
                                </span>
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                                    {campaign.paymentStatus}
                                </span>
                            </div>
                            <Link href={`/manager/campaigns/${campaign.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">
                                Manage
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {campaigns.length === 0 && (
                <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/90 px-8 py-20 text-center shadow-[0_24px_50px_-40px_rgba(15,23,42,0.25)]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <FolderKanban className="h-7 w-7 text-slate-400" />
                    </div>
                    <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-950">No campaigns assigned yet</h3>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                        Paid brand campaigns assigned to your manager role will appear here once execution starts.
                    </p>
                </div>
            )}
        </div>
    );
}
