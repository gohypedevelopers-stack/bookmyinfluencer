'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Building2, Check, Compass, Globe, Instagram, Megaphone, Smartphone, Target, Wallet, Youtube } from 'lucide-react';
import { createCampaignFlow, updateCampaignFlow } from '../flow-actions';
import { SHARED_CREATOR_FOLLOWER_RANGES, SHARED_NICHE_LABELS, SHARED_PLATFORM_OPTIONS } from '@/lib/onboarding-taxonomy';

type WizardProps = { brandId: string; initialData?: any; campaignId?: string };

const campaignTypes = [
    { label: 'Product Promotion', icon: Megaphone },
    { label: 'Brand Awareness', icon: Target },
    { label: 'App Installs', icon: Smartphone },
    { label: 'Event Promotion', icon: Building2 },
    { label: 'Affiliate Marketing', icon: Wallet },
    { label: 'Other', icon: Compass },
];
const popularLocations = ['Pan India', 'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Gujarat', 'Tamil Nadu', 'West Bengal'];
const budgetPresets = [50000, 100000, 200000, 500000];
const followerRanges = SHARED_CREATOR_FOLLOWER_RANGES.filter((item) => item.min >= 10000);
const steps = ['Campaign Type', 'Budget', 'Location', 'Niche', 'Target Creators', 'Brief', 'Review'];

function formatMoney(value: number) {
    return `Rs.${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.max(0, value || 0))}`;
}

function getInitialRange(initialData?: any) {
    const match = String(initialData?.influencerType || '').match(/^RANGE_(\d+)_(\d+)$/i);
    if (match) return { min: Math.max(10000, Number(match[1])), max: Number(match[2]) };
    return followerRanges.find((item) => item.max === Number(initialData?.minFollowers || 20000)) || followerRanges[0];
}

function getRecommendedEngagement(platform: string, followerMax: number) {
    if (platform === 'YouTube') {
        if (followerMax <= 50_000) return { min: 3, max: 8 };
        if (followerMax <= 100_000) return { min: 2, max: 7 };
        return { min: 2, max: 6 };
    }

    if (followerMax <= 50_000) return { min: 5, max: 12 };
    if (followerMax <= 100_000) return { min: 4, max: 10 };
    return { min: 3, max: 8 };
}

export default function CampaignWizardClient({ brandId, initialData, campaignId }: WizardProps) {
    const router = useRouter();
    const action = initialData ? updateCampaignFlow : createCampaignFlow;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action, null);
    const [step, setStep] = useState(0);
    const initialRange = getInitialRange(initialData);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        campaignType: '',
        description: initialData?.description || '',
        requirements: initialData?.requirements || '',
        budget: String(initialData?.budget || 200000),
        platform: initialData?.platform || 'Instagram',
        location: initialData?.location || 'Pan India',
        niche: initialData?.niche || '',
        followerMin: String(initialRange.min),
        followerMax: String(initialRange.max),
        engagementMin: String(initialData?.engagementMin ?? 5),
        engagementMax: String(initialData?.engagementMax ?? 10),
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    const [customLocation, setCustomLocation] = useState(popularLocations.includes(initialData?.location || '') ? '' : (initialData?.location || ''));
    const [customNiche, setCustomNiche] = useState(SHARED_NICHE_LABELS.includes((initialData?.niche || '') as any) ? '' : (initialData?.niche || ''));

    const updateField = (key: keyof typeof formData, value: string) => setFormData((prev) => ({ ...prev, [key]: value }));
    const selectedRange = useMemo(() => followerRanges.find((item) => item.min === Number(formData.followerMin) && item.max === Number(formData.followerMax)) || followerRanges[0], [formData.followerMin, formData.followerMax]);
    const estimatedCreators = useMemo(() => {
        const budget = Number(formData.budget || 0);
        const target = Number(formData.followerMax || 0);
        return budget > 0 && target > 0 ? Math.floor(budget / target) : 0;
    }, [formData.budget, formData.followerMax]);

    useEffect(() => {
        if (!state?.success) return;
        const timer = setTimeout(() => router.push(`/brand/campaigns/${state.campaignId}/match`), 300);
        return () => clearTimeout(timer);
    }, [router, state?.campaignId, state?.success]);

    useEffect(() => {
        if (!formData.title && formData.campaignType) updateField('title', formData.campaignType);
    }, [formData.campaignType, formData.title]);

    useEffect(() => {
        const recommended = getRecommendedEngagement(formData.platform, Number(formData.followerMax || 0));
        setFormData((prev) => {
            const nextMin = String(recommended.min);
            const nextMax = String(recommended.max);
            if (prev.engagementMin === nextMin && prev.engagementMax === nextMax) return prev;
            return { ...prev, engagementMin: nextMin, engagementMax: nextMax };
        });
    }, [formData.platform, formData.followerMax]);

    const canProceed = useMemo(() => {
        if (step === 0) return !!formData.campaignType;
        if (step === 1) return Number(formData.budget) > 0;
        if (step === 2) return !!formData.location.trim();
        if (step === 3) return !!formData.niche.trim();
        if (step === 4) return !!formData.platform && Number(formData.engagementMin) <= Number(formData.engagementMax);
        if (step === 5) return formData.title.trim().length > 2 && formData.requirements.trim().length > 10;
        return true;
    }, [formData, step]);

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_40%,#eef4ff_100%)]">
            <div className="mx-auto max-w-[1380px] px-4 py-8 md:px-6">
                <div className="mb-6 rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#020617_0%,#0f172a_48%,#4338ca_100%)] p-6 text-white shadow-[0_32px_80px_-40px_rgba(15,23,42,0.6)]">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">Campaign Setup</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight">{initialData ? 'Edit Campaign' : 'Create New Campaign'}</h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate-200">Set campaign type, budget, targeting, and brief, then review everything before moving ahead.</p>
                </div>

                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.25)] md:p-8">
                        <div className="mb-8 flex flex-wrap items-center gap-3">
                            {steps.map((label, idx) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${idx <= step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{idx < step ? <Check className="h-4 w-4" /> : idx + 1}</div>
                                    <span className={`text-sm font-semibold ${idx <= step ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
                                </div>
                            ))}
                        </div>

                        <form action={formAction} className="space-y-8">
                            <input type="hidden" name="brandId" value={brandId} />
                            {campaignId && <input type="hidden" name="campaignId" value={campaignId} />}
                            {Object.entries(formData).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Step {step + 1} of {steps.length}</p>
                                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{steps[step]}</h2>
                            </div>

                            {step === 0 && <div className="grid gap-4 md:grid-cols-2">
                                {campaignTypes.map((option) => {
                                    const Icon = option.icon;
                                    const active = formData.campaignType === option.label;
                                    return <button key={option.label} type="button" onClick={() => updateField('campaignType', option.label)} className={`rounded-[26px] border p-5 text-left transition ${active ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100/60' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'}`}>
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon className="h-5 w-5" /></div>
                                        <p className="mt-4 text-lg font-black text-slate-950">{option.label}</p>
                                    </button>;
                                })}
                            </div>}

                            {step === 1 && <div className="space-y-6">
                                <div className="grid gap-3 sm:grid-cols-4">
                                    {budgetPresets.map((amount) => <button key={amount} type="button" onClick={() => updateField('budget', String(amount))} className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${Number(formData.budget) === amount ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700'}`}>{formatMoney(amount)}</button>)}
                                </div>
                                <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Budget Amount</label>
                                    <div className="relative mt-3">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">Rs.</span>
                                        <input type="number" min={1} step={1000} value={formData.budget} onChange={(e) => updateField('budget', e.target.value)} className="w-full rounded-[22px] border border-slate-200 bg-white py-4 pl-14 pr-4 text-xl font-black text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                                    </div>
                                </div>
                            </div>}

                            {step === 2 && <div className="space-y-6">
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {popularLocations.map((location) => <button key={location} type="button" onClick={() => { setCustomLocation(''); updateField('location', location); }} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${formData.location === location ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700'}`}>{location}</button>)}
                                </div>
                                <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Custom Location</label>
                                    <div className="relative mt-3">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input value={customLocation} onChange={(e) => { setCustomLocation(e.target.value); updateField('location', e.target.value); }} className="w-full rounded-[22px] border border-slate-200 bg-white py-4 pl-12 pr-4 font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Mumbai, NCR, Haryana..." />
                                    </div>
                                </div>
                            </div>}

                            {step === 3 && <div className="space-y-6">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {SHARED_NICHE_LABELS.map((niche) => <button key={niche} type="button" onClick={() => { setCustomNiche(''); updateField('niche', niche); }} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${formData.niche === niche ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700'}`}>{niche}</button>)}
                                </div>
                                <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Custom Niche</label>
                                    <div className="relative mt-3">
                                        <Compass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input value={customNiche} onChange={(e) => { setCustomNiche(e.target.value); updateField('niche', e.target.value); }} className="w-full rounded-[22px] border border-slate-200 bg-white py-4 pl-12 pr-4 font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Custom niche" />
                                    </div>
                                </div>
                            </div>}

                            {step === 4 && <div className="space-y-6">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {SHARED_PLATFORM_OPTIONS.map((platform) => {
                                        const active = formData.platform === platform.label;
                                        const Icon = platform.id === 'instagram' ? Instagram : Youtube;
                                        return <button key={platform.id} type="button" onClick={() => updateField('platform', platform.label)} className={`rounded-[24px] border p-5 text-left transition ${active ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100/50' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'}`}>
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon className="h-5 w-5" /></div>
                                            <p className="mt-4 text-lg font-black text-slate-950">{platform.label}</p>
                                        </button>;
                                    })}
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {followerRanges.map((range) => {
                                        const active = selectedRange.min === range.min && selectedRange.max === range.max;
                                        return <button key={`${range.min}-${range.max}`} type="button" onClick={() => { updateField('followerMin', String(range.min)); updateField('followerMax', String(range.max)); }} className={`rounded-2xl border px-4 py-3 text-left transition ${active ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700'}`}>
                                            <p className="font-black">{range.label}</p>
                                            <p className="mt-1 text-xs font-semibold opacity-80">{formatMoney(range.max)}+ budget</p>
                                        </button>;
                                    })}
                                </div>
                            </div>}

                            {step === 5 && <div className="space-y-6">
                                <input value={formData.title} onChange={(e) => updateField('title', e.target.value)} className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-lg font-black text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Campaign title" />
                                <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} rows={3} className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-base font-medium text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Campaign description" />
                                <textarea value={formData.requirements} onChange={(e) => updateField('requirements', e.target.value)} rows={5} className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-base font-medium text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Talking points, CTA, deliverables, revision notes, timelines..." />
                            </div>}

                            {step === 6 && <div className="grid gap-4 md:grid-cols-2">
                                <ReviewTile label="Campaign Type" value={formData.campaignType || 'Pending'} />
                                <ReviewTile label="Budget" value={formatMoney(Number(formData.budget || 0))} />
                                <ReviewTile label="Location" value={formData.location || 'Pending'} />
                                <ReviewTile label="Niche" value={formData.niche || 'Pending'} />
                                <ReviewTile label="Platform" value={formData.platform || 'Pending'} />
                                <ReviewTile label="Follower Range" value={selectedRange.label} />
                                <ReviewTile label="Quality Filter" value={`${formData.engagementMin}% - ${formData.engagementMax}% auto-selected`} />
                                <ReviewTile label="Estimated Creators" value={String(Math.max(0, estimatedCreators))} />
                            </div>}

                            {state?.error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.error}</div>}
                            {state?.success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Campaign saved successfully.</div>}

                            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                                <button type="button" onClick={() => step === 0 ? router.back() : setStep((prev) => prev - 1)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"><ArrowLeft className="h-4 w-4" />Back</button>
                                {step < steps.length - 1 ? (
                                    <button type="button" onClick={() => setStep((prev) => prev + 1)} disabled={!canProceed} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-40">Continue<ArrowRight className="h-4 w-4" /></button>
                                ) : (
                                    <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:opacity-40">{isPending ? 'Saving...' : initialData ? 'Update Campaign' : 'Create Campaign'}</button>
                                )}
                            </div>
                        </form>
                    </div>

                    <aside className="xl:sticky xl:top-6">
                        <div className="space-y-5 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.25)]">
                            <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#312e81_100%)] p-5 text-white">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Live Summary</p>
                                <h3 className="mt-3 text-2xl font-black">{formData.title || formData.campaignType || 'New Campaign'}</h3>
                                <p className="mt-2 text-sm text-slate-200">{formData.campaignType || 'Choose campaign type'} | {formData.platform}</p>
                            </div>
                            <ReviewTile label="Budget" value={formatMoney(Number(formData.budget || 0))} />
                            <ReviewTile label="Location" value={formData.location || 'Pending'} />
                            <ReviewTile label="Niche" value={formData.niche || 'Pending'} />
                            <ReviewTile label="Range" value={selectedRange.label} />
                            <ReviewTile label="Estimated Creators" value={String(Math.max(0, estimatedCreators))} />
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

function ReviewTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
        </div>
    );
}
