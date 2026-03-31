"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Label
} from 'recharts';
import {
    Users,
    Heart,
    IndianRupee,
    ShoppingBag,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Activity,
} from "lucide-react";

interface AnalyticsDashboardProps {
    data: {
        summary: {
            totalReach: number;
            totalEngagement: number;
            avgCPE: string;
            conversions: number;
            totalSpent: number;
            budget: number | null;
        };
        performance: any[];
        creators: any[];
    };
    campaignTitle: string;
    campaignStatus: string;
}

export function AnalyticsDashboard({ data, campaignTitle, campaignStatus }: AnalyticsDashboardProps) {
    const { summary, performance } = data;

    const numberFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
    const compactFormatter = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
    const totalBudget = summary.budget && summary.budget > 0 ? summary.budget : 500000;
    const remainingBudget = Math.max(totalBudget - summary.totalSpent, 0);
    const spentPercentage = Math.min(Math.round((summary.totalSpent / totalBudget) * 100), 100);
    const avgCPE = Number(summary.avgCPE || 0);
    const chartData = performance.length > 0 ? performance : [{ date: 'Start', instagram: 0, youtube: 0 }];
    const hasPerformance = chartData.some((point) => Number(point.instagram || 0) > 0 || Number(point.youtube || 0) > 0);
    const budgetData = [
        { name: 'Used', value: summary.totalSpent },
        { name: 'Remaining', value: remainingBudget }
    ];
    const COLORS = ['#14b8a6', '#dbeafe'];
    const formatNumber = (value: number) => numberFormatter.format(Math.max(0, Math.round(value || 0)));
    const formatCompact = (value: number) => value > 0 ? compactFormatter.format(value) : '0';
    const formatCurrency = (value: number) => `Rs.${formatNumber(value)}`;
    const formatShortCurrency = (value: number) => `Rs.${value > 0 ? compactFormatter.format(value) : '0'}`;
    const formatChartLabel = (value: string) => {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-[linear-gradient(135deg,#020617_0%,#0f172a_42%,#0f766e_100%)] text-white shadow-[0_32px_80px_-32px_rgba(15,23,42,0.55)]">
                <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-10 h-48 w-48 rounded-full bg-blue-400/15 blur-3xl" />

                <div className="relative grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)] lg:px-8 lg:py-8">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                Campaign Command Center
                            </span>
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${getStatusTone(campaignStatus)}`}>
                                {campaignStatus}
                            </span>
                        </div>

                        <div className="max-w-3xl">
                            <h1 className="text-3xl font-black tracking-tight text-white md:text-[2.7rem]">{campaignTitle}</h1>
                            <p className="mt-3 max-w-2xl text-sm text-slate-200 md:text-base">
                                One clean view for reach, spend, conversion momentum, and manager-led execution updates.
                                This page should feel like your control room, not a plain report dump.
                            </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <HeroMetric label="Allocated Budget" value={formatCurrency(totalBudget)} meta={`${spentPercentage}% utilized`} />
                            <HeroMetric label="Spent So Far" value={formatCurrency(summary.totalSpent)} meta="Paid and committed campaign spend" />
                            <HeroMetric label="Remaining Budget" value={formatCurrency(remainingBudget)} meta="Available runway for this campaign" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:items-end">
                        <div className="flex flex-wrap justify-start gap-3 lg:justify-end">
                            <Button className="rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100">
                                <Download className="mr-2 h-4 w-4" />
                                Export Report
                            </Button>
                        </div>

                        <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm lg:max-w-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">Brand Snapshot</p>
                            <p className="mt-3 text-3xl font-black">{spentPercentage}%</p>
                            <p className="mt-2 text-sm text-slate-200">
                                Budget used so far. Chat stays pinned beside this view so you can track manager updates without scrolling down.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total Reach"
                    value={formatCompact(summary.totalReach)}
                    trend="+12.5%"
                    trendUp
                    description="Audience exposed to the campaign"
                    icon={Users}
                    accent="from-blue-500/15 via-sky-400/10 to-white"
                    iconClassName="bg-blue-500/10 text-blue-600"
                />
                <StatCard
                    title="Engagement"
                    value={formatCompact(summary.totalEngagement)}
                    trend="+5.2%"
                    trendUp
                    description="Signals across posts and creator content"
                    icon={Heart}
                    accent="from-rose-500/15 via-orange-400/10 to-white"
                    iconClassName="bg-rose-500/10 text-rose-600"
                />
                <StatCard
                    title="Avg. CPE"
                    value={formatCurrency(avgCPE)}
                    trend="-2%"
                    trendUp
                    trendLabel="better than last cycle"
                    description="Average cost per engagement"
                    icon={IndianRupee}
                    accent="from-emerald-500/15 via-teal-400/10 to-white"
                    iconClassName="bg-emerald-500/10 text-emerald-600"
                />
                <StatCard
                    title="Conversions"
                    value={formatNumber(summary.conversions)}
                    trend="+8%"
                    trendUp
                    description="Estimated actions driven by creators"
                    icon={ShoppingBag}
                    accent="from-violet-500/15 via-fuchsia-400/10 to-white"
                    iconClassName="bg-violet-500/10 text-violet-600"
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <Card className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] lg:col-span-2">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(37,99,235,0.06),rgba(255,255,255,0))]" />

                    <div className="relative mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Performance Over Time</p>
                            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Momentum across creator platforms</h3>
                            <p className="mt-1 text-sm text-slate-500">Instagram and YouTube movement, refreshed as manager activity progresses.</p>
                        </div>
                        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            Instagram + YouTube
                        </div>
                    </div>

                    <div className="relative h-[340px] w-full">
                        {!hasPerformance && (
                            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white/70 backdrop-blur-sm">
                                <div className="max-w-sm text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                                        <Activity className="h-6 w-6" />
                                    </div>
                                    <h4 className="mt-4 text-lg font-bold text-slate-900">Waiting for first performance signals</h4>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Once creators start publishing and the manager logs activity, this chart will shift from zero into a proper trend view.
                                    </p>
                                </div>
                            </div>
                        )}

                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatChartLabel}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    labelFormatter={(value) => formatChartLabel(String(value))}
                                    contentStyle={{
                                        borderRadius: '20px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 20px 50px -35px rgba(15,23,42,0.45)',
                                        backgroundColor: '#ffffff',
                                    }}
                                    cursor={{ stroke: '#bfdbfe', strokeWidth: 1.5, strokeDasharray: '4 6' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="instagram"
                                    stroke="#14b8a6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#14b8a6' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="youtube"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    dot={{ r: 3.5, fill: '#818cf8', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 5, strokeWidth: 0, fill: '#818cf8' }}
                                    strokeDasharray="6 6"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
                    <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-100/70 blur-3xl" />

                    <div className="relative mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Budget Utilization</p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Spend pacing and runway</h3>
                        <p className="mt-1 text-sm text-slate-500">A quick read on usage, remaining room, and current execution tempo.</p>
                    </div>

                    <div className="relative flex min-h-[260px] flex-1 items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={budgetData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={104}
                                    paddingAngle={0}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                    stroke="none"
                                    cornerRadius={10}
                                >
                                    {budgetData.map((entry, index) => (
                                        <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    <Label
                                        value={`${spentPercentage}%`}
                                        position="center"
                                        className="fill-slate-950 text-3xl font-black"
                                    />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute left-1/2 top-1/2 w-32 -translate-x-1/2 translate-y-8 text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Spent</p>
                            <p className="mt-2 text-lg font-black text-slate-950">{formatShortCurrency(summary.totalSpent)}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <MetricTile label="Spent" value={formatCurrency(summary.totalSpent)} />
                            <MetricTile label="Remaining" value={formatCurrency(remainingBudget)} />
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Budget Note</p>
                            <p className="mt-2 text-sm font-semibold text-slate-700">
                                This block is limited to the spend picture only, so the brand sees budget clarity without internal workflow noise.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}


function HeroMetric({ label, value, meta }: { label: string; value: string; meta: string }) {
    return (
        <div className="rounded-[24px] border border-white/10 bg-slate-950/25 px-4 py-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{label}</p>
            <p className="mt-2 text-2xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs font-medium text-slate-300">{meta}</p>
        </div>
    );
}

function MetricTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
        </div>
    );
}

function StatCard({ title, value, trend, trendUp, trendLabel, description, icon: Icon, accent, iconClassName }: any) {
    return (
        <Card className={`overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br ${accent} p-5 shadow-[0_22px_50px_-36px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1`}>
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{title}</h3>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <div className="space-y-3">
                <div className="text-3xl font-black tracking-tight text-slate-950">{value}</div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {trendUp ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                        {trend}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{trendLabel || 'vs last month'}</span>
                </div>
            </div>
        </Card>
    );
}

function getStatusTone(status: string) {
    switch (status) {
        case 'ACTIVE':
            return 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100';
        case 'COMPLETED':
            return 'border-blue-300/40 bg-blue-400/15 text-blue-100';
        case 'PAUSED':
            return 'border-amber-300/40 bg-amber-400/15 text-amber-100';
        default:
            return 'border-white/15 bg-white/10 text-slate-100';
    }
}
