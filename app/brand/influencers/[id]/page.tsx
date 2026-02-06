'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Instagram, MapPin, TrendingUp, Users, Eye, Heart, MessageCircle, Bookmark, Share2, CheckCircle2, Star, Calendar, Youtube, Link as LinkIcon, Loader2, X, ShieldCheck } from 'lucide-react';
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
                            <Link href={`/brand/checkout/${id}`}>
                                <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-indigo-200">
                                    <ShieldCheck className="w-4 h-4" />
                                    Hire & Pay Escrow
                                </button>
                            </Link>
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

                    {/* Tabs */}
                    <div className="flex items-center gap-6 mt-8 border-b border-gray-200">
                        {[
                            { id: 'overview', label: 'Performance Overview' },
                            { id: 'portfolio', label: 'Service Pricing' },
                            { id: 'pricing', label: 'Previous Work' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-3 font-medium transition-colors relative ${activeTab === tab.id
                                    ? 'text-teal-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 to-teal-500" />
                                )}
                            </button>
                        ))}
                        <div className="ml-auto">
                            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                                <option>Last Year</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid lg:grid-cols-3 gap-6 mt-6 pb-12">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'overview' && (
                            <>
                                {/* Performance Metrics */}
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="font-bold text-gray-900 mb-6 text-lg">Performance Overview</h3>

                                    <div className="grid sm:grid-cols-3 gap-6">
                                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Heart className="w-5 h-5 text-pink-600" />
                                                <span className="text-sm font-semibold text-pink-900">Avg Engagement</span>
                                            </div>
                                            <div className="text-3xl font-bold text-pink-600">5.8%</div>
                                            <div className="text-xs text-pink-700 mt-1 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>0.3% vs last month</span>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-5 h-5 text-blue-600" />
                                                <span className="text-sm font-semibold text-blue-900">Audience Reach</span>
                                            </div>
                                            <div className="text-3xl font-bold text-blue-600">1.2M</div>
                                            <div className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>12% growth</span>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-5 h-5 text-purple-600" />
                                                <span className="text-sm font-semibold text-purple-900">Top Audience Locations</span>
                                            </div>
                                            <div className="text-lg font-bold text-purple-600 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">USA</span>
                                                    <span className="text-xs">42%</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">UK</span>
                                                    <span className="text-xs">28%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Audience Demographics */}
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Audience Demographics</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Female</span>
                                                <span className="font-semibold">72%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-pink-500 to-pink-600 w-[72%]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Age 18-24</span>
                                                <span className="font-semibold">45%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-[45%]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Age 25-34</span>
                                                <span className="font-semibold">38%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-[38%]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'portfolio' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="font-bold text-gray-900 mb-6 text-lg">Service Packages</h3>

                                <div className="space-y-4">
                                    {creator.pricing && Array.isArray(creator.pricing) && creator.pricing.length > 0 ? (
                                        creator.pricing.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-start justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-teal-500 transition-colors">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Instagram className="w-5 h-5 text-pink-500" />
                                                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{item.description || "No description provided."}</p>
                                                    <ul className="space-y-1">
                                                        {/* Feature list placeholder or parsed content */}
                                                        <li className="text-sm text-gray-600 flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-teal-500" />
                                                            {item.deliveryTime || "Standard Delivery"}
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900">₹{item.price}</div>
                                                    <button className="mt-2 text-xs bg-gray-900 text-white px-3 py-1 rounded-md hover:bg-gray-700">
                                                        Book
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            No explicit pricing packages listed. Contact for rates.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">Profile Views</span>
                                    <span className="font-bold text-gray-900">12.5k</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        Engagement
                                    </span>
                                    <span className="font-bold text-green-600">4.2%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">Followers</span>
                                    <span className="font-bold text-gray-900">85.2k</span>
                                </div>
                            </div>
                        </div>



                        {/* Suggested */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Suggested</h3>
                            <ul className="space-y-3">
                                {['Update Media Kit', 'New Campaign Match', 'Campaign Invite'].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 bg-teal-500 rounded-full" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
