'use client';

import { useActionState, useState } from 'react';
import { createCampaign } from '@/app/brand/actions';
import { useRouter } from 'next/navigation';
import { CampaignStatus } from '@prisma/client';

export default function CampaignWizardClient({ brandId }: { brandId: string }) {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(createCampaign, null);
    const [step, setStep] = useState(1);
    const [budget, setBudget] = useState('5000');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        budget: '5000',
        payment_type: 'FIXED',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        niche: '',
        location: '',
        minFollowers: '1000',
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const updateField = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Redirect on success
    if (state?.success && typeof window !== 'undefined') {
        setTimeout(() => {
            router.push('/brand/campaigns');
        }, 1500);
    }

    return (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 pb-32">
            {/* Progress Steps */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative px-4">
                    {/* Connecting Line */}
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-10 rounded-full">
                        <div
                            className="h-full bg-teal-500 transition-all duration-300"
                            style={{ width: `${((step - 1) / 3) * 100}%` }}
                        ></div>
                    </div>

                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2 bg-gray-50 px-2 z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white transition-all ${step === s ? 'bg-teal-500 text-white shadow-teal-500/30' :
                                step > s ? 'bg-teal-600 text-white shadow-teal-600/30' : 'bg-white border-2 border-gray-200 text-gray-500 ring-4 ring-white'
                                }`}>
                                {step > s ? <span className="material-symbols-outlined text-xl">check</span> : s}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${step >= s ? 'text-teal-500' : 'text-gray-400'}`}>
                                {s === 1 ? 'Basic Info' : s === 2 ? 'Budget' : s === 3 ? 'Targeting' : 'Brief'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/5 to-teal-500/20 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>

                <form action={formAction} className="space-y-10">
                    <input type="hidden" name="brandId" value={brandId} />

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Basic Information</h2>
                                <p className="text-gray-500 text-lg">Tell us about your campaign objectives.</p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Campaign Title</label>
                                    <input
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 font-medium"
                                        placeholder="e.g. Summer Collection 2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">About the Campaign</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900"
                                        placeholder="Describe what you want to achieve..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Budget & Timeline</h2>
                                <p className="text-gray-500 text-lg">Define financial scope and duration.</p>
                            </div>
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">Compensation Model</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {['FIXED', 'NEGOTIABLE', 'GIFTING'].map((type) => (
                                            <label key={type} className="cursor-pointer group relative">
                                                <input
                                                    className="peer sr-only"
                                                    name="payment_type"
                                                    type="radio"
                                                    value={type}
                                                    checked={formData.payment_type === type}
                                                    onChange={(e) => updateField('payment_type', e.target.value)}
                                                />
                                                <div className="h-full p-5 rounded-lg border border-gray-200 bg-white hover:border-teal-500/50 peer-checked:border-teal-500 peer-checked:bg-teal-500/5 transition-all">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="material-symbols-outlined text-teal-500">{type === 'FIXED' ? 'payments' : type === 'NEGOTIABLE' ? 'handshake' : 'card_giftcard'}</span>
                                                        <span className="font-bold text-gray-900">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Total Budget</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-medium">$</div>
                                        <input
                                            name="budget"
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => updateField('budget', e.target.value)}
                                            className="w-full pl-10 pr-4 py-4 text-2xl font-bold bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Start Date</label>
                                        <input name="startDate" type="date" value={formData.startDate} onChange={(e) => updateField('startDate', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">End Date</label>
                                        <input name="endDate" type="date" value={formData.endDate} onChange={(e) => updateField('endDate', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Influencer Targeting</h2>
                                <p className="text-gray-500 text-lg">Specify the kind of creators you're looking for.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 uppercase mb-2">Category / Niche</label>
                                    <select
                                        value={formData.niche}
                                        onChange={(e) => updateField('niche', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="fashion">Fashion & Style</option>
                                        <option value="tech">Technology</option>
                                        <option value="fitness">Health & Fitness</option>
                                        <option value="food">Food & Dining</option>
                                        <option value="gaming">Gaming</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 uppercase mb-2">Follower Range (Min)</label>
                                    <input
                                        type="number"
                                        value={formData.minFollowers}
                                        onChange={(e) => updateField('minFollowers', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-bold"
                                        placeholder="10,000"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-900 uppercase mb-2">Target Location</label>
                                    <input
                                        value={formData.location}
                                        onChange={(e) => updateField('location', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        placeholder="e.g. India, USA, Global"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Campaign Brief</h2>
                                <p className="text-gray-500 text-lg">Finalize the instructions and requirements.</p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Specific Requirements</label>
                                    <textarea
                                        name="requirements"
                                        rows={6}
                                        value={formData.requirements}
                                        onChange={(e) => updateField('requirements', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900"
                                        placeholder="Add specific DOs and DON'Ts, brand voice, hashtags, etc."
                                    ></textarea>
                                </div>
                                <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 flex gap-4">
                                    <span className="material-symbols-outlined text-teal-500">lightbulb</span>
                                    <div>
                                        <h4 className="font-bold text-teal-900 text-sm mb-1">Expert Tip</h4>
                                        <p className="text-teal-700 text-xs leading-relaxed">Detailed briefs lead to 40% higher quality content. Be clear about the "hook" and the call to action.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {state?.error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium">{state.error}</div>}
                    {state?.success && <div className="p-4 bg-green-50 text-green-600 rounded-lg border border-green-100 text-sm font-medium">Campaign Created! Redirecting...</div>}

                    {/* Navigation Footer */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 py-4 px-6 md:px-12 backdrop-blur-sm bg-white/90">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <button
                                type="button"
                                onClick={step === 1 ? () => router.back() : handleBack}
                                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm px-4 py-2"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                {step === 1 ? 'Cancel' : 'Back'}
                            </button>

                            <div className="flex items-center gap-4">
                                {step < 4 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm px-8 py-3 rounded-lg shadow-lg hover:shadow-teal-500/30 transition-all"
                                    >
                                        Continue
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                ) : (
                                    <button
                                        disabled={isPending}
                                        type="submit"
                                        className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-sm px-10 py-3 rounded-lg shadow-xl hover:shadow-teal-500/40 transition-all disabled:opacity-50"
                                    >
                                        {isPending ? 'Launching...' : 'Launch Campaign'}
                                        <span className="material-symbols-outlined text-lg">rocket_launch</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
