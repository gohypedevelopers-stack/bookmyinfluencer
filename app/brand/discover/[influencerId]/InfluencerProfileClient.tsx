'use client';

import { InfluencerProfile, User } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { Loader2, X, CheckCircle2, UserPlus, Star, Instagram, Youtube, MapPin, Share2, MessageSquare, Flag, Play, LayoutGrid, Copy, FileText, ArrowRight, BookmarkCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { getBrandCampaigns, inviteInfluencer } from "../../actions";
import { toggleSavedInfluencer } from "@/app/brand/savedActions";
import { toast } from "sonner";

type FullProfile = InfluencerProfile & { user: User; bannerImage?: string | null; saved?: boolean };

export default function InfluencerProfileClient({
    profile,
    session
}: {
    profile: FullProfile & { isApproved?: boolean; price?: number; priceStory?: number; pricePost?: number; priceCollab?: number; priceType?: string };
    session: Session | null;
}) {
    // Invite Modal State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [campaigns, setCampaigns] = useState<{ id: string, title: string }[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [inviteError, setInviteError] = useState('');
    const [isSaved, setIsSaved] = useState(profile.saved || false);

    const handleToggleSave = async () => {
        const previousState = isSaved;
        setIsSaved(!previousState);

        try {
            const res = await toggleSavedInfluencer(profile.id);
            if (!res.success) throw new Error(res.error);
            toast.success(res.isSaved ? "Saved to collection" : "Removed from collection");
        } catch (error) {
            toast.error("Failed to update save status");
            setIsSaved(previousState);
        }
    };

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
        const res = await inviteInfluencer(selectedCampaign, profile.userId);
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
    // Parsing pricing - it's stored as JSON string in SQLite
    let pricing: { story?: number; reel?: number;[key: string]: any } = {};
    try {
        pricing = profile.pricing ? JSON.parse(profile.pricing as string) : {};
    } catch {
        pricing = {};
    }

    const priceTiers = [
        { label: 'Story Rate', icon: 'photo_camera', color: 'emerald', val: profile.priceStory || 0, unit: 'story' },
        { label: 'Post Rate', icon: 'payments', color: 'blue', val: profile.pricePost || profile.price || 0, unit: 'post', badge: 'Primary Rate' },
        { label: 'Collab Rate', icon: 'handshake', color: 'purple', val: profile.priceCollab || 0, unit: 'collab', badge: 'Best Value' },
    ];

    return (
        <div className="bg-gray-50 text-gray-900 antialiased min-h-screen">
            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
                                    <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
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

            <div className="flex w-full overflow-hidden">
                {/* Main Content Wrapper */}
                <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 xl:p-8 scroll-smooth" id="main-scroll">
                        <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-8 pb-20">
                            {/* Profile Hero Section */}
                            <div className="bg-white rounded-none xl:rounded-3xl border-b xl:border border-gray-100 overflow-hidden shadow-sm relative group">
                                {/* Cover Image */}
                                {/* Cover Image */}
                                <div className="h-48 md:h-64 w-full bg-cover bg-center relative" style={{
                                    backgroundImage: (profile.bannerImage && (profile.bannerImage.startsWith('/') || profile.bannerImage.startsWith('http') || profile.bannerImage.startsWith('data:')))
                                        ? `url("${profile.bannerImage}")`
                                        : 'url("https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000")'
                                }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                </div>
                                <div className="px-6 pb-6 md:px-10 md:pb-8 relative">
                                    {/* Avatar & Actions Wrapper */}
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 mb-4">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-md bg-cover bg-center" style={{ backgroundImage: `url("${profile.user.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'}")` }}></div>
                                            <div className="absolute bottom-2 right-2 bg-teal-500 text-white rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center" title="Verified Creator">
                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                            </div>
                                        </div>
                                        {/* Primary Actions */}
                                        <div className="flex gap-3 mt-2 md:mt-0 w-full md:w-auto">
                                            {session?.user?.role === 'BRAND' || session?.user?.role === 'ADMIN' ? (
                                                <>
                                                    <button
                                                        onClick={handleToggleSave}
                                                        className={`flex-1 md:flex-none h-11 px-6 ${isSaved ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'} rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2`}
                                                    >
                                                        <span className={isSaved ? "" : "material-symbols-outlined text-[20px]"}>
                                                            {isSaved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : "bookmark_border"}
                                                        </span>
                                                        {isSaved ? "Saved" : "Save"}
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                    {/* Name & Bio */}
                                    <div className="max-w-3xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{profile.user.name}</h1>
                                            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Rising Star</span>
                                        </div>
                                        <p className="text-teal-600 font-medium mb-3">{profile.instagramHandle} • {profile.location || 'Global'}</p>
                                        <p className="text-gray-800 text-sm md:text-base leading-relaxed max-w-2xl mb-5">
                                            {profile.bio || 'Lifestyle & Travel creator capturing the beauty of everyday moments. Specialized in aesthetic storytelling and authentic product integration.'}
                                        </p>
                                        {/* Social Links */}
                                        <div className="flex items-center gap-4">
                                            <a className="flex items-center gap-2 text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors" href="#">
                                                <span className="material-symbols-outlined text-sm">photo_camera</span>
                                                {profile.followers ? (profile.followers / 1000).toFixed(1) + 'K' : '0K'}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Bento Grid Layout for Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 xl:px-0">
                                {/* Left Column: Stats & Audience (2/3 width on large screens) */}
                                <div className="lg:col-span-2 flex flex-col gap-8">
                                    {/* Stats Grid */}
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-gray-900">Performance Overview</h2>
                                            <select className="bg-transparent text-sm font-semibold text-teal-600 border-none focus:ring-0 cursor-pointer">
                                                <option>Last 30 Days</option>
                                                <option>Last 3 Months</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                <div className="absolute -right-4 -top-4 bg-gray-50 w-20 h-20 rounded-full group-hover:bg-teal-500/10 transition-colors"></div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="p-1.5 bg-pink-100 text-pink-600 rounded-lg material-symbols-outlined text-lg">favorite</span>
                                                        <span className="text-sm font-medium text-gray-500">Avg. Engagement</span>
                                                    </div>
                                                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">5.8%</p>
                                                    <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold bg-green-50 w-fit px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-sm">trending_up</span>
                                                        <span>0.5% vs last month</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                <div className="absolute -right-4 -top-4 bg-gray-50 w-20 h-20 rounded-full group-hover:bg-teal-500/10 transition-colors"></div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg material-symbols-outlined text-lg">groups</span>
                                                        <span className="text-sm font-medium text-gray-500">Audience Reach</span>
                                                    </div>
                                                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{(profile.followers || 0 / 1000).toFixed(1)}k</p>
                                                    <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold bg-green-50 w-fit px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-sm">trending_up</span>
                                                        <span>12% growth</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </section>
                                    {/* Gallery / Portfolio */}
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-gray-900">Recent Collaborations</h2>
                                            <a className="text-teal-600 text-sm font-bold hover:underline" href="#">View All</a>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* Image 1 */}
                                            <div className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-sm">
                                                <img alt="Collaboration 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="text-white text-center">
                                                        <p className="font-bold text-lg">Zara Fall</p>
                                                        <p className="text-xs uppercase tracking-wider">Campaign</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Image 2 */}
                                            <div className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-sm">
                                                <img alt="Collaboration 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1493655161922-ef98929de9d8?auto=format&fit=crop&q=80&w=400" />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                                {/* Right Column: Pricing (1/3 width) */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 px-1">Service Pricing</h2>
                                        {priceTiers.map((tier) => (
                                            <div key={tier.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all hover:border-teal-500/30 group relative overflow-hidden">
                                                {tier.badge && (
                                                    <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">{tier.badge}</div>
                                                )}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`bg-${tier.color}-50 text-${tier.color}-700 p-2 rounded-lg`}>
                                                        <span className="material-symbols-outlined">{tier.icon}</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{tier.label}</h3>
                                                <div className="flex items-baseline gap-1 mb-4">
                                                    <span className="text-3xl font-extrabold text-teal-600 tracking-widest">
                                                        {tier.val > 0
                                                            ? `₹${'*'.repeat(tier.val.toString().length)}`
                                                            : <span className="text-gray-400 text-xl tracking-normal">Not set</span>
                                                        }
                                                    </span>
                                                    {tier.val > 0 && (
                                                        <span className="text-gray-500 text-sm">/ {tier.unit}</span>
                                                    )}
                                                </div>
                                                <button className="w-full py-2.5 rounded-lg border-2 border-gray-100 text-gray-900 font-bold text-sm hover:border-teal-600 hover:text-teal-600 transition-colors">
                                                    Add to Campaign
                                                </button>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
}
