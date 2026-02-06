"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Label
} from 'recharts';
import { Users, Heart, IndianRupee, ShoppingBag, Download, ArrowUpRight, ArrowDownRight, Instagram, Youtube } from "lucide-react";

interface GlobalAnalyticsDashboardProps {
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
    brandName: string;
}

export function GlobalAnalyticsDashboard({ data, brandName }: GlobalAnalyticsDashboardProps) {
    const { summary, performance, creators } = data;

    const totalBudget = summary.budget || 100000;
    const budgetData = [
        { name: 'Used', value: summary.totalSpent },
        { name: 'Remaining', value: totalBudget - summary.totalSpent }
    ];
    const COLORS = ['#0d9488', '#e5e7eb'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Brand Analytics</h1>
                    <p className="text-gray-500 mt-1">Overall performance across all your campaigns</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50">
                        Last 30 Days
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
                    trend="+15.5%"
                    trendUp={true}
                    icon={Users}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Total Engagement"
                    value={(summary.totalEngagement / 1000).toFixed(0) + 'K'}
                    trend="+8.2%"
                    trendUp={true}
                    icon={Heart}
                    color="bg-rose-50 text-rose-600"
                />
                <StatCard
                    title="Avg. CPE"
                    value={`₹${summary.avgCPE}`}
                    trend="-5%"
                    trendUp={true}
                    trendLabel="vs benchmark"
                    icon={IndianRupee}
                    color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    title="Est. Conversions"
                    value={summary.conversions.toLocaleString()}
                    trend="+12%"
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
                            <h3 className="text-lg font-bold text-gray-900">Growth Trends</h3>
                            <p className="text-sm text-gray-500">Cross-platform engagement analysis</p>
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
                                    stroke="#14b8a6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="youtube"
                                    stroke="#d1d5db"
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
                        <h3 className="text-lg font-bold text-gray-900">Total Spend</h3>
                        <p className="text-sm text-gray-500">Aggregated Campaign Budgets</p>
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
                            <p className="text-xs text-gray-400 mt-2">Active Commitments</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-gray-50 rounded-2xl p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                            <p className="font-bold text-gray-900 text-lg">₹{summary.totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Active Budgets</p>
                            <p className="font-bold text-gray-900 text-lg">₹{totalBudget.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Top Creators Table */}
            <Card className="p-0 border-0 shadow-lg shadow-gray-100 rounded-3xl bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Top Performing Creators</h3>
                        <p className="text-sm text-gray-500">Best performers across all active campaigns</p>
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
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Campaign</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Reach</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Eng. Rate</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Spend</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">ROI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {creators.length > 0 ? creators.map((creator: any, idx: number) => (
                                <tr key={`${creator.id}-${idx}`} className="group hover:bg-gray-50/50 transition-colors">
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
                                        <span className="text-sm font-medium text-gray-700">{creator.campaignTitle}</span>
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
                                    <td className="py-4 px-6 text-right font-bold text-teal-600 text-sm">
                                        {creator.roi}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                                        No active creators found.
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
