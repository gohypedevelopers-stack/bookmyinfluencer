'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaignFlow, updateCampaignFlow } from '../flow-actions';

type WizardProps = {
    brandId: string;
    initialData?: any;
    campaignId?: string;
};

type FollowerBand = {
    label: string;
    min: number;
    max: number;
};

const followerBands: FollowerBand[] = [
    { label: '0-10K', min: 0, max: 10_000 },
    { label: '10-20K', min: 10_000, max: 20_000 },
    { label: '20-30K', min: 20_000, max: 30_000 },
    { label: '30-40K', min: 30_000, max: 40_000 },
    { label: '40-50K', min: 40_000, max: 50_000 },
    { label: '50-60K', min: 50_000, max: 60_000 },
    { label: '60-70K', min: 60_000, max: 70_000 },
    { label: '70-80K', min: 70_000, max: 80_000 },
    { label: '80-90K', min: 80_000, max: 90_000 },
    { label: '90-100K', min: 90_000, max: 100_000 },
    { label: '100-200K', min: 100_000, max: 200_000 },
    { label: '200-300K', min: 200_000, max: 300_000 },
    { label: '300-400K', min: 300_000, max: 400_000 },
    { label: '400-500K', min: 400_000, max: 500_000 },
];

function parseFollowerBandFromCampaign(initialData?: any): FollowerBand {
    const typeValue = String(initialData?.influencerType || '');
    const match = typeValue.match(/^RANGE_(\d+)_(\d+)$/i);
    if (match) {
        const min = Number(match[1]);
        const max = Number(match[2]);
        const existing = followerBands.find((band) => band.min === min && band.max === max);
        if (existing) return existing;
        return {
            label: `${Math.floor(min / 1000)}-${Math.floor(max / 1000)}K`,
            min,
            max,
        };
    }

    const fallbackByMin = Number(initialData?.minFollowers || 10_000);
    const existingByMax = followerBands.find((band) => band.max === fallbackByMin);
    return existingByMax || followerBands[1];
}

export default function CampaignWizardClient({ brandId, initialData, campaignId }: WizardProps) {
    const router = useRouter();
    const action = initialData ? updateCampaignFlow : createCampaignFlow;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action, null);
    const [step, setStep] = useState(1);

    const initialBand = parseFollowerBandFromCampaign(initialData);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        requirements: initialData?.requirements || '',
        budget: String(initialData?.budget || 200000),
        platform: initialData?.platform || 'Instagram',
        location: initialData?.location || 'India',
        niche: initialData?.niche || '',
        followerMin: String(initialBand.min),
        followerMax: String(initialBand.max),
        engagementMin: String(initialData?.engagementMin ?? 5),
        engagementMax: String(initialData?.engagementMax ?? 10),
        startDate: initialData?.startDate
            ? new Date(initialData.startDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        endDate: initialData?.endDate
            ? new Date(initialData.endDate).toISOString().split('T')[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const selectedBand = useMemo(
        () => followerBands.find((band) => band.min === Number(formData.followerMin) && band.max === Number(formData.followerMax)) || initialBand,
        [formData.followerMin, formData.followerMax, initialBand]
    );

    const estimatedCreators = useMemo(() => {
        const budget = Number(formData.budget || 0);
        const followerTarget = Number(formData.followerMax || 0);
        if (!budget || !followerTarget) return 0;
        return Math.floor(budget / followerTarget);
    }, [formData.budget, formData.followerMax]);

    const canProceed = useMemo(() => {
        if (step === 1) return formData.title.trim().length > 2;
        if (step === 2) {
            const budget = Number(formData.budget || 0);
            const followerTarget = Number(formData.followerMax || 0);
            return budget >= followerTarget && !!formData.platform && !!formData.location;
        }
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

    const updateFollowerBand = (value: string) => {
        const [min, max] = value.split('_').map((item) => Number(item));
        if (Number.isFinite(min) && Number.isFinite(max)) {
            setFormData((prev) => ({ ...prev, followerMin: String(min), followerMax: String(max) }));
        }
    };

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
                                <p className="text-sm text-gray-500">System uses Rs.1 per follower logic. Budget is split by selected follower band to calculate creator count.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Target Follower Band</label>
                                <select
                                    value={`${selectedBand.min}_${selectedBand.max}`}
                                    onChange={(e) => updateFollowerBand(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                >
                                    {followerBands.map((band) => (
                                        <option key={`${band.min}_${band.max}`} value={`${band.min}_${band.max}`}>
                                            {band.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Total Campaign Budget</label>
                                <input
                                    type="number"
                                    min={Number(formData.followerMax || 0)}
                                    value={formData.budget}
                                    onChange={(e) => updateField('budget', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                />
                                <p className="text-xs mt-1 text-indigo-600 font-semibold">
                                    Estimated creators from budget: {estimatedCreators > 0 ? estimatedCreators : 0} (Budget / {selectedBand.max.toLocaleString()})
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Location</label>
                                    <input
                                        value={formData.location}
                                        onChange={(e) => updateField('location', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                        placeholder="India, Mumbai, Delhi NCR"
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Niche</label>
                                    <input
                                        value={formData.niche}
                                        onChange={(e) => updateField('niche', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                        placeholder="Fashion, Fitness, Tech"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Target Band</label>
                                    <input
                                        value={`${selectedBand.label} (${selectedBand.min.toLocaleString()}-${selectedBand.max.toLocaleString()})`}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600"
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
                                <p><span className="font-semibold">Budget:</span> Rs.{Number(formData.budget || 0).toLocaleString()}</p>
                                <p><span className="font-semibold">Follower Band:</span> {selectedBand.label}</p>
                                <p><span className="font-semibold">Estimated Creators:</span> {estimatedCreators > 0 ? estimatedCreators : 0}</p>
                                <p><span className="font-semibold">Platform:</span> {formData.platform}</p>
                                <p><span className="font-semibold">Location:</span> {formData.location}</p>
                                <p><span className="font-semibold">Niche:</span> {formData.niche || 'Any'}</p>
                                <p><span className="font-semibold">Engagement:</span> {formData.engagementMin}% - {formData.engagementMax}%</p>
                                <p className="text-gray-600">
                                    Requests will be matched from onboarding filters and routed to creators with 24h response window.
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
                                {isPending ? 'Saving...' : 'Create and Match'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </main>
    );
}
