"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Shield,
    Key,
    Smartphone,
    History,
    LogOut,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Globe
} from "lucide-react"
import Link from "next/link"

export default function SecurityPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/creator/profile">
                        <button className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Security</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium">
                        Discard Changes
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-lg px-6">
                        Save Settings
                    </Button>
                </div>
            </div>

            <div className="flex gap-8 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-8">

                    {/* Password Section */}
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 bg-white">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Key className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Password</h3>
                                <p className="text-sm text-gray-500">Update your password associated with your account</p>
                            </div>
                        </div>

                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Password</label>
                                <Input type="password" placeholder="••••••••••••" className="h-12 rounded-xl border-gray-200 bg-gray-50/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password</label>
                                    <Input type="password" placeholder="Enter new password" className="h-12 rounded-xl border-gray-200 bg-gray-50/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Confirm Password</label>
                                    <Input type="password" placeholder="Confirm new password" className="h-12 rounded-xl border-gray-200 bg-gray-50/50" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <InfoIcon className="w-4 h-4" />
                                Minimum 8 characters, at least one uppercase, and one number.
                            </div>
                        </div>
                    </Card>

                    {/* 2FA Section */}
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 bg-white">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                </div>
                            </div>
                            <Switch />
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <div className="w-24 h-24 bg-gray-200 animate-pulse rounded"></div> {/* QR Placeholder */}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Authenticator App</h4>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    Use an authenticator app like Google Authenticator or Microsoft Authenticator to scan the QR code.
                                </p>
                                <Button variant="outline" className="h-9 text-xs font-bold bg-white border-gray-200">
                                    Setup Manual Key
                                </Button>
                            </div>
                        </div>
                    </Card>

                </div>

                {/* Right Column - Login Activity */}
                <div className="w-80 shrink-0 space-y-6">
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                <History className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm">Login Activity</h3>
                        </div>

                        <div className="space-y-6">
                            {[
                                { device: "Chrome on Windows", location: "Mumbai, India", time: "Active Now", icon: Globe, active: true },
                                { device: "Safari on iPhone 15", location: "Mumbai, India", time: "2 hours ago", icon: Smartphone, active: false },
                                { device: "Chrome on Mac", location: "Bangalore, India", time: "Yesterday", icon: Globe, active: false },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className={`mt-1 ${item.active ? "text-green-500" : "text-gray-400"}`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-xs text-gray-900">{item.device}</p>
                                        <p className="text-[10px] text-gray-400 mb-1">{item.location} • {item.time}</p>
                                        {item.active && (
                                            <span className="inline-flex items-center gap-1 text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                                <div className="w-1 h-1 bg-green-500 rounded-full"></div> Current
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <button className="w-full flex items-center justify-between text-xs font-bold text-red-500 hover:text-red-600 transition-colors group">
                                <span>Sign out of all devices</span>
                                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 bg-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-5 h-5 text-gray-900" />
                            <h3 className="font-bold text-gray-900 text-sm">Security Score</h3>
                        </div>
                        <div className="mb-4">
                            <div className="flex items-end gap-1 mb-2">
                                <span className="text-3xl font-bold text-green-500">85</span>
                                <span className="text-sm font-bold text-gray-400 mb-1">/ 100</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                            Your account is secure. Enable 2FA to reach 100%.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function InfoIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}
