'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Calendar,
    DollarSign,
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
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
    budget: number | null;
    startDate: string | Date | null;
    endDate: string | Date | null;
    images: string[];
    createdAt: string | Date;
    _count: {
        candidates: number;
    };
    platform?: string; // Optional if we infer or add later
    niche?: string;    // Optional
}

interface CampaignListClientProps {
    campaigns: Campaign[];
}

export default function CampaignListClient({ campaigns }: CampaignListClientProps) {
    const [selectedTab, setSelectedTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

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
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <span>Dashboard</span>
                                <span>/</span>
                                <span>All Campaigns</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
                            <p className="text-gray-500 mt-1">Track, manage, and scale your influencer marketing initiatives in real-time.</p>
                        </div>
                        <Link
                            href="/brand/campaigns/new"
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Campaign
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 py-8">
                {/* Tabs & Search */}
                <div className="bg-white rounded-t-xl border border-gray-200 p-4 mb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {[
                            { id: 'ALL', label: 'All Campaigns', count: campaigns.length },
                            { id: 'ACTIVE', label: 'Active', count: campaigns.filter(c => getTabStatus(c.status) === 'ACTIVE').length },
                            { id: 'PENDING', label: 'Pending', count: campaigns.filter(c => getTabStatus(c.status) === 'PENDING').length },
                            { id: 'COMPLETED', label: 'Completed', count: campaigns.filter(c => getTabStatus(c.status) === 'COMPLETED').length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${selectedTab === tab.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label} <span className="ml-1 text-xs opacity-70">({tab.count})</span>
                            </button>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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
                                                {campaign.images && campaign.images.length > 0 ? (
                                                    <img src={campaign.images[0]} alt="" className="w-full h-full object-cover" />
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
                                                <span>• Multi-channel</span>
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
                                                    <span className="text-[10px] text-gray-400 uppercase">Candidates</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-700">
                                            {campaign.budget ? `₹${campaign.budget.toLocaleString()}` : <span className="text-gray-400 italic">Not set</span>}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Total Active Spend</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">${totalActiveSpend.toLocaleString()}</div>
                        <div className="flex items-center text-xs font-medium text-green-600">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            12.5% vs last month
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Total Reach (Est)</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{(estimatedReach / 1000000).toFixed(1)}M</div>
                        <div className="flex items-center text-xs font-medium text-green-600">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            5.2% vs last month
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Active Campaigns</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{activeCampaignsCount}</div>
                        <div className="flex items-center text-xs font-medium text-blue-600">
                            <Users className="w-3 h-3 mr-1" />
                            {campaigns.filter(c => c.status === 'DRAFT').length} pending approval
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Avg. Engagement Rate</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{avgEngagement}%</div>
                        <div className="flex items-center text-xs font-medium text-gray-500">
                            <Eye className="w-3 h-3 mr-1" />
                            Benchmark: 3.2%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
