'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Instagram, MapPin, TrendingUp, Users, Eye, Heart, MessageCircle, Bookmark, Share2, CheckCircle2, Star, Calendar } from 'lucide-react';

export default function InfluencerProfile() {
    const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'pricing'>('overview');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/brand/discover" className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-semibold">Back to Discovery</span>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search creators, hashtags or locations..."
                                className="px-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <button className="px-5 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all">
                                Post Campaign
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Cover & Profile */}
            <div className="bg-gradient-to-br from-purple-200 via-pink-100 to-orange-100 h-64" />

            <div className="max-w-7xl mx-auto px-6 -mt-32">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-start gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-4 border-white shadow-lg" />
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-gray-900">Sarah Jenkins</h1>
                                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full uppercase">
                                            Rising Star
                                        </span>
                                    </div>
                                    <p className="text-teal-600 text-lg mb-2">@sarah_lifestyle • New York, USA</p>
                                    <p className="text-gray-600 leading-relaxed max-w-3xl">
                                        Lifestyle & Travel creator capturing the beauty of everyday moments. Specialized in aesthetic storytelling and authentic product integration. Previously worked with Sephora, Delta, and Glossier.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                        <Bookmark className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                        <Share2 className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4" />
                                        Start Trio-Chat
                                    </button>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-8 mt-6">
                                <div className="flex items-center gap-2">
                                    <Instagram className="w-5 h-5 text-pink-500" />
                                    <span className="font-bold text-gray-900">250K</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <span className="font-bold text-gray-900">85K</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">
                                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M13 2 3 14h9l-1 8 10-12h-9l1-8z'%3E%3C/path%3E%3C/svg%3E" alt="Portfolio" className="inline w-5 h-5" />
                                    </span>
                                    <Link href="#portfolio" className="text-teal-600 font-semibold hover:text-teal-700">
                                        Portfolio
                                    </Link>
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
                                <h3 className="font-bold text-gray-900 mb-6 text-lg">Service Pricing</h3>

                                <div className="space-y-4">
                                    {[
                                        { service: 'Instagram Story', price: '$500', features: ['3 Frames with narrative arc', 'Link to bio & sticker tag'] },
                                        { service: 'Instagram Reel (60s)', price: '$800', features: ['Includes shoot, script & design', '2x Instagram feed', '30-day performance tracking'] },
                                        { service: 'Content Strategy Call', price: 'Included', features: ['30-min with call', 'Brief review'] }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-teal-500 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Instagram className="w-5 h-5 text-pink-500" />
                                                    <h4 className="font-bold text-gray-900">{item.service}</h4>
                                                    {item.service.includes('POPULAR') && (
                                                        <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">POPULAR</span>
                                                    )}
                                                </div>
                                                <ul className="space-y-1">
                                                    {item.features.map((feature, i) => (
                                                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-teal-500" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">{item.price}</div>
                                                {item.price !== 'Included' && <div className="text-xs text-gray-500">/per post</div>}
                                            </div>
                                        </div>
                                    ))}
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

                        {/* Connect & Book */}
                        <div className="bg-gradient-to-br from-teal-600 to-teal-500 rounded-xl shadow-md p-6 text-white">
                            <h3 className="font-bold mb-2 text-xl">Connect TikTok</h3>
                            <p className="text-teal-50 text-sm mb-4">Sync analytics to better performance</p>
                            <button className="w-full py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all">
                                CONNECT NOW
                            </button>
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
