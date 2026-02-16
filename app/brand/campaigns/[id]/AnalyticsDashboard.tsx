"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Label
} from 'recharts';
import { Users, Heart, IndianRupee, ShoppingBag, Download, ArrowUpRight, ArrowDownRight, Instagram, Youtube } from "lucide-react";

interface AnalyticsDashboardProps {
    data: {
        summary: {
            totalReach: number;
            totalEngagement: number;
            avgCPE: string;
            conversions: number;
            totalSpent: number;
            budget: number | null;
        };
        performance: any[];
        creators: any[];
    };
    campaignTitle: string;
}

export function AnalyticsDashboard({ data, campaignTitle }: AnalyticsDashboardProps) {
    const { summary, performance, creators } = data;

    // Budget Calculations
    const totalBudget = summary.budget || 50000; // Mock default if null
    const spentPercentage = Math.min(Math.round((summary.totalSpent / totalBudget) * 100), 100);
    const budgetData = [
        { name: 'Used', value: summary.totalSpent },
        { name: 'Remaining', value: totalBudget - summary.totalSpent }
    ];
    const COLORS = ['#0d9488', '#e5e7eb']; // Teal-600, Gray-200

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{campaignTitle}</h1>
                    <p className="text-gray-500 mt-1">Real-time performance overview</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50">
                        Oct 1 - Oct 31, 2024
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Reach"
                    value={(summary.totalReach / 1000000).toFixed(1) + 'M'}
                    trend="+12.5%"
                    trendUp={true}
                    icon={Users}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Engagement"
                    value={(summary.totalEngagement / 1000).toFixed(0) + 'K'}
                    trend="+5.2%"
                    trendUp={true}
                    icon={Heart}
                    color="bg-rose-50 text-rose-600"
                />
                <StatCard
                    title="Avg. CPE"
                    value={`₹${summary.avgCPE}`}
                    trend="-2%"
                    trendUp={true} // Lower CPE is good
                    trendLabel="efficient spend"
                    icon={IndianRupee}
                    color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    title="Est. Conversions"
                    value={summary.conversions.toLocaleString()}
                    trend="+8%"
                    trendUp={true}
                    icon={ShoppingBag}
                    color="bg-purple-50 text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart */}
                <Card className="lg:col-span-2 p-6 border-0 shadow-lg shadow-gray-100 rounded-3xl bg-white">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Performance Over Time</h3>
                            <p className="text-sm text-gray-500">Engagement across all platforms</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-teal-500"></span> Instagram
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-gray-300"></span> YouTube
                            </span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="instagram"
                                    stroke="#14b8a6" // Teal-500
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="youtube"
                                    stroke="#d1d5db" // Gray-300
                                    strokeWidth={3}
                                    dot={false}
                                    strokeDasharray="5 5"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Budget Utilization */}
                <Card className="p-6 border-0 shadow-lg shadow-gray-100 rounded-3xl bg-white flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Budget Utilization</h3>
                        <p className="text-sm text-gray-500">Campaign Spend vs Limit</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={budgetData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={0}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                    stroke="none"
                                    cornerRadius={10}
                                >
                                    {budgetData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    <Label
                                        value={`₹${(summary.totalSpent / 1000).toFixed(1)}k`}
                                        position="center"
                                        className="fill-gray-900 text-3xl font-bold"
                                    />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 text-center">
                            <p className="text-xs text-gray-400 mt-2">of ₹{(totalBudget / 1000).toFixed(0)}k used</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-gray-50 rounded-2xl p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Remaining</p>
                            <p className="font-bold text-gray-900 text-lg">₹{(totalBudget - summary.totalSpent).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Daily Avg</p>
                            <p className="font-bold text-gray-900 text-lg">₹1,500</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Top Creators Table */}
            <Card className="p-0 border-0 shadow-lg shadow-gray-100 rounded-3xl bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Top Performing Creators</h3>
                        <p className="text-sm text-gray-500">Ranked by overall campaign impact</p>
                    </div>
                    <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-medium">
                        View All <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Creator</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Platform</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Reach</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Eng. Rate</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Spend</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">ROI</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {creators.length > 0 ? creators.map((creator) => (
                                <tr key={creator.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={creator.avatar || '/placeholder-user.jpg'}
                                                alt={creator.name}
                                                className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-200"
                                            />
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{creator.name}</div>
                                                <div className="text-xs text-gray-500">{creator.handle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                                                <Instagram className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Instagram</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right font-bold text-gray-900 text-sm">
                                        {(creator.reach / 1000).toFixed(1)}k
                                    </td>
                                    <td className="py-4 px-6 text-right font-bold text-green-600 text-sm">
                                        {creator.engagementRate}%
                                    </td>
                                    <td className="py-4 px-6 text-right text-gray-700 text-sm">
                                        ₹{creator.spend.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${creator.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                                creator.paymentStatus === 'Final Locked' ? 'bg-blue-100 text-blue-700' :
                                                    creator.paymentStatus === 'Advance Locked' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {creator.paymentStatus || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right font-bold text-teal-600 text-sm">
                                        {creator.roi}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${creator.status === 'Completed'
                                            ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                            {creator.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">
                                        No active creators in this campaign yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}


function StatCard({ title, value, trend, trendUp, trendLabel, icon: Icon, color }: any) {
    return (
        <Card className="p-6 border-0 shadow-lg shadow-gray-100 rounded-3xl bg-white hover:translate-y-[-2px] transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</div>
                <div className="flex items-center gap-2">
                    <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {trend}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{trendLabel || 'vs last month'}</span>
                </div>
            </div>
        </Card>
    )
}
