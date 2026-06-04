'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Calendar,
    IndianRupee,
    Users,
    TrendingUp,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';

interface Campaign {
    id: string;
    title: string;
    description: string | null;
    status: string;
    budget: number | null;
    startDate: string | Date | null;
    endDate: string | Date | null;
    images: string[];
    createdAt: string | Date;
    _count: {
        candidates: number;
    };
    platform?: string | null;
    niche?: string | null;
}

interface CampaignListClientProps {
    campaigns: Campaign[];
}

export default function CampaignListClient({ campaigns }: CampaignListClientProps) {
    const [selectedTab, setSelectedTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    async function handleDelete(id: string) {
        const { deleteCampaign } = await import('@/app/brand/actions');
        await deleteCampaign(id);
        // Optimistic update handled by server revalidation
    }

    // Mapping prisma status to UI tabs
    // ACTIVE -> Active
    // DRAFT -> Pending (or Draft)
    // COMPLETED -> Completed
    // ARCHIVED -> Completed
    const getTabStatus = (status: string) => {
        if (status === 'ACTIVE') return 'ACTIVE';
        if (status === 'DRAFT' || status === 'PAUSED') return 'PENDING';
        if (status === 'COMPLETED' || status === 'ARCHIVED') return 'COMPLETED';
        return 'ALL';
    };

    const filteredCampaigns = campaigns.filter(c => {
        const matchesTab = selectedTab === 'ALL' || getTabStatus(c.status) === selectedTab;
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Calculate Summary Metrics
    const totalActiveSpend = campaigns
        .filter(c => c.status === 'ACTIVE')
        .reduce((sum, c) => sum + (c.budget || 0), 0);

    const activeCampaignsCount = campaigns.filter(c => c.status === 'ACTIVE').length;
    // Mocking Reach/Engagement since we don't have aggregated analytics yet
    const estimatedReach = (activeCampaignsCount * 125000); // Mock average
    const avgEngagement = 4.8; // Mock

    const formatDate = (date: string | Date | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <span>Dashboard</span>
                                <span>/</span>
                                <span>All Campaigns</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
                            <p className="text-gray-500 mt-1">Run campaigns in one flow: Setup | Match | Select | Execute.</p>
                        </div>
                        <Link
                            href="/brand/campaigns/new"
                            className="group rounded-[24px] bg-[linear-gradient(135deg,#2563eb_0%,#4338ca_100%)] px-6 py-4 text-white shadow-xl shadow-blue-200/70 transition hover:-translate-y-0.5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-base font-black">Create New Campaign</div>
                                    <div className="text-xs font-semibold text-blue-100">Start campaign setup</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
                <div className="mb-6 relative rounded-[2.5rem] border border-slate-800 bg-slate-900 p-8 md:p-10 text-white overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]">
                    {/* Glowing Orbs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none -mt-20 -mr-20" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none -mb-20 -ml-20" />

                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 mb-4 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Execution Model</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">PM-Led Full Delivery</h2>
                            <p className="mt-3 max-w-2xl text-base text-slate-300/90 font-medium">
                                Launch new campaigns, review premium creator matches, and manage end-to-end execution from a unified interface.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[400px]">
                            <div className="relative rounded-[2rem] border border-white/5 bg-white/5 px-6 py-5 backdrop-blur-xl group hover:bg-white/10 transition-colors duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-300 transition-colors">Current Active Spend</p>
                                <p className="mt-2 text-3xl font-black text-white tracking-tight">Rs.{totalActiveSpend.toLocaleString()}</p>
                            </div>
                            <div className="relative rounded-[2rem] border border-white/5 bg-white/5 px-6 py-5 backdrop-blur-xl group hover:bg-white/10 transition-colors duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-fuchsia-300 transition-colors">Active Campaigns</p>
                                <p className="mt-2 text-3xl font-black text-white tracking-tight">{activeCampaignsCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm shadow-slate-200/50 relative z-10">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100/50 rounded-2xl">
                        {[
                            { id: 'ALL', label: 'All', count: campaigns.length },
                            { id: 'ACTIVE', label: 'Active', count: campaigns.filter(c => getTabStatus(c.status) === 'ACTIVE').length },
                            { id: 'PENDING', label: 'Pending', count: campaigns.filter(c => getTabStatus(c.status) === 'PENDING').length },
                            { id: 'COMPLETED', label: 'Completed', count: campaigns.filter(c => getTabStatus(c.status) === 'COMPLETED').length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${selectedTab === tab.id
                                    ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50 border border-slate-100'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                                    }`}
                            >
                                {tab.label} <span className={`ml-1.5 px-2 py-0.5 rounded-md text-[10px] ${selectedTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 shadow-inner"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm hover:shadow-md">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden shadow-sm mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Applicants</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Budget</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Range</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCampaigns.length > 0 ? filteredCampaigns.map(campaign => (
                                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                                                {campaign.images && campaign.images.length > 0 && !imageErrors[campaign.id] ? (
                                                    <img 
                                                        src={campaign.images[0]} 
                                                        alt="" 
                                                        className="w-full h-full object-cover" 
                                                        onError={() => setImageErrors(prev => ({ ...prev, [campaign.id]: true }))}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-[10px]">No Img</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{campaign.title}</div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                {/* Mock Niche/Platform if empty */}
                                                <span>General</span>
                                                <span>| Multi-channel</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                                                    campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {campaign.status === 'ACTIVE' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>}
                                                {campaign.status === 'COMPLETED' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>}
                                                {campaign.status.charAt(0) + campaign.status.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {campaign._count.candidates > 0 ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-gray-900">{campaign._count.candidates}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase">Matches</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-700">
                                            {campaign.budget ? `Rs.${campaign.budget.toLocaleString()}` : <span className="text-gray-400 italic">Not set</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View Button */}
                                                <Link
                                                    href={`/brand/campaigns/${campaign.id}`}
                                                    title="View Campaign"
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                                                >
                                                    <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </Link>

                                                {/* Edit Button */}
                                                <Link
                                                    href={`/brand/campaigns/${campaign.id}/edit`}
                                                    title="Edit Campaign"
                                                    className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors group"
                                                >
                                                    <Edit className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </Link>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this campaign?')) {
                                                            handleDelete(campaign.id);
                                                        }
                                                    }}
                                                    title="Delete Campaign"
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                                                >
                                                    <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No campaigns found matching your criteria.
                                            <br />
                                            <Link href="/brand/campaigns/new" className="text-blue-600 font-bold hover:underline mt-2 inline-block">
                                                Create your first campaign
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Placeholder */}
                    {filteredCampaigns.length > 0 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-bold text-gray-900">1</span> to <span className="font-bold text-gray-900">{filteredCampaigns.length}</span> of <span className="font-bold text-gray-900">{filteredCampaigns.length}</span> campaigns
                            </div>
                            <div className="flex gap-2">
                                <button disabled className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-400 text-sm disabled:opacity-50">Previous</button>
                                <button disabled className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-400 text-sm disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm shadow-slate-200/50 border border-slate-200/60 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                            <IndianRupee className="w-16 h-16 text-indigo-600" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">Total Active Spend</div>
                            <div className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Rs.{totalActiveSpend.toLocaleString()}</div>
                            <div className="flex items-center text-[13px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                                12.5% vs last month
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm shadow-slate-200/50 border border-slate-200/60 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                            <Users className="w-16 h-16 text-fuchsia-600" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">Total Reach (Est)</div>
                            <div className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{(estimatedReach / 1000000).toFixed(1)}M</div>
                            <div className="flex items-center text-[13px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                                5.2% vs last month
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm shadow-slate-200/50 border border-slate-200/60 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                            <Calendar className="w-16 h-16 text-blue-600" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">Active Campaigns</div>
                            <div className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{activeCampaignsCount}</div>
                            <div className="flex items-center text-[13px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full w-fit">
                                <Users className="w-3.5 h-3.5 mr-1.5" />
                                {campaigns.filter(c => c.status === 'DRAFT').length} pending approval
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm shadow-slate-200/50 border border-slate-200/60 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                            <Eye className="w-16 h-16 text-slate-600" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">Avg. Engagement</div>
                            <div className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{avgEngagement}%</div>
                            <div className="flex items-center text-[13px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full w-fit">
                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                Benchmark: 3.2%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



