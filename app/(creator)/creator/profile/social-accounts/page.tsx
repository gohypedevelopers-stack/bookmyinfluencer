"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
    Instagram,
    Youtube,
    RefreshCw,
    Plus,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    MoreHorizontal,
    Facebook,
    Twitter,
    AlertTriangle,
    ArrowRight
} from "lucide-react"

// Custom icons for specific platforms if Lucide doesn't have exact match
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
)

const ThreadsIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M16.89 13.92h-1.35a3.11 3.11 0 0 0-2.06.69 2.59 2.59 0 0 0-.69 1.77c.12 1.25.95 2.12 2.45 2.12 1.34 0 2.21-.86 2.37-2.32V15.7h1.46v.47a4.11 4.11 0 0 1-3.83 3.83 4.22 4.22 0 0 1-4.22-4.22 4.22 4.22 0 0 1 4.22-4.22 3.65 3.65 0 0 1 2.15.56V5.45H22v11a7.41 7.41 0 0 1-7.14 7.55 7.6 7.6 0 1 1-2.9-14.6 7.63 7.63 0 0 1 5.37 2.1l-1.12 1a6.07 6.07 0 0 0-4.25-1.63 6.07 6.07 0 1 0 2.3 11.69 5.86 5.86 0 0 0 5.09-4.83zm-3.01-1v-.09a2.43 2.43 0 0 0-2.41 2.41 2.51 2.51 0 0 0 2.41 2.5v-4.82z" />
    </svg>
)

export default function SocialAccountsPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
                    <p className="text-gray-500 mt-1">Manage your linked platforms and sync metrics</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4 font-semibold">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync All Data
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4 font-semibold shadow-lg shadow-indigo-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Platform
                    </Button>
                </div>
            </div>

            <div className="flex gap-8">
                {/* Main Content Column */}
                <div className="flex-1 space-y-6">
                    {/* Platform Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Instagram Card */}
                        <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-sm">
                                    <Instagram className="w-7 h-7" />
                                </div>
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Healthy
                                </span>
                            </div>
                            <div className="mb-6">
                                <h3 className="font-bold text-lg text-gray-900">Instagram</h3>
                                <p className="text-xs text-gray-500">@alex_sterling_life</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Followers</p>
                                    <p className="font-bold text-gray-900 text-lg">124.5k</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Engagement</p>
                                    <p className="font-bold text-gray-900 text-lg">4.2%</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                    <RefreshCw className="w-3 h-3" /> 2 hours ago
                                </span>
                                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="sr-only">Settings</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                    </div>
                                </button>
                            </div>
                        </Card>

                        {/* YouTube Card */}
                        <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-sm">
                                    <Youtube className="w-7 h-7" />
                                </div>
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Healthy
                                </span>
                            </div>
                            <div className="mb-6">
                                <h3 className="font-bold text-lg text-gray-900">YouTube</h3>
                                <p className="text-xs text-gray-500">Sterling Tech Reviews</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Subscribers</p>
                                    <p className="font-bold text-gray-900 text-lg">45.2k</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Avg Views</p>
                                    <p className="font-bold text-gray-900 text-lg">12.8k</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                    <RefreshCw className="w-3 h-3" /> 12 hours ago
                                </span>
                                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="sr-only">Settings</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                    </div>
                                </button>
                            </div>
                        </Card>

                        {/* TikTok Card (Sync Error) */}
                        <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-sm">
                                    <TikTokIcon className="w-6 h-6 fill-white" />
                                </div>
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                    Sync Error
                                </span>
                            </div>
                            <div className="mb-6">
                                <h3 className="font-bold text-lg text-gray-900">TikTok</h3>
                                <p className="text-xs text-gray-500">alex.sterling.official</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-xl p-3 opacity-50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Followers</p>
                                    <p className="font-bold text-gray-700 text-lg">89.1k</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 opacity-50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Engagement</p>
                                    <p className="font-bold text-gray-700 text-lg">--</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                                    <AlertTriangle className="w-3 h-3" /> Requires Auth
                                </span>
                                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                        <ArrowRight className="w-3" /> {/* Placeholder icon for broken link */}
                                    </div>
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Live Performance Sync */}
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-xl text-gray-900">Live Performance Sync</h3>
                            </div>
                            <Switch className="data-[state=checked]:bg-purple-500" defaultChecked />
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-900">Automated Refresh Cycle</span>
                                <span className="text-sm font-bold text-blue-600">Every 6 Hours</span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Your metrics are automatically pulled from official APIs to keep your media kit up to date for brand partners.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <Button variant="outline" className="border-gray-200 text-gray-900 font-bold rounded-2xl h-14 text-base shadow-sm hover:bg-gray-50">
                                Download Report (.PDF)
                            </Button>
                            <Button variant="outline" className="border-gray-200 text-gray-900 font-bold rounded-2xl h-14 text-base shadow-sm hover:bg-gray-50">
                                Historical Insights
                            </Button>
                        </div>
                    </Card>

                    {/* Add Platform Section */}
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-500 rounded text-white p-0.5"><Plus className="w-4 h-4" /></div>
                            <h3 className="font-bold text-lg text-gray-900">Add Platform</h3>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-blue-600 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Facebook</span>
                            </div>

                            <div className="border border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-gray-900 transition-colors">
                                    <span className="font-bold text-lg">X</span>
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">X (Twitter)</span>
                            </div>

                            <div className="border border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-black transition-colors">
                                    <ThreadsIcon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Threads</span>
                            </div>

                            <div className="border border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-gray-400 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Other</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Status */}
                <div className="w-80 shrink-0 space-y-6">
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 bg-white height-auto">
                        <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-6">Account Health Summary</h3>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">Data Fidelity</p>
                                    <p className="text-[10px] text-gray-500">Verified by Official APIs</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">Pending Auth</p>
                                    <p className="text-[10px] text-gray-500">TikTok connection expired</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 text-xs text-gray-400 leading-relaxed italic">
                            Linking your socials allows brands to see your real-time performance metrics without asking for screenshots.
                        </div>

                        <div className="mt-6">
                            <Button className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-12 font-bold shadow-lg shadow-gray-200">
                                Update Media Kit
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
