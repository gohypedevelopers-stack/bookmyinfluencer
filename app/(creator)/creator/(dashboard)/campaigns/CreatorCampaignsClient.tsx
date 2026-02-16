'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Filter,
    Plus,
    FileText,
    MessageSquare as ChatIcon,
    MoreHorizontal,
    Compass,
    DollarSign,
    Images as ImagesIcon,
    CheckCircle2,
    Search,
    ShieldCheck,
    Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import CampaignDetailsModal from './CampaignDetailsModal';
import InvitationDetailsModal from './InvitationDetailsModal';
import SubmitDeliverableModal from './SubmitDeliverableModal';
import { submitDeliverable } from '../../actions';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface CreatorCampaignsClientProps {
    candidates: any[];
    activeCampaigns: any[];
    isVerified: boolean;
    followerCount: number;
}

export default function CreatorCampaignsClient({ candidates, activeCampaigns, isVerified, followerCount }: CreatorCampaignsClientProps) {
    const router = useRouter();

    // Default to DISCOVER if no personal campaigns, otherwise ONGOING
    const [selectedTab, setSelectedTab] = useState<'ONGOING' | 'INVITATIONS' | 'COMPLETED' | 'DISCOVER'>(
        candidates.length > 0 ? 'ONGOING' : 'DISCOVER'
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
    const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);

    // Submission Modal State
    const [submissionCandidate, setSubmissionCandidate] = useState<any>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        minBudget: '',
        niche: 'ALL',
        paymentType: 'ALL'
    });

    // Handler for opening chat - navigate to messages page with the thread
    const handleOpenChat = (campaign: any) => {
        // Navigate to messages page - the backend will handle thread creation if needed
        router.push(`/creator/messages?campaign=${campaign.id}`);
        toast.success('Opening team chat...');
    };

    // Handler for marking campaign as complete
    const handleMarkComplete = (campaign: any) => {
        toast.info('Coming soon: Mark as complete feature');
        // TODO: Implement mark as complete functionality
    };

    // Handler for reporting issues
    const handleReportIssue = (campaign: any) => {
        toast.info('Coming soon: Report issue feature');
        // TODO: Implement report issue functionality
    };

    const handleViewDetails = (campaign: any) => {
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedCampaign(null), 300); // clear after animation
    };

    const handleOpenSubmitModal = (candidate: any) => {
        setSubmissionCandidate(candidate);
        setIsSubmitModalOpen(true);
    };

    const handleSubmitDeliverable = async (candidateId: string, url: string, notes: string) => {
        return await submitDeliverable(candidateId, url, notes);
    };

    // Filter Logic for My Campaigns
    const ongoing = candidates.filter(c => ['HIRED', 'CONTENT_REVIEW'].includes(c.status));
    const invitations = candidates.filter(c => ['CONTACTED', 'IN_NEGOTIATION'].includes(c.status));
    const completed = candidates.filter(c => ['COMPLETED', 'REJECTED', 'ARCHIVED'].includes(c.status));

    // Filter Logic for Discover
    // Exclude campaigns I'm already a candidate in
    const myCampaignIds = new Set(candidates.map(c => c.campaignId));
    const discoverable = activeCampaigns.filter(c => !myCampaignIds.has(c.id));

    // Helper: Get Progress
    const getProgress = (candidate: any) => {
        if (!candidate.contract?.deliverables?.length) return 0;
        const total = candidate.contract.deliverables.length;
        const approved = candidate.contract.deliverables.filter((d: any) => d.status === 'APPROVED').length;
        return Math.round((approved / total) * 100);
    }

    // Helper: Get Next Deliverable
    const getNextDeliverable = (candidate: any) => {
        if (!candidate.contract?.deliverables) return null;
        return candidate.contract.deliverables.find((d: any) => d.status === 'PENDING') || null;
    }

    // Filter based on Tab
    const getDisplayData = () => {
        switch (selectedTab) {
            case 'ONGOING': return ongoing;
            case 'INVITATIONS': return invitations;
            case 'COMPLETED': return completed;
            case 'DISCOVER': return discoverable;
            default: return ongoing;
        }
    };

    const displayData = getDisplayData();
    const filteredData = displayData.filter(item => {
        // Normalize campaign object
        const campaign = selectedTab === 'DISCOVER' ? item : item.campaign;

        // Search Filter
        const searchTarget = selectedTab === 'DISCOVER' ? item : item.campaign;
        const searchMatch = searchTarget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            searchTarget.brand.companyName.toLowerCase().includes(searchQuery.toLowerCase());

        // Budget Filter
        const budgetVal = Number(filters.minBudget);
        const budgetMatch = !filters.minBudget || (campaign.budget && campaign.budget >= budgetVal);

        // Niche Filter
        const nicheMatch = filters.niche === 'ALL' || (campaign.niche && campaign.niche.toLowerCase().includes(filters.niche.toLowerCase()));

        // Payment Type Filter
        const typeMatch = filters.paymentType === 'ALL' || (campaign.paymentType && campaign.paymentType === filters.paymentType);

        return searchMatch && budgetMatch && nicheMatch && typeMatch;
    });

    const resetFilters = () => {
        setFilters({
            minBudget: '',
            niche: 'ALL',
            paymentType: 'ALL'
        });
    };

    return (
        <div className="h-full overflow-y-auto p-6 md:p-8 bg-gray-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Campaigns</h1>
                    <p className="text-gray-500 font-medium">Manage collaborations and find new brand deals.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm transition-all"
                        />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={`bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 gap-2 h-11 px-5 rounded-xl font-semibold transition-all shadow-sm ${filters.minBudget || filters.niche !== 'ALL' || filters.paymentType !== 'ALL' ? 'border-indigo-500 text-indigo-600 ring-2 ring-indigo-100' : ''}`}>
                                <Filter className="w-4 h-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-5 rounded-2xl shadow-xl border-gray-100" align="end">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-gray-900">Filters</h4>
                                    <button onClick={resetFilters} className="text-xs text-indigo-600 font-bold hover:underline">
                                        Reset
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Min Budget (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 5000"
                                        value={filters.minBudget}
                                        onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                                        className="h-9 rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Niche</Label>
                                    <Select
                                        value={filters.niche}
                                        onValueChange={(val) => setFilters({ ...filters, niche: val })}
                                    >
                                        <SelectTrigger className="h-9 rounded-lg">
                                            <SelectValue placeholder="Select Niche" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Niches</SelectItem>
                                            <SelectItem value="tech">Tech & Gaming</SelectItem>
                                            <SelectItem value="fashion">Fashion & Style</SelectItem>
                                            <SelectItem value="beauty">Beauty & Makeup</SelectItem>
                                            <SelectItem value="travel">Travel & Lifestyle</SelectItem>
                                            <SelectItem value="education">Education & Career</SelectItem>
                                            <SelectItem value="fitness">Health & Fitness</SelectItem>
                                            <SelectItem value="business">Business & Finance</SelectItem>
                                            <SelectItem value="food">Food & Cooking</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Payment Type</Label>
                                    <Select
                                        value={filters.paymentType}
                                        onValueChange={(val) => setFilters({ ...filters, paymentType: val })}
                                    >
                                        <SelectTrigger className="h-9 rounded-lg">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Types</SelectItem>
                                            <SelectItem value="FIXED">Fixed Price</SelectItem>
                                            <SelectItem value="NEGOTIABLE">Negotiable</SelectItem>
                                            <SelectItem value="BARTER">Barter / Gift</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8 overflow-x-auto">
                <div className="flex gap-8 min-w-max">
                    <button
                        onClick={() => setSelectedTab('DISCOVER')}
                        className={`pb-4 border-b-2 font-bold text-sm tracking-wide transition-all flex items-center gap-2 ${selectedTab === 'DISCOVER' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <Compass className="w-4 h-4" />
                        Explore ({discoverable.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('ONGOING')}
                        className={`pb-4 border-b-2 font-bold text-sm tracking-wide transition-all ${selectedTab === 'ONGOING' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        Ongoing ({ongoing.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('INVITATIONS')}
                        className={`pb-4 border-b-2 font-bold text-sm tracking-wide transition-all ${selectedTab === 'INVITATIONS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        Invitations ({invitations.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('COMPLETED')}
                        className={`pb-4 border-b-2 font-bold text-sm tracking-wide transition-all ${selectedTab === 'COMPLETED' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        Completed ({completed.length})
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-16">

                {selectedTab === 'DISCOVER' && (
                    filteredData.length > 0 ? (
                        filteredData.map((campaign: any) => (
                            <Card key={campaign.id} className="rounded-3xl border-gray-100 shadow-sm p-6 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col relative overflow-hidden">
                                {!isVerified || followerCount < 1000 ? (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <ShieldCheck className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">Check Eligibility</h3>
                                        <p className={`text-xs mb-4 ${!isVerified ? 'text-gray-500' : 'text-red-600 font-bold'}`}>
                                            {!isVerified
                                                ? "Complete your profile verification to access this campaign."
                                                : "You need 1000+ followers to be eligible for collaboration."
                                            }
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleViewDetails(campaign);
                                            }}
                                            className="rounded-xl font-bold bg-gray-900 text-white hover:bg-black"
                                        >
                                            See Campaigns
                                        </Button>
                                    </div>
                                ) : null}

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
                                        {campaign.brand.user?.image ? (
                                            <img src={campaign.brand.user.image} alt={campaign.brand.companyName} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            campaign.brand.companyName.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{campaign.brand.companyName}</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">{campaign.niche || 'General'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    <h4 className="font-bold text-gray-800 line-clamp-2 min-h-[3rem]">{campaign.title}</h4>

                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                            <DollarSign className="w-3.5 h-3.5 text-green-600" />
                                            {campaign.budget ? `₹${campaign.budget.toLocaleString()}` : 'Negotiable'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                                            {campaign.paymentType || 'Fixed'}
                                        </div>
                                    </div>

                                    {campaign.description && (
                                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                            {campaign.description}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    onClick={() => handleViewDetails(campaign)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 rounded-xl font-bold tracking-wide transition-colors mt-auto shadow-md shadow-indigo-200"
                                >
                                    View Details
                                </Button>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border border-gray-100 border-dashed">
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                                    <Compass className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">No New Opportunities</h3>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mb-4">Check back later for new brand campaigns.</p>
                            </div>
                        </div>
                    )
                )}

                {(selectedTab === 'ONGOING' || selectedTab === 'COMPLETED') && (
                    filteredData.length > 0 ? (
                        filteredData.map((item: any) => {
                            const progress = getProgress(item);
                            const nextItem = getNextDeliverable(item);
                            return (
                                <Card key={item.id} className="rounded-[2rem] border-gray-100 shadow-sm hover:shadow-md transition-all p-8 bg-white group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-inner flex-shrink-0">
                                                    {item.campaign.brand.user?.image ? (
                                                        <img src={item.campaign.brand.user.image} alt={item.campaign.brand.companyName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-lg">{item.campaign.brand.companyName.substring(0, 2).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 mb-0.5 line-clamp-1">{item.campaign.brand.companyName}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500 text-xs font-medium line-clamp-1">{item.campaign.title}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${item.status === 'HIRED' || item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                <span>Campaign Progress</span>
                                                <span className="text-gray-900">{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {nextItem ? (
                                            <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-4 flex items-center justify-between mb-6 group-hover:bg-orange-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-orange-500 shadow-sm ring-1 ring-orange-100">
                                                        <FileText className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wide mb-0.5">NEXT DELIVERABLE</p>
                                                        <p className="font-bold text-xs text-gray-900 truncate">{nextItem.title}</p>
                                                    </div>
                                                </div>
                                                {nextItem.dueDate && (
                                                    <span className="text-orange-600 text-[10px] font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-orange-100 whitespace-nowrap">
                                                        {new Date(nextItem.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-green-50/80 border border-green-100 rounded-2xl p-4 flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-green-500 shadow-sm">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <p className="text-xs font-bold text-green-700">All deliverables completed!</p>
                                            </div>
                                        )}

                                        {/* Submit Action */}
                                        {nextItem && item.status !== 'COMPLETED' && (
                                            <Button
                                                className="w-full mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md"
                                                onClick={() => handleOpenSubmitModal(item)}
                                            >
                                                Submit Deliverable
                                                <ImagesIcon className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex gap-3 mt-auto">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-gray-200 text-gray-700 h-10 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors text-xs"
                                            onClick={() => handleOpenChat(item)}
                                        >
                                            <ChatIcon className="w-3.5 h-3.5 mr-2" />
                                            Team Chat
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-10 border-gray-200 text-gray-400 h-10 rounded-xl hover:bg-gray-50 hover:text-gray-900 px-0 transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleMarkComplete(item)}>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Mark as Complete
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleReportIssue(item)} className="text-red-600">
                                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                                    Report Issue
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </Card>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border border-gray-100 border-dashed">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <ImagesIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No {selectedTab === 'ONGOING' ? 'Active' : 'Completed'} Campaigns</h3>
                            <p className="text-gray-500 max-w-sm mb-6 text-sm">
                                {selectedTab === 'ONGOING'
                                    ? "You don't have any ongoing campaigns yet. Start by applying to campaigns in the Explore tab."
                                    : "You haven't completed any campaigns yet."}
                            </p>
                            <Button variant="outline" onClick={() => setSelectedTab('DISCOVER')}>Discover Campaigns</Button>
                        </div>
                    )
                )}

                {selectedTab === 'INVITATIONS' && (
                    filteredData.length > 0 ? (
                        filteredData.map((item: any) => (
                            <Card key={item.id} className="rounded-3xl border-gray-100 shadow-sm p-6 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
                                        {item.campaign.brand.user?.image ? (
                                            <img src={item.campaign.brand.user.image} alt={item.campaign.brand.companyName} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            item.campaign.brand.companyName.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{item.campaign.brand.companyName}</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">{item.campaign.niche || 'General'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8 flex-1">
                                    <div className="flex items-center gap-3 text-sm text-gray-700 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <DollarSign className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        {item.offer ? `₹${item.offer.amount.toLocaleString()}` : (item.campaign.budget ? `₹${item.campaign.budget.toLocaleString()}` : 'Negotiable')}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-700 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <Compass className="w-3.5 h-3.5 text-blue-600" />
                                        </div>
                                        <span className="line-clamp-1">{item.campaign.title}</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 h-11 rounded-xl font-bold tracking-wide transition-colors mt-auto"
                                    onClick={() => {
                                        setSelectedInvitation(item);
                                        setIsInvitationModalOpen(true);
                                    }}
                                >
                                    Review Brief
                                </Button>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border border-gray-100 border-dashed">
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                                    <Compass className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">No Pending Invitations</h3>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mb-4">Browse hundreds of active brand opportunities in the marketplace</p>
                                <Button variant="outline" onClick={() => setSelectedTab('DISCOVER')}>Discover More</Button>
                            </div>
                        </div>
                    )
                )}

                {/* Discover More Card - Always show at end if Invitations tab and has data */}
                {selectedTab === 'INVITATIONS' && filteredData.length > 0 && (
                    <Link href="/discover" className="rounded-3xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group h-full min-h-[300px]">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-5 group-hover:bg-white group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                            <Compass className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-indigo-700 transition-colors">Discover More</h3>
                        <p className="text-xs text-gray-500 leading-relaxed px-4 font-medium">Browse hundreds of active brand opportunities in the marketplace</p>
                    </Link>
                )}
            </div>

            <CampaignDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                campaign={selectedCampaign}
                isVerified={isVerified}
                followerCount={followerCount}
            />

            <InvitationDetailsModal
                isOpen={isInvitationModalOpen}
                onClose={() => setIsInvitationModalOpen(false)}
                invitation={selectedInvitation}
            />

            <SubmitDeliverableModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                candidate={submissionCandidate}
                onSubmit={handleSubmitDeliverable}
            />
        </div>
    )
}
