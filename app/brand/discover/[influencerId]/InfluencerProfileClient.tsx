'use client';

import { InfluencerProfile, User } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";

type FullProfile = InfluencerProfile & { user: User; bannerImage?: string | null };

export default function InfluencerProfileClient({
    profile,
    session
}: {
    profile: FullProfile;
    session: Session | null;
}) {
    // Parsing pricing - it's stored as JSON string in SQLite
    let pricing: { story?: number; reel?: number;[key: string]: any } = {};
    try {
        pricing = profile.pricing ? JSON.parse(profile.pricing as string) : {};
    } catch {
        pricing = {};
    }

    return (
        <div className="bg-gray-50 text-gray-900 antialiased min-h-screen">
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
                                                    <button className="flex-1 md:flex-none h-11 px-6 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
                                                        Save
                                                    </button>
                                                    <Link
                                                        href={`/brand/campaigns/new?influencerId=${profile.id}`}
                                                        className="flex-1 md:flex-none h-12 px-8 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 bg-size-200 animate-gradient-x text-white hover:shadow-teal-500/40 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2 group"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform duration-300">campaign</span>
                                                        <span className="tracking-wide">Request Collaboration</span>
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link
                                                    href={`/login?returnUrl=/brand/discover/${profile.id}&action=hire`}
                                                    className="flex-1 md:flex-none h-12 px-8 bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 animate-pulse hover:animate-none"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                                                    Request Collaboration
                                                </Link>
                                            )}
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
                                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
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
                                        {/* Pricing Card 1 */}
                                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all hover:border-teal-500/30 group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-blue-50 text-blue-700 p-2 rounded-lg">
                                                    <span className="material-symbols-outlined">amp_stories</span>
                                                </div>
                                                <span className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-1 rounded">Popular</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Instagram Story</h3>
                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className="text-3xl font-extrabold text-teal-600">₹{pricing.story || 500}</span>
                                                <span className="text-gray-500 text-sm">/ set</span>
                                            </div>
                                            <button className="w-full py-2.5 rounded-lg border-2 border-gray-100 text-gray-900 font-bold text-sm hover:border-teal-600 hover:text-teal-600 transition-colors">
                                                Add to Campaign
                                            </button>
                                        </div>
                                        {/* Pricing Card 2 */}
                                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all hover:border-teal-500/30 group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">Best Value</div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-purple-50 text-purple-700 p-2 rounded-lg">
                                                    <span className="material-symbols-outlined">movie</span>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Reel Production</h3>
                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className="text-3xl font-extrabold text-teal-600">₹{pricing.reel || 1200}</span>
                                                <span className="text-gray-500 text-sm">/ video</span>
                                            </div>
                                            <button className="w-full py-2.5 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors shadow-md">
                                                Select Package
                                            </button>
                                        </div>

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
