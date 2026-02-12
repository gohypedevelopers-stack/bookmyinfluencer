'use client';

import { InfluencerProfile, User } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";

type FullProfile = InfluencerProfile & {
    user: User;
    kycStatus?: string;
    bannerImage?: string | null;
};

const PRICE_LABELS: Record<string, { label: string, icon: string, color: string }> = {
    instaStory: { label: 'Instagram Story', icon: 'amp_stories', color: 'blue' },
    instaReel: { label: 'Instagram Reel', icon: 'movie', color: 'purple' },
    instaPost: { label: 'Instagram Post', icon: 'photo_library', color: 'pink' },
    youtubeShorts: { label: 'YouTube Shorts', icon: 'play_circle', color: 'red' },
    youtubeVideo: { label: 'YouTube Video', icon: 'video_library', color: 'red' },
    youtubeCommunityPost: { label: 'YouTube Community Post', icon: 'forum', color: 'orange' },
};

const COLOR_VARIANTS: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    pink: 'bg-pink-50 text-pink-700',
    red: 'bg-red-50 text-red-700',
    orange: 'bg-orange-50 text-orange-700',
};

export default function InfluencerProfileClient({
    profile,
    session
}: {
    profile: FullProfile;
    session: Session | null;
}) {
    // Parsing pricing - it's stored as JSON string
    let pricingData: Record<string, any> = {};
    try {
        pricingData = profile.pricing ? JSON.parse(profile.pricing as string) : {};
    } catch {
        pricingData = {};
    }

    // Filter out metadata and focus on service keys
    const services = Object.entries(pricingData)
        .filter(([key, value]) => PRICE_LABELS[key] && value && typeof value === 'string' && value !== '0')
        .map(([key, value]) => ({
            key,
            id: key,
            price: value,
            ...PRICE_LABELS[key]
        }));

    const followers = profile.followers || 0;
    const engagement = profile.engagementRate ? `${profile.engagementRate}%` : '5.8%'; // Fallback if null

    return (
        <div className="bg-gray-50 text-gray-900 antialiased min-h-screen">
            <div className="flex w-full overflow-hidden">
                <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 xl:p-8 scroll-smooth" id="main-scroll">
                        <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-8 pb-20">

                            {/* Profile Hero Section */}
                            <div className="bg-white rounded-none xl:rounded-3xl border-b xl:border border-gray-100 overflow-hidden shadow-sm relative group">
                                <div className="h-48 md:h-64 w-full bg-cover bg-center relative" style={{ backgroundImage: `url("${profile.bannerImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000'}")` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                </div>
                                <div className="px-6 pb-6 md:px-10 md:pb-8 relative">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 mb-4">
                                        <div className="relative">
                                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-md bg-cover bg-center" style={{ backgroundImage: `url("${profile.user.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'}")` }}></div>
                                            <div className="absolute bottom-2 right-2 bg-teal-500 text-white rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center" title="Verified Creator">
                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-2 md:mt-0 w-full md:w-auto">
                                            {session?.user?.role === 'BRAND' || session?.user?.role === 'ADMIN' ? (
                                                <>
                                                    <button className="flex-1 md:flex-none h-11 px-6 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
                                                        Save
                                                    </button>
                                                    <Link href={`/brand/checkout/${profile.id}`} className="flex-1 md:flex-none h-11 px-6 bg-teal-600 text-white hover:bg-teal-700 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                        Hire Now
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link href={`/login?returnUrl=/brand/discover/${profile.id}&action=hire`} className="flex-1 md:flex-none h-11 px-6 bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2">
                                                    <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                                                    Request Promotion
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="max-w-3xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{profile.user.name}</h1>
                                            {profile.kycStatus === 'APPROVED' && <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Verified</span>}
                                        </div>
                                        <p className="text-teal-600 font-medium mb-3">@{profile.instagramHandle || 'creator'} • {profile.location || 'India'}</p>
                                        <p className="text-gray-800 text-sm md:text-base leading-relaxed max-w-2xl mb-5">
                                            {profile.bio || 'Lifestyle & Digital Creator passionate about storytelling and authentic content creation.'}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
                                                <span className="material-symbols-outlined text-sm">groups</span>
                                                {followers >= 1000 ? (followers / 1000).toFixed(1) + 'K' : followers} Followers
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
                                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                                {engagement} Engagement
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 xl:px-0">
                                <div className="lg:col-span-2 flex flex-col gap-8">

                                    {/* Stats Grid */}
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-gray-900">Performance Overview</h2>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="p-1.5 bg-pink-100 text-pink-600 rounded-lg material-symbols-outlined text-lg">favorite</span>
                                                    <span className="text-sm font-medium text-gray-500">Avg. Engagement</span>
                                                </div>
                                                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{engagement}</p>
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg material-symbols-outlined text-lg">groups</span>
                                                    <span className="text-sm font-medium text-gray-500">Audience Reach</span>
                                                </div>
                                                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                                    {followers >= 1000 ? (followers / 1000).toFixed(1) + 'k' : followers}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Portfolio / Gallery */}
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-gray-900">Recent Collaborations</h2>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
                                                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
                                                <img src="https://images.unsplash.com/photo-1493655161922-ef98929de9d8?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
                                                <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Dynamic Pricing */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 px-1">Service Pricing</h2>

                                        {services.length > 0 ? (
                                            services.map((service) => (
                                                <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all hover:border-teal-500/30 group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className={`${COLOR_VARIANTS[service.color] || 'bg-gray-50 text-gray-700'} p-2 rounded-lg`}>
                                                            <span className="material-symbols-outlined">{service.icon}</span>
                                                        </div>
                                                        <span className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-1 rounded">Package</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{service.label}</h3>
                                                    <div className="flex items-baseline gap-1 mb-4">
                                                        <span className="text-3xl font-extrabold text-teal-600">₹{service.price}</span>
                                                        <span className="text-gray-500 text-sm">/ deliverable</span>
                                                    </div>
                                                    <Link
                                                        href={`/brand/checkout/${profile.id}?service=${service.id}`}
                                                        className="block w-full text-center py-2.5 rounded-lg border-2 border-gray-100 text-gray-900 font-bold text-sm hover:border-teal-600 hover:text-teal-600 transition-colors"
                                                    >
                                                        Hire for {service.label}
                                                    </Link>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                                                <p className="text-gray-500 font-medium">No pricing packages listed. Contact creator for rates.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
