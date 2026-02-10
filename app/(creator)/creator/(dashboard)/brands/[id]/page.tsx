'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    Link as LinkIcon,
    MapPin,
    Building2,
    Globe,
    Briefcase,
    Calendar,
    ChevronRight,
    Loader2,
    Users
} from 'lucide-react';
import { getPublicBrandById } from "@/app/(creator)/creator/actions";

export default function BrandProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const [brand, setBrand] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrand = async () => {
            if (!id) return;
            setLoading(true);
            const res = await getPublicBrandById(id);
            if (res.success) {
                setBrand(res.data);
            }
            setLoading(false);
        };
        fetchBrand();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand not found</h2>
                <p className="text-gray-500 mb-6 font-medium">The brand profile you're looking for doesn't exist or has been removed.</p>
                <Link href="/creator/messages">
                    <button className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Messages
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/creator/messages" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-teal-600" />
                        <span className="font-bold">Back to Chat</span>
                    </Link>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Brand Profile</div>
                </div>
            </header>

            {/* Profile Hero */}
            <div className="relative h-48 w-full bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600">
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="shrink-0">
                            <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-50 flex items-center justify-center relative">
                                {brand.user?.image ? (
                                    <Image src={brand.user.image} alt={brand.companyName} fill className="object-cover" />
                                ) : (
                                    <Building2 className="w-16 h-16 text-teal-600/20" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col mb-4">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{brand.companyName}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-500 font-medium">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs">
                                        <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                                        {brand.industry || "General Industry"}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs">
                                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                                        {brand.location || "India"}
                                    </div>
                                    {brand.website && (
                                        <a href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs hover:bg-teal-100 transition-colors">
                                            <Globe className="w-3.5 h-3.5" />
                                            Visit Website
                                        </a>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed max-w-4xl font-medium">
                                {brand.description || "No description provided for this brand yet. They are looking to collaborate with amazing creators to grow their presence."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column - Campaigns */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-teal-600" />
                                    Active Campaigns
                                </h3>
                                <div className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full">
                                    {brand.campaigns?.length || 0} Open
                                </div>
                            </div>

                            <div className="space-y-4">
                                {brand.campaigns && brand.campaigns.length > 0 ? (
                                    brand.campaigns.map((campaign: any) => (
                                        <div key={campaign.id} className="group p-5 bg-white border border-gray-200 rounded-xl hover:border-teal-500 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-1">{campaign.title}</h4>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <Briefcase className="w-3.5 h-3.5" />
                                                            {campaign.niche || 'Various Niches'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Expires: {new Date(campaign.endDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-black text-teal-600">₹{campaign.budget?.toLocaleString() || 'N/A'}</span>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Est. Budget</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4 font-medium">
                                                {campaign.description}
                                            </p>
                                            <Link href="/discover">
                                                <button className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group-hover:bg-teal-600">
                                                    Apply Now
                                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                                </button>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No active campaigns at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats & Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Brand Verification</h3>
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-green-800 flex items-center gap-1">
                                        Verified Brand
                                        <ChevronRight className="w-3 h-3" />
                                    </div>
                                    <div className="text-xs text-green-600 font-semibold">Active Member</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 font-medium">
                                    <span className="text-gray-500 text-sm">Joined</span>
                                    <span className="text-gray-900 text-sm font-bold">{new Date(brand.user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 font-medium">
                                    <span className="text-gray-500 text-sm">Campaigns Done</span>
                                    <span className="text-gray-900 text-sm font-bold">12+</span>
                                </div>
                                <div className="flex justify-between items-center py-2 font-medium">
                                    <span className="text-gray-500 text-sm">Response Rate</span>
                                    <span className="text-teal-600 text-sm font-bold">94%</span>
                                </div>
                            </div>
                        </div>

                        {/* Safety Tip */}
                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-amber-600" />
                                <h4 className="font-bold text-amber-800">Safety Tip</h4>
                            </div>
                            <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                                Always keep your conversation and payments within BookMyInfluencer to ensure you are protected by our Escrow system.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
