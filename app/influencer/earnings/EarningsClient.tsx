'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Share2,
    Bell,
    Download,
    DollarSign,
    TrendingUp,
    Hourglass,
    Wallet,
    Calendar,
    Upload,
    AlertCircle,
    BarChart3,
    Eye,
    Heart,
    Users,
    Link as LinkIcon,
    ArrowUp,
    Minus,
    ChevronDown
} from 'lucide-react';
import { submitDeliverable, requestPayout } from '../actions';
import { Contract, Deliverable, BrandProfile } from '@prisma/client';

type Job = Contract & {
    brand: BrandProfile;
    deliverables: Deliverable[];
};

interface EarningsClientProps {
    stats: {
        earned: number;
        pending: number;
        available: number;
    };
    jobs: Job[];
    influencerId: string;
}

export default function EarningsClient({ stats, jobs, influencerId }: EarningsClientProps) {
    const handleWithdraw = async () => {
        if (stats.available <= 0) return alert("No funds available");
        const res = await requestPayout(influencerId, stats.available);
        if (res.success) alert("Withdrawal Requested!");
    };

    const handleSubmit = async (deliverableId: string) => {
        const url = prompt("Enter submission URL (e.g. Google Drive link):");
        if (url) {
            await submitDeliverable(deliverableId, url);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 flex flex-col">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600">
                                <Share2 className="w-6 h-6 fill-current" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CreatorHub</h1>
                        </div>

                        {/* Nav Links */}
                        <nav className="hidden md:flex items-center gap-8">
                            <a className="text-teal-600 font-bold text-sm" href="#">Dashboard</a>
                            <a className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium" href="#">Marketplace</a>
                            <a className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium" href="#">Wallet</a>
                            <a className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium" href="#">Messages</a>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-slate-400 hover:text-teal-600 transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                            </button>
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-700">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Sarah Jenkins</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">@sarah.creates</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow-sm">
                                    <Image
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
                                        alt="Sarah"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Main Dashboard (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Welcome Section */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your performance summary.</p>
                            </div>
                            <button className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                                <Download className="w-4 h-4" />
                                Export Report
                            </button>
                        </div>

                        {/* Earnings "Bento" Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Total Earned */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 group hover:border-teal-500/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-teal-500/10 rounded-lg text-teal-600">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        +12%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Earned</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${stats.earned.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Pending Escrow */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 group hover:border-yellow-400/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500">
                                        <Hourglass className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Escrow</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${stats.pending.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Available */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="p-2 bg-teal-500/10 rounded-lg text-teal-600">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <button onClick={handleWithdraw} className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wide">Withdraw</button>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Available</p>
                                    <p className="text-2xl font-bold text-teal-600 mt-1">${stats.available.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Income Chart */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Income Trends</h3>
                                <div className="relative">
                                    <select className="bg-slate-50 dark:bg-slate-700 border-none text-xs font-bold text-slate-600 dark:text-slate-300 rounded-lg py-2 pl-3 pr-8 focus:ring-1 focus:ring-teal-500 cursor-pointer outline-none appearance-none">
                                        <option>Last 30 Days</option>
                                        <option>This Quarter</option>
                                        <option>This Year</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                                </div>
                            </div>

                            {/* Chart Graphic (SVG) */}
                            <div className="w-full h-48 relative">
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 200">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2"></stop>
                                            <stop offset="100%" stopColor="#0d9488" stopOpacity="0"></stop>
                                        </linearGradient>
                                    </defs>
                                    {/* Grid lines */}
                                    <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="150" y2="150"></line>
                                    <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="100" y2="100"></line>
                                    <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="50" y2="50"></line>
                                    {/* The Chart Line */}
                                    <path className="drop-shadow-md" d="M0,180 C50,160 100,120 150,130 C200,140 250,80 300,90 C350,100 400,60 450,50 C500,40 550,70 600,60 C650,50 700,20 800,40" fill="none" stroke="#0d9488" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                                    {/* Area under curve */}
                                    <path className="opacity-50" d="M0,180 C50,160 100,120 150,130 C200,140 250,80 300,90 C350,100 400,60 450,50 C500,40 550,70 600,60 C650,50 700,20 800,40 V200 H0 Z" fill="url(#chartGradient)"></path>
                                    {/* Points */}
                                    <circle cx="150" cy="130" fill="#ffffff" r="4" stroke="#0d9488" strokeWidth="2"></circle>
                                    <circle cx="450" cy="50" fill="#ffffff" r="4" stroke="#0d9488" strokeWidth="2"></circle>
                                    <circle cx="800" cy="40" fill="#ffffff" r="4" stroke="#0d9488" strokeWidth="2"></circle>
                                </svg>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                                <span>Oct 1</span>
                                <span>Oct 7</span>
                                <span>Oct 14</span>
                                <span>Oct 21</span>
                                <span>Oct 28</span>
                            </div>
                        </div>

                        {/* Active Jobs List */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Jobs</h3>
                                <a className="text-sm font-bold text-teal-600 hover:text-teal-700" href="#">View All</a>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {jobs.map((job) => (
                                    <div key={job.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 overflow-hidden text-sm font-bold">
                                                {job.brand.companyName.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{job.brand.companyName}</h4>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                        {job.deliverables.length} Items
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'TBD'}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">${job.totalAmount}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 sm:ml-auto">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                {job.status}
                                            </span>

                                            {job.deliverables.length > 0 && job.deliverables[0].status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleSubmit(job.deliverables[0].id)}
                                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow-sm shadow-teal-600/30 transition-all flex items-center gap-2 shrink-0"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Submit {job.deliverables[0].title.substring(0, 10)}...
                                                </button>
                                            )}
                                            {job.deliverables.length > 0 && job.deliverables[0].status === 'SUBMITTED' && (
                                                <button className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold flex items-center gap-2 shrink-0" disabled>
                                                    Reviewing...
                                                </button>
                                            )}

                                        </div>
                                    </div>
                                ))}
                                {jobs.length === 0 && <div className="p-6 text-center text-gray-500">No active jobs found.</div>}
                            </div>
                        </div>
                    </div>
                    {/* Sidebar ... keeping static for brevity or would duplicate identical code */}
                </div>
            </main>
        </div>
    );
}
