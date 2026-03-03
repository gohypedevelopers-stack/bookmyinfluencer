'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Instagram, MapPin, TrendingUp, Users, Eye, Heart, MessageCircle, Bookmark, Share2, CheckCircle2, Star, Calendar, Youtube, Link as LinkIcon, Loader2, X } from 'lucide-react';
import { getPublicCreatorById, getBrandCampaigns, inviteInfluencer } from '../../actions';

export default function InfluencerProfile() {
    const params = useParams();
    const id = params.id as string;
    const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'pricing'>('overview');
    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Invite Modal State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [campaigns, setCampaigns] = useState<{ id: string, title: string }[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [inviteError, setInviteError] = useState('');

    useEffect(() => {
        const fetchCreator = async () => {
            if (!id) return;
            setLoading(true);
            const res = await getPublicCreatorById(id);
            if (res.success) {
                setCreator(res.data);
            }
            setLoading(false);
        };
        fetchCreator();
    }, [id]);

    const handleOpenInvite = async () => {
        setShowInviteModal(true);
        // Fetch campaigns
        const res = await getBrandCampaigns();
        if (res.success && res.campaigns) {
            setCampaigns(res.campaigns);
            if (res.campaigns.length > 0) setSelectedCampaign(res.campaigns[0].id);
        }
    };

    const handleInvite = async () => {
        if (!selectedCampaign) return;
        setInviteStatus('loading');
        const res = await inviteInfluencer(selectedCampaign, creator.id);
        if (res.success) {
            setInviteStatus('success');
            setTimeout(() => {
                setShowInviteModal(false);
                setInviteStatus('idle');
            }, 2000);
        } else {
            setInviteStatus('error');
            setInviteError(res.error || 'Failed to invite');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (!creator) {
        return <div className="min-h-screen flex items-center justify-center">Creator not found</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Header / Nav Placeholder */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/brand/discover" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-bold">Back</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <div className="text-sm font-bold text-gray-900">Brand Discovery</div>
                            <span className="font-semibold text-xs text-gray-500">Back to Discovery</span>
                        </div>
                        <div className="ml-auto flex items-center gap-3">

                            <button
                                onClick={handleOpenInvite}
                                className="px-5 py-2 bg-white border-2 border-teal-600 text-teal-700 rounded-lg font-bold hover:bg-teal-50 transition-all"
                            >
                                Request Collaboration
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Invite to Campaign</h3>
                            <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {inviteStatus === 'success' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Invitation Sent!</h4>
                                <p className="text-gray-500">This creator has been added to your campaign candidates.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Campaign</label>
                                    {campaigns.length > 0 ? (
                                        <select
                                            value={selectedCampaign}
                                            onChange={(e) => setSelectedCampaign(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                                        >
                                            {campaigns.map(c => (
                                                <option key={c.id} value={c.id}>{c.title}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                                            You have no active campaigns. <Link href="/brand/campaigns/new" className="underline font-bold">Create one first.</Link>
                                        </div>
                                    )}
                                </div>

                                {inviteStatus === 'error' && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                        {inviteError}
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => setShowInviteModal(false)}
                                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleInvite}
                                        disabled={campaigns.length === 0 || inviteStatus === 'loading'}
                                        className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {inviteStatus === 'loading' ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : 'Send Invite'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cover & Profile */}
            <div className="relative h-64 w-full">
                {creator.bannerImage ? (
                    <Image
                        src={creator.bannerImage}
                        alt="Cover"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-200 via-pink-100 to-orange-100" />
                )}
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-start gap-6">
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 relative">
                                {creator.profileImage ? (
                                    <Image src={creator.profileImage} alt={creator.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-600 font-bold text-3xl">
                                        {creator.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {creator.verificationStatus === 'VERIFIED' && (
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
                                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full uppercase">
                                            {creator.niche}
                                        </span>
                                    </div>
                                    <p className="text-teal-600 text-lg mb-2">
                                        {creator.handle} • {creator.location}
                                    </p>
                                    <p className="text-gray-600 leading-relaxed max-w-3xl whitespace-pre-wrap">
                                        {creator.bio || "No bio available."}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 border border-gray-300 rounded-lg active:bg-gray-50 transition">
                                        <Bookmark className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-8 mt-6">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <span className="font-bold text-gray-900">{creator.stats.followers > 1000 ? (creator.stats.followers / 1000).toFixed(1) + 'K' : creator.stats.followers}</span>
                                    <span className="text-gray-500 text-sm">Followers</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                    <span className="font-bold text-gray-900">{creator.stats.engagementRate}%</span>
                                    <span className="text-gray-500 text-sm">Engagement</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Sticky Tab Bar */}
            <div className="sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Performance Overview' },
                            { id: 'portfolio', label: 'Service Pricing' },
                            { id: 'pricing', label: 'Previous Work' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-5 py-3.5 font-semibold text-sm whitespace-nowrap transition-colors relative ${activeTab === tab.id
                                    ? 'text-teal-600'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>      {/* Content */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-3 gap-6 mt-6 pb-12">
                    {/* Main Column */}
                    {/* === MAIN COLUMN === */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Performance Overview — always visible */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-gray-900 text-lg">Performance Overview</h3>
                                <select className="text-xs font-semibold text-teal-600 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                    <option>Last 30 Days</option>
                                    <option>Last 90 Days</option>
                                    <option>Last Year</option>
                                </select>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 bg-gray-50 w-20 h-20 rounded-full group-hover:bg-pink-50 transition-colors" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-pink-100 text-pink-600 rounded-lg">
                                                <Heart className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-500">Avg Engagement</span>
                                        </div>
                                        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">5.8%</p>
                                        <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold bg-green-50 w-fit px-2 py-0.5 rounded-full">
                                            <TrendingUp className="w-3 h-3" />
                                            <span>0.3% vs last month</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 bg-gray-50 w-20 h-20 rounded-full group-hover:bg-blue-50 transition-colors" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-500">Audience Reach</span>
                                        </div>
                                        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                            {creator.stats?.followers > 0
                                                ? (creator.stats.followers >= 1_000_000
                                                    ? (creator.stats.followers / 1_000_000).toFixed(1) + 'M'
                                                    : (creator.stats.followers / 1_000).toFixed(1) + 'k')
                                                : '—'}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold bg-green-50 w-fit px-2 py-0.5 rounded-full">
                                            <TrendingUp className="w-3 h-3" />
                                            <span>12% growth</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Collaborations */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-gray-900 text-lg">Recent Collaborations</h3>
                                <button className="text-teal-600 text-sm font-bold hover:underline">View All</button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400', label: 'Zara Fall' },
                                    { src: 'https://images.unsplash.com/photo-1493655161922-ef98929de9d8?auto=format&fit=crop&q=80&w=400', label: 'Brand Collab' },
                                    { src: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=400', label: 'H&M Summer' },
                                    { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', label: 'Nike Launch' },
                                ].map((item) => (
                                    <div key={item.label} className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-sm">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.src}
                                            alt={item.label}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                            <div className="text-white">
                                                <p className="font-bold text-sm">{item.label}</p>
                                                <p className="text-[10px] uppercase tracking-wider opacity-80">Campaign</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Audience Demographics */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-5">Audience Demographics</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Female', pct: 72, color: 'from-pink-400 to-pink-600' },
                                    { label: 'Age 18-24', pct: 45, color: 'from-blue-400 to-blue-600' },
                                    { label: 'Age 25-34', pct: 38, color: 'from-purple-400 to-purple-600' },
                                ].map((d) => (
                                    <div key={d.label}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-gray-600">{d.label}</span>
                                            <span className="font-semibold text-gray-900">{d.pct}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full bg-gradient-to-r ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* === SIDEBAR: Service Pricing (always visible) === */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 text-lg px-1">Service Pricing</h3>
                        {[
                            {
                                label: 'Story Rate',
                                icon: '📷',
                                val: creator.priceStory || 0,
                                unit: 'story',
                                badge: null as string | null,
                            },
                            {
                                label: 'Post Rate',
                                icon: '🖼️',
                                val: creator.pricePost || creator.price || 0,
                                unit: 'post',
                                badge: 'Primary Rate' as string | null,
                            },
                            {
                                label: 'Collab Rate',
                                icon: '🤝',
                                val: creator.priceCollab || 0,
                                unit: 'collab',
                                badge: 'Best Value' as string | null,
                            },
                        ].map((tier) => (
                            <div key={tier.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-teal-400/40 relative overflow-hidden">
                                {tier.badge && (
                                    <div className={`absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl ${tier.badge === 'Primary Rate' ? 'bg-teal-600' : 'bg-emerald-600'}`}>
                                        {tier.badge}
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xl">{tier.icon}</span>
                                    <h4 className="text-base font-bold text-gray-900">{tier.label}</h4>
                                </div>
                                <div className="mb-4">
                                    {tier.val > 0 ? (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-extrabold text-teal-600 tracking-widest">
                                                {'★'.repeat(Math.min(5, Math.ceil(tier.val / 1000)))}
                                            </span>
                                            <span className="text-gray-400 text-sm">/ {tier.unit}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 font-medium text-sm">Not set</span>
                                    )}
                                </div>
                                <button
                                    onClick={handleOpenInvite}
                                    className="w-full py-2 rounded-lg border-2 border-gray-100 text-gray-700 font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-colors"
                                >
                                    Add to Campaign
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
