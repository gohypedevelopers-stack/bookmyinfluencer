import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowRight, Clock3, Filter, Layers3, Search, Sparkles, Target, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { ensureRequestExpiryJobStarted } from "@/jobs/requestExpiryJob";
import { getBrandCampaignQueueDashboard } from "@/services/collabService";

type QueueSearchParams = {
    status?: string | string[];
    category?: string | string[];
    campaign?: string | string[];
};

function pickQueryValue(value?: string | string[]) {
    if (Array.isArray(value)) {
        return value[0] || "";
    }
    return value || "";
}

function normalizeFilterValue(value?: string | string[]) {
    return pickQueryValue(value).trim();
}

function formatSummaryDate(value?: string | null) {
    if (!value) return "Not available yet";

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}

function getStatusClasses(status: string) {
    switch (String(status || "").toLowerCase()) {
        case "accepted":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "expired":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "rejected":
            return "bg-rose-50 text-rose-700 border-rose-200";
        default:
            return "bg-blue-50 text-blue-700 border-blue-200";
    }
}

function buildTotals(campaigns: any[]) {
    return campaigns.reduce(
        (summary, workflow) => {
            summary.campaigns += 1;
            summary.pending += Number(workflow.counts.pending || 0);
            summary.accepted += Number(workflow.counts.accepted || 0);
            summary.expired += Number(workflow.counts.expired || 0);
            summary.rejected += Number(workflow.counts.rejected || 0);
            summary.sent += Number(workflow.counts.sent || 0);
            summary.remainingAcceptedSlots += Number(workflow.counts.remainingAcceptedSlots || 0);
            return summary;
        },
        {
            campaigns: 0,
            pending: 0,
            accepted: 0,
            expired: 0,
            rejected: 0,
            sent: 0,
            remainingAcceptedSlots: 0,
        },
    );
}

export default async function BrandCampaignQueuesPage({
    searchParams,
}: {
    searchParams?: QueueSearchParams | Promise<QueueSearchParams>;
}) {
    ensureRequestExpiryJobStarted();

    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    const queueDashboard = await getBrandCampaignQueueDashboard(session.user.id);
    const resolvedSearchParams = await Promise.resolve(searchParams || {});

    const campaignFilter = normalizeFilterValue(resolvedSearchParams.campaign);
    const statusFilter = normalizeFilterValue(resolvedSearchParams.status).toLowerCase();
    const categoryFilter = normalizeFilterValue(resolvedSearchParams.category).toLowerCase();
    const hasActiveFilters = Boolean(campaignFilter || statusFilter || categoryFilter);

    const availableCategories = Array.from(
        new Set(
            queueDashboard.campaigns
                .map((workflow: any) => String(workflow.campaign.categoryLabel || workflow.campaign.category || "").trim())
                .filter(Boolean),
        ),
    ).sort((left, right) => left.localeCompare(right));

    const filteredCampaigns = queueDashboard.campaigns.filter((workflow: any) => {
        const campaignTitle = String(workflow.campaign.title || "").toLowerCase();
        const campaignId = String(workflow.campaign.id || "").toLowerCase();
        const campaignCategory = String(workflow.campaign.categoryLabel || workflow.campaign.category || "").toLowerCase();
        const campaignStatus = String(workflow.campaign.status || "").toLowerCase();

        const matchesCampaign =
            !campaignFilter ||
            campaignTitle.includes(campaignFilter.toLowerCase()) ||
            campaignId.includes(campaignFilter.toLowerCase());

        const matchesCategory = !categoryFilter || campaignCategory === categoryFilter;

        let matchesStatus = true;
        if (statusFilter) {
            if (statusFilter === "active" || statusFilter === "paused" || statusFilter === "archived") {
                matchesStatus = campaignStatus === statusFilter;
            } else {
                matchesStatus = Number(workflow.counts?.[statusFilter] || 0) > 0;
            }
        }

        return matchesCampaign && matchesCategory && matchesStatus;
    });

    const filteredTotals = buildTotals(filteredCampaigns);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">Brand Campaign Queues</div>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">{queueDashboard.brand.companyName} queue dashboard</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                            Track every onboarding-generated campaign queue, pending collaboration requests, accepted influencers, and automatic refill coverage in one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/brand/discover"
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            Explore creators
                        </Link>
                        <Link
                            href="/brand"
                            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Back to brand home
                        </Link>
                    </div>
                </div>

                <form method="GET" className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-900">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-semibold">Filter queues</span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <label htmlFor="campaign" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Campaign</label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="campaign"
                                    name="campaign"
                                    defaultValue={campaignFilter}
                                    placeholder="Search by campaign title or id"
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 focus:border-violet-400 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="status" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
                            <select
                                id="status"
                                name="status"
                                defaultValue={statusFilter}
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-violet-400 focus:bg-white focus:outline-none"
                            >
                                <option value="">All statuses</option>
                                <option value="active">Active campaigns</option>
                                <option value="pending">Has pending requests</option>
                                <option value="accepted">Has accepted requests</option>
                                <option value="expired">Has expired requests</option>
                                <option value="rejected">Has rejected requests</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="category" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Category</label>
                            <select
                                id="category"
                                name="category"
                                defaultValue={categoryFilter}
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-violet-400 focus:bg-white focus:outline-none"
                            >
                                <option value="">All categories</option>
                                {availableCategories.map((category) => (
                                    <option key={category} value={category.toLowerCase()}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Apply filters
                        </button>

                        {hasActiveFilters && (
                            <Link
                                href="/brand/campaign-queues"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Clear filters
                            </Link>
                        )}
                    </div>
                </form>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-slate-500">Filtered queues</div>
                            <Layers3 className="h-5 w-5 text-violet-500" />
                        </div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">{filteredTotals.campaigns}</div>
                        <div className="mt-2 text-sm text-slate-500">Showing queue count after filters.</div>
                    </div>

                    <div className="rounded-[1.75rem] border border-blue-200 bg-blue-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-blue-600">Pending requests</div>
                            <Clock3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="mt-3 text-3xl font-bold text-blue-700">{filteredTotals.pending}</div>
                        <div className="mt-2 text-sm text-blue-600/80">Pending count for currently visible queues.</div>
                    </div>

                    <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-emerald-600">Accepted influencers</div>
                            <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="mt-3 text-3xl font-bold text-emerald-700">{filteredTotals.accepted}</div>
                        <div className="mt-2 text-sm text-emerald-600/80">Accepted count for currently visible queues.</div>
                    </div>

                    <div className="rounded-[1.75rem] border border-violet-200 bg-violet-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-violet-600">Remaining slots</div>
                            <Target className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="mt-3 text-3xl font-bold text-violet-700">{filteredTotals.remainingAcceptedSlots}</div>
                        <div className="mt-2 text-sm text-violet-600/80">Open acceptance slots for visible queues.</div>
                    </div>
                </div>

                {queueDashboard.campaigns.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                        <Sparkles className="mx-auto h-12 w-12 text-violet-500" />
                        <h2 className="mt-4 text-2xl font-bold text-slate-900">No campaign queues yet</h2>
                        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 md:text-base">
                            Campaign queues are created during the brand onboarding workflow. Once a queue is created, pending requests and accepted influencers will appear here automatically.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/brand/register"
                                className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                            >
                                Open onboarding
                            </Link>
                            <Link
                                href="/brand/discover"
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Browse creators
                            </Link>
                        </div>
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                        <Sparkles className="mx-auto h-12 w-12 text-violet-500" />
                        <h2 className="mt-4 text-2xl font-bold text-slate-900">No queues match these filters</h2>
                        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 md:text-base">
                            Try another status, category, or campaign keyword to find the queue you need.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/brand/campaign-queues"
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Reset filters
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredCampaigns.map((workflow: any) => (
                            <section key={workflow.campaign.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="max-w-3xl">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                                                {workflow.campaign.categoryLabel}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {workflow.campaign.status}
                                            </span>
                                        </div>
                                        <h2 className="mt-3 text-2xl font-bold text-slate-900">{workflow.campaign.title}</h2>
                                        <p className="mt-2 text-sm text-slate-500 md:text-base">
                                            {workflow.campaign.summary || "Initial collaboration campaign created from onboarding."}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/brand/discover?brandCampaignId=${workflow.campaign.id}`}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        Review creators
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                                    <div className="space-y-4">
                                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Budget</div>
                                                <div className="mt-2 text-lg font-semibold text-slate-900">{workflow.campaign.totalBudgetLabel}</div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Follower range</div>
                                                <div className="mt-2 text-lg font-semibold text-slate-900">{workflow.campaign.followerRangeLabel}</div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Pending</div>
                                                <div className="mt-2 text-lg font-semibold text-blue-700">{workflow.counts.pending}</div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Accepted</div>
                                                <div className="mt-2 text-lg font-semibold text-emerald-700">{workflow.counts.accepted}</div>
                                            </div>
                                        </div>

                                        <div className="rounded-[1.5rem] border border-slate-200 p-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">Request timeline</h3>
                                                    <p className="text-sm text-slate-500">Latest collaboration requests for this queue.</p>
                                                </div>
                                                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                                    {workflow.counts.sent} requests sent
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-3 max-h-[24rem] overflow-y-auto pr-1">
                                                {workflow.sentRequests.length > 0 ? workflow.sentRequests.map((request: any) => (
                                                    <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
                                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                            <div>
                                                                <div className="font-semibold text-slate-900">{request.influencer.displayName}</div>
                                                                <div className="mt-1 text-sm text-slate-500">
                                                                    {request.influencer.followersLabel} followers | {request.influencer.engagementRate.toFixed(1)}% engagement
                                                                </div>
                                                                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                                                                    {request.influencer.category}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2 md:items-end">
                                                                <span className={"inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize " + getStatusClasses(request.status)}>
                                                                    {request.status}
                                                                </span>
                                                                <div className="text-xs text-slate-400">Sent {formatSummaryDate(request.sentAt)}</div>
                                                                <div className="text-xs text-slate-400">Expires {formatSummaryDate(request.expiresAt)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                                                        No requests have been sent for this queue yet.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-[1.5rem] border border-slate-200 p-5">
                                            <h3 className="text-lg font-bold text-slate-900">Queue health</h3>
                                            <p className="mt-1 text-sm text-slate-500">Current delivery pressure and refill coverage.</p>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                                    <div className="text-xs uppercase tracking-[0.16em] text-amber-600">Expired</div>
                                                    <div className="mt-2 text-2xl font-bold text-amber-700">{workflow.counts.expired}</div>
                                                </div>
                                                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                                                    <div className="text-xs uppercase tracking-[0.16em] text-rose-600">Rejected</div>
                                                    <div className="mt-2 text-2xl font-bold text-rose-700">{workflow.counts.rejected}</div>
                                                </div>
                                                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                                                    <div className="text-xs uppercase tracking-[0.16em] text-violet-600">Slots remaining</div>
                                                    <div className="mt-2 text-2xl font-bold text-violet-700">{workflow.counts.remainingAcceptedSlots}</div>
                                                </div>
                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Last match run</div>
                                                    <div className="mt-2 text-sm font-semibold text-slate-900">{formatSummaryDate(workflow.campaign.matchingTriggeredAt)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-[1.5rem] border border-slate-200 p-5">
                                            <h3 className="text-lg font-bold text-slate-900">Accepted influencers</h3>
                                            <p className="mt-1 text-sm text-slate-500">Creators that already accepted this queue.</p>

                                            {workflow.acceptedInfluencers.length > 0 ? (
                                                <div className="mt-4 space-y-3">
                                                    {workflow.acceptedInfluencers.map((influencer: any) => (
                                                        <div key={influencer.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                                            <div className="font-semibold text-emerald-900">{influencer.displayName}</div>
                                                            <div className="mt-1 text-sm text-emerald-700">
                                                                {influencer.followersLabel} followers | {influencer.engagementRate.toFixed(1)}% engagement
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                                                    No accepted influencers yet. The queue will keep rotating through matching creators.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
