"use client"

import { useRouter } from "next/navigation"

import { Check, Clock, Search, FolderPlus, HelpCircle, Bell } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function VerificationClient() {
    const router = useRouter()

    const handleLogin = () => {
        router.push("/creator/dashboard")
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 text-[#3b82f6] flex items-center justify-center">
                        <div className="w-6 h-6 rounded-lg bg-[#3b82f6] flex items-center justify-center">
                            <div className="w-3 h-3 rounded-sm bg-white" />
                        </div>
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">InfluencerHub</span>
                </div>
                <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                        <HelpCircle className="w-4 h-4" />
                        Support
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&fit=crop"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-4">
                {/* Status Card */}
                <Card className="w-full max-w-[450px] p-4 border-none shadow-xl rounded-3xl bg-white text-center mb-3">
                    {/* Lock Icon */}
                    <div className="flex justify-center mb-3 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-blue-50/50 flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                                <div className="w-6 h-6 rounded-lg bg-[#2563eb] text-white flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-base font-bold text-gray-900 mb-1">Verification in Progress</h1>
                    <p className="text-[11px] text-gray-500 leading-relaxed mb-4 max-w-xs mx-auto">
                        Thanks for submitting your details. Our team is currently reviewing your profile to ensure marketplace quality.
                    </p>

                    {/* Status Steps with Vertical Lines */}
                    <div className="space-y-0 text-left max-w-[240px] mx-auto mb-4 relative">
                        {/* Connecting Line 1 */}
                        <div className="absolute left-[11px] top-5 bottom-1/2 w-[2px] bg-gray-100 -z-0 h-[45px]" />

                        {/* Connecting Line 2 */}
                        <div className="absolute left-[11px] top-[60px] bottom-0 w-[2px] bg-gray-100 -z-0 h-[20px]" />

                        {/* Step 1 - Completed */}
                        <div className="flex items-start gap-4 pb-4 relative z-10">
                            <div className="w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0 border-[3px] border-white shadow-sm">
                                <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                            <div className="-mt-0.5">
                                <h3 className="text-sm font-semibold text-gray-900">Registration Completed</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Account created successfully</p>
                            </div>
                        </div>

                        {/* Step 2 - Completed */}
                        <div className="flex items-start gap-4 pb-4 relative z-10">
                            <div className="w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0 border-[3px] border-white shadow-sm">
                                <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                            <div className="-mt-0.5">
                                <h3 className="text-sm font-semibold text-gray-900">KYC Documents Uploaded</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">ID and tax forms submitted</p>
                            </div>
                        </div>

                        {/* Step 3 - In Progress */}
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-[#3b82f6] shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                            </div>
                            <div className="-mt-0.5">
                                <h3 className="text-sm font-semibold text-[#3b82f6]">Admin Review</h3>
                                <p className="text-[10px] text-[#60a5fa] mt-0.5">Currently in progress</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Expected Time */}
                    <div className="border-t border-gray-50 pt-2.5 mt-1">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>Expected completion: <strong className="text-gray-900">24-48 hours</strong></span>
                        </div>
                    </div>
                </Card>

                {/* Login to Dashboard Card Container */}
                <div className="w-full max-w-[450px]">

                    {/* Login to Dashboard Card */}
                    <Card className="p-4 border-none shadow-md rounded-2xl bg-white">
                        <h3 className="font-bold text-gray-900 mb-1 text-sm">Login to Dashboard</h3>
                        <p className="text-[11px] text-gray-500 mb-3">Access your tools while we verify your account.</p>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="name@creator.com"
                                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-9 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-[10px] text-gray-500 cursor-pointer">
                                <input type="checkbox" className="w-3 h-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                Keep me signed in
                            </label>
                            <a href="#" className="text-[10px] text-purple-600 hover:underline font-medium">Forgot password?</a>
                        </div>

                        <button onClick={handleLogin} className="w-full py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-lg font-semibold text-xs hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2">
                            Login & Enter Dashboard
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </Card>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center">
                <p className="text-[10px] text-gray-400">© 2023 InfluencerHub Inc. All rights reserved.</p>
            </footer>
        </div>
    )
}
