"use client"

import {
    TrendingUp,
    Users,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    MoreHorizontal,
    Activity,
    Zap,
    Megaphone
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-500">Real-time platform analytics and marketplace operations.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="text-sm font-medium text-gray-500 mb-1">Total Platform Revenue</div>
                    <div className="text-3xl font-bold text-gray-900 mb-4">₹428,500</div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0.5 rounded-md font-semibold text-xs">
                            +25.4%
                        </Badge>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">28% Profit Margin</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="text-sm font-medium text-gray-500 mb-1">Pending KYC Requests</div>
                    <div className="text-3xl font-bold text-gray-900 mb-4">142</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                    <div className="text-xs font-medium text-gray-500 text-right">67% Processed</div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="text-sm font-medium text-gray-500 mb-1">Active Campaigns</div>
                    <div className="text-3xl font-bold text-gray-900 mb-4">890</div>
                    <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none px-2 py-1 rounded w-fit font-medium text-xs">
                            +12% vs LY
                        </Badge>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Global Live</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white border-l-4 border-l-red-500">
                    <div className="text-sm font-medium text-gray-500 mb-1">Disputed Escrows</div>
                    <div className="text-3xl font-bold text-red-600 mb-4">12</div>
                    <div className="flex items-center gap-2 text-red-600 text-xs font-bold">
                        <AlertCircle className="w-4 h-4" />
                        Needs immediate attention
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <Card className="col-span-2 p-6 border-none shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-gray-900 text-lg">Revenue Growth</h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Weekly</button>
                            <button className="px-3 py-1 text-xs font-bold bg-white text-gray-900 shadow-sm rounded-md transition-colors">Monthly</button>
                        </div>
                    </div>

                    {/* Mock Bar Chart */}
                    <div className="flex items-end justify-between h-64 gap-3 px-2">
                        {[30, 45, 35, 60, 50, 75, 65, 80, 70, 60, 50, 90].map((height, i) => (
                            <div key={i} className="w-full bg-blue-50 hover:bg-blue-100 rounded-t-lg relative group transition-all duration-300" style={{ height: `${height}%` }}>
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-lg transition-all duration-500"
                                    style={{ height: `${height * 0.7}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="hidden group-hover:block absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10 font-bold">
                                    ₹{height * 1200}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </Card>

                {/* Platform Health */}
                <Card className="col-span-1 p-6 border-none shadow-sm bg-white flex flex-col justify-between">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Platform Health</h3>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold text-gray-900 text-sm">User Retention</div>
                                    <span className="text-green-600 font-bold text-xs">+2%</span>
                                </div>
                                <div className="text-xs text-gray-500 leading-snug">84% average retention rate</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold text-gray-900 text-sm">API Performance</div>
                                    <span className="text-gray-900 font-bold text-xs">Stable</span>
                                </div>
                                <div className="text-xs text-gray-500 leading-snug">99.9% uptime this month</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold text-gray-900 text-sm">Campaign Conversion</div>
                                    <span className="text-blue-600 font-bold text-xs">4.2x</span>
                                </div>
                                <div className="text-xs text-gray-500 leading-snug">Influencer ROI index</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 w-full text-center hover:underline">
                            View System Status
                        </button>
                    </div>
                </Card>
            </div>

            {/* Recent Activity Table */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
                    <Button variant="outline" size="sm" className="text-xs font-bold text-gray-600 h-8 border-gray-200">
                        View All Logs
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">User / Influencer</th>
                                <th className="px-6 py-4">Event Type</th>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <tr className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces" className="w-8 h-8 rounded-full object-cover shadow-sm" alt="User" />
                                        <span className="font-bold text-gray-900">Sarah Jenkins</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-bold text-[10px]">New Sign-up</Badge>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">TXN-9022-881</td>
                                <td className="px-6 py-4 text-gray-400 font-bold">—</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        Verified
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-400 text-xs">2m ago</td>
                            </tr>

                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces" className="w-8 h-8 rounded-full object-cover shadow-sm" alt="User" />
                                        <span className="font-bold text-gray-900">Michael Chen</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-none font-bold text-[10px]">Escrow Release</Badge>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">TXN-1122-094</td>
                                <td className="px-6 py-4 text-gray-900 font-bold">₹1,250.00</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        Completed
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-400 text-xs">14m ago</td>
                            </tr>

                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=faces" className="w-8 h-8 rounded-full object-cover shadow-sm" alt="User" />
                                        <span className="font-bold text-gray-900">Alexa Rivera</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-50 border-none font-bold text-[10px]">Dispute Raised</Badge>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">TXN-4491-332</td>
                                <td className="px-6 py-4 text-gray-900 font-bold">₹3,400.00</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        Under Review
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-400 text-xs">42m ago</td>
                            </tr>

                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">U</div>
                                        <span className="font-bold text-gray-900">Urban Outfitters Co.</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-none font-bold text-[10px]">Campaign Lch</Badge>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">TXN-8821-001</td>
                                <td className="px-6 py-4 text-gray-900 font-bold">₹12,000.00</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        Active
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-400 text-xs">1h ago</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
