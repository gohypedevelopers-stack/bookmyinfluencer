'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Calendar, DollarSign, Target, Users } from 'lucide-react';

export default function CampaignCreation() {
    const [step, setStep] = useState(1);
    const [compensationModel, setCompensationModel] = useState<'fixed' | 'negotiable' | 'gifting'>('negotiable');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/brand/campaigns" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">InfluencerConnect</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/brand/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
                            <Link href="/brand/campaigns" className="text-sm font-semibold text-teal-600">Campaigns</Link>
                            <Link href="/brand/influencers" className="text-sm text-gray-600 hover:text-gray-900">Influencers</Link>
                            <Link href="/brand/reports" className="text-sm text-gray-600 hover:text-gray-900">Reports</Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-12">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="flex items-center">
                            <div className={`flex flex-col items-center ${num < 4 ? 'mr-8' : ''}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${step >= num
                                        ? 'bg-gradient-to-br from-teal-600 to-teal-500 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {step > num ? <CheckCircle2 className="w-6 h-6" /> : num}
                                </div>
                                <span className={`text-xs font-medium mt-2 ${step >= num ? 'text-teal-600' : 'text-gray-400'
                                    }`}>
                                    {num === 1 ? 'BASICS' : num === 2 ? 'BUDGET' : num === 3 ? 'TARGETING' : 'BRIEF'}
                                </span>
                            </div>
                            {num < 4 && (
                                <div className={`w-24 h-1 ${step > num ? 'bg-teal-500' : 'bg-gray-200'
                                    } -mt-6`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    {step === 2 && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Budget & Timeline</h2>
                            <p className="text-gray-600 mb-8">Define the financial scope and duration of your campaign.</p>

                            <div className="space-y-8">
                                {/* Compensation Model */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                                        COMPENSATION MODEL
                                    </label>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setCompensationModel('fixed')}
                                            className={`p-5 rounded-xl border-2 transition-all ${compensationModel === 'fixed'
                                                    ? 'border-teal-500 bg-teal-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={` w-5 h-5 rounded-full border-2 flex items-center justify-center ${compensationModel === 'fixed'
                                                        ? 'border-teal-500 bg-teal-500'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {compensationModel === 'fixed' && (
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <DollarSign className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">Fixed Pay</h3>
                                            <p className="text-sm text-gray-600">Set a specific amount per deliverable.</p>
                                        </button>

                                        <button
                                            onClick={() => setCompensationModel('negotiable')}
                                            className={`p-5 rounded-xl border-2 transition-all ${compensationModel === 'negotiable'
                                                    ? 'border-teal-500 bg-teal-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${compensationModel === 'negotiable'
                                                        ? 'border-teal-500 bg-teal-500'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {compensationModel === 'negotiable' && (
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                </svg>
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">Negotiable</h3>
                                            <p className="text-sm text-gray-600">Set a range and negotiate with creators.</p>
                                        </button>

                                        <button
                                            onClick={() => setCompensationModel('gifting')}
                                            className={`p-5 rounded-xl border-2 transition-all ${compensationModel === 'gifting'
                                                    ? 'border-teal-500 bg-teal-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${compensationModel === 'gifting'
                                                        ? 'border-teal-500 bg-teal-500'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {compensationModel === 'gifting' && (
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                                </svg>
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">Gifting Only</h3>
                                            <p className="text-sm text-gray-600">Product exchange without cash payment.</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Budget Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        TOTAL BUDGET CAP
                                        <span className="ml-2 text-gray-400 font-normal text-xs">(USD)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                                        <input
                                            type="number"
                                            placeholder="5,000"
                                            className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                                        />
                                    </div>
                                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-sm text-blue-800">
                                                <span className="font-semibold">Based on your category,</span> recommended budget for 10 micro-influencers is <span className="font-bold">$3,500 - $6,000</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Campaign Duration */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        CAMPAIGN DURATION
                                    </label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-2">Start Date</label>
                                            <input
                                                type="date"
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-2">End Date</label>
                                            <input
                                                type="date"
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        ← Back
                    </button>

                    <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Draft
                    </button>

                    <button
                        onClick={() => setStep(Math.min(4, step + 1))}
                        className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center gap-2"
                    >
                        Next Step
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
