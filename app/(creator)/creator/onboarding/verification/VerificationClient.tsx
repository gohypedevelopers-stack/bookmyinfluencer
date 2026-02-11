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
                <Card className="w-full max-w-[450px] p-4 border-none shadow-xl rounded-3xl bg-white text-center mb-6">
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

                {/* Go to Dashboard Button Container */}
                <div className="w-full max-w-[450px]">
                    <Card className="p-6 border-none shadow-md rounded-2xl bg-white text-center">
                        <h3 className="font-bold text-gray-900 mb-2 text-sm">Access Dashboard</h3>
                        <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                            You can access your dashboard to update your profile while we verify your account.
                        </p>

                        <button
                            onClick={handleLogin}
                            className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                        >
                            Go to Dashboard
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
