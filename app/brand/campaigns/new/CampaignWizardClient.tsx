'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaignFlow, updateCampaignFlow } from '../flow-actions';

type WizardProps = {
    brandId: string;
    initialData?: any;
    campaignId?: string;
};

export default function CampaignWizardClient({ brandId, initialData, campaignId }: WizardProps) {
    const router = useRouter();
    const action = initialData ? updateCampaignFlow : createCampaignFlow;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action, null);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        requirements: initialData?.requirements || '',
        budget: String(initialData?.budget || 50000),
        influencerType: 'MICRO',
        platform: initialData?.platform || 'Instagram',
        location: initialData?.location || 'India',
        niche: initialData?.niche || '',
        engagementMin: String(initialData?.engagementMin ?? 5),
        engagementMax: String(initialData?.engagementMax ?? 10),
        startDate: initialData?.startDate
            ? new Date(initialData.startDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        endDate: initialData?.endDate
            ? new Date(initialData.endDate).toISOString().split('T')[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const canProceed = useMemo(() => {
        if (step === 1) return formData.title.trim().length > 2;
        if (step === 2) return Number(formData.budget) >= 10000 && !!formData.platform && !!formData.location;
        return true;
    }, [formData, step]);

    useEffect(() => {
        if (!state?.success) return;
        const timer = setTimeout(() => {
            router.push(`/brand/campaigns/${state.campaignId}/match`);
        }, 300);
        return () => clearTimeout(timer);
    }, [router, state?.campaignId, state?.success]);

    const updateField = (name: keyof typeof formData, value: string) =>
        setFormData((prev) => ({ ...prev, [name]: value }));

    return (
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 pb-32">
            <div className="mb-8 flex items-center justify-between">
                {['Setup', 'Match Filters', 'Review'].map((label, idx) => (
                    <div key={label} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${step >= idx + 1 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {idx + 1}
                        </div>
                        <span className={`text-sm font-semibold ${step >= idx + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                        {idx < 2 && <div className="w-10 h-px bg-gray-200" />}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="brandId" value={brandId} />
                    {campaignId && <input type="hidden" name="campaignId" value={campaignId} />}
                    {Object.entries(formData).map(([key, value]) => (
                        <input key={key} type="hidden" name={key} value={value} />
                    ))}

                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Campaign Setup</h2>
                                <p className="text-sm text-gray-500">Define the campaign brief for the project manager and creators.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Campaign Title</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                    placeholder="Summer Product Launch"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
                                    placeholder="What is the core objective and context?"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Deliverable Notes</label>
                                <textarea
                                    value={formData.requirements}
                                    onChange={(e) => updateField('requirements', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
                                    placeholder="Mention must-have talking points, CTA, timeline, and content format."
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Match Filters</h2>
                                <p className="text-sm text-gray-500">Only micro influencers (10K-500K) are matched. Pricing is calculated internally.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Total Campaign Budget</label>
                                <input
                                    type="number"
                                    min={10000}
                                    value={formData.budget}
                                    onChange={(e) => updateField('budget', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Influencer Type</label>
                                    <input
                                        value="Micro (10K-500K)"
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Platform</label>
                                    <select
                                        value={formData.platform}
                                        onChange={(e) => updateField('platform', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                    >
                                        <option>Instagram</option>
                                        <option>YouTube</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Location</label>
                                    <input
                                        value={formData.location}
                                        onChange={(e) => updateField('location', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                        placeholder="India, Mumbai, Delhi NCR"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Niche</label>
                                    <input
                                        value={formData.niche}
                                        onChange={(e) => updateField('niche', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                        placeholder="Fashion, Fitness, Tech"
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Engagement Min (%)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        step="0.1"
                                        value={formData.engagementMin}
                                        onChange={(e) => updateField('engagementMin', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Engagement Max (%)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        step="0.1"
                                        value={formData.engagementMax}
                                        onChange={(e) => updateField('engagementMax', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Review</h2>
                            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 text-sm space-y-2">
                                <p><span className="font-semibold">Budget:</span> â‚¹{Number(formData.budget || 0).toLocaleString()}</p>
                                <p><span className="font-semibold">Type:</span> Micro influencers only</p>
                                <p><span className="font-semibold">Platform:</span> {formData.platform}</p>
                                <p><span className="font-semibold">Location:</span> {formData.location}</p>
                                <p><span className="font-semibold">Niche:</span> {formData.niche || 'Any'}</p>
                                <p><span className="font-semibold">Engagement:</span> {formData.engagementMin}% - {formData.engagementMax}%</p>
                                <p className="text-gray-600">
                                    System will auto-match influencers and internal pricing will be applied after you select creators.
                                </p>
                            </div>
                        </div>
                    )}

                    {state?.error && <div className="text-sm font-semibold text-red-600">{state.error}</div>}
                    {state?.success && <div className="text-sm font-semibold text-green-600">Campaign saved. Redirecting to matches...</div>}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => (step === 1 ? router.back() : setStep((prev) => prev - 1))}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            Back
                        </button>
                        {step < 3 ? (
                            <button
                                type="button"
                                disabled={!canProceed}
                                onClick={() => setStep((prev) => prev + 1)}
                                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold disabled:opacity-40"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-40"
                            >
                                {isPending ? 'Saving...' : 'Create & Match'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </main>
    );
}

