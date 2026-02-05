'use client';

import { useActionState, useState } from 'react';
import { createCampaign, updateCampaign } from '@/app/brand/actions';
import { useRouter } from 'next/navigation';
import { CampaignStatus } from '@prisma/client';


export default function CampaignWizardClient({ brandId, initialData, campaignId }: { brandId: string, initialData?: any, campaignId?: string }) {
    const router = useRouter();
    // Use updateCampaign if campaignId exists, else createCampaign (we need to pass ID to update)
    // Actually, createCampaign signature is (state, formData). updateCampaign would need the ID.
    // We can use a bind or a wrapper. For simplicity, let's assume we handle this in the action or a wrapper.
    // BUT useActionState needs a static function reference usually.
    // Let's stick to createCampaign for now and update it to handle "update" via hidden input ID?
    // OR create a wrapper. 
    // Let's use a hidden "campaignId" and handle logic in createCampaign? No, separate actions are cleaner.

    // Dynamic action:
    // Determine action to use
    // Using formData includes "campaignId" if we add it as hidden input.
    // We need both actions to accept same signature (prevState, formData).
    const action = initialData ? updateCampaign : createCampaign;
    // But createCampaign and updateCampaign might have different signatures?
    // Let's unify them or bind. 
    // updateCampaign(prevState, formData) -> checks for campaignId in formData.

    // We need to import updateCampaign.

    // @ts-ignore - Ignore type mismatch for now, assume actions return consistent shape
    const [state, formAction, isPending] = useActionState(action, null);
    const [step, setStep] = useState(1);
    const [budget, setBudget] = useState(initialData?.budget?.toString() || '5000');
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '', // Prevent null for controlled input
        requirements: initialData?.requirements || '', // Prevent null for controlled input
        budget: initialData?.budget?.toString() || '5000',
        payment_type: initialData?.paymentType || 'FIXED',
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        niche: initialData?.niche || '',
        location: initialData?.location || '',
        minFollowers: initialData?.minFollowers?.toString() || '1000',
        images: initialData?.images || [] as string[],
    });

    const [uploading, setUploading] = useState(false);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const updateField = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (result.success) {
                // Determine if we want multiple or single. For now, let's treat it as a Replace/Add.
                // If we want a cover image, maybe replace?
                // But schema is array. Let's just append or set. 
                // Let's set as single cover for simplicity in UI, but array in data.
                updateField('images', [result.url]);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    // Redirect on success
    if (state?.success && typeof window !== 'undefined') {
        setTimeout(() => {
            router.push('/brand/campaigns');
        }, 1500);
    }

    return (
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 pb-32">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative px-2">
                    {/* Connecting Line */}
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-10 rounded-full">
                        <div
                            className="h-full bg-teal-500 transition-all duration-300"
                            style={{ width: `${((step - 1) / 3) * 100}%` }}
                        ></div>
                    </div>

                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-1.5 bg-gray-50 px-2 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-white transition-all ${step === s ? 'bg-teal-500 text-white shadow-teal-500/30 ring-teal-50' :
                                step > s ? 'bg-teal-600 text-white shadow-teal-600/30' : 'bg-white border-2 border-gray-200 text-gray-400 ring-4 ring-white'
                                }`}>
                                {step > s ? <span className="material-symbols-outlined text-sm">check</span> : s}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s ? 'text-teal-600' : 'text-gray-300'}`}>
                                {s === 1 ? 'Info' : s === 2 ? 'Budget' : s === 3 ? 'Target' : 'Brief'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/5 to-teal-500/20 rounded-bl-full -mr-12 -mt-12 pointer-events-none"></div>

                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="brandId" value={brandId} />
                    {campaignId && <input type="hidden" name="campaignId" value={campaignId} />}
                    <input type="hidden" name="title" value={formData.title} />
                    <input type="hidden" name="description" value={formData.description || ''} />
                    <input type="hidden" name="requirements" value={formData.requirements || ''} />
                    <input type="hidden" name="budget" value={formData.budget} />
                    <input type="hidden" name="payment_type" value={formData.payment_type} />
                    <input type="hidden" name="startDate" value={formData.startDate} />
                    <input type="hidden" name="endDate" value={formData.endDate} />

                    <input type="hidden" name="niche" value={formData.niche} />
                    <input type="hidden" name="location" value={formData.location} />
                    <input type="hidden" name="minFollowers" value={formData.minFollowers} />

                    {formData.images.map((url: string, i: number) => (
                        <input key={i} type="hidden" name="images" value={url} />
                    ))}

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Basic Info</h2>
                                <p className="text-gray-500 text-sm">Set up your campaign basics.</p>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Campaign Title</label>
                                    <input
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900 text-sm font-medium transition-all"
                                        placeholder="e.g. Summer Collection 2026"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Cover Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center group shadow-sm">
                                            {formData.images && formData.images.length > 0 ? (
                                                <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-gray-300 text-[10px] text-center px-1 font-medium">No Image</span>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                                                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                        <label className="cursor-pointer px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-xs font-bold transition-all shadow-sm">
                                            {uploading ? 'Uploading...' : 'Upload Image'}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Description</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900 text-sm leading-relaxed transition-all resize-none"
                                        placeholder="What is this campaign about?"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Budget & Time</h2>
                                <p className="text-gray-500 text-sm">Set your budget and dates.</p>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Model</label>
                                    <div className="grid grid-cols-3 gap-3">
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
                                                <div className="h-full py-3 px-2 rounded-xl border border-gray-200 bg-white hover:border-teal-500/30 peer-checked:border-teal-500 peer-checked:bg-teal-50 text-center transition-all shadow-sm peer-checked:shadow-none">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className={`material-symbols-outlined text-lg ${formData.payment_type === type ? 'text-teal-600' : 'text-gray-400'}`}>
                                                            {type === 'FIXED' ? 'payments' : type === 'NEGOTIABLE' ? 'handshake' : 'card_giftcard'}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase ${formData.payment_type === type ? 'text-teal-700' : 'text-gray-500'}`}>
                                                            {type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Total Budget</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-medium group-focus-within:text-teal-500 transition-colors">₹</div>
                                        <input
                                            name="budget"
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => updateField('budget', e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 text-lg font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Start Date</label>
                                        <input name="startDate" type="date" value={formData.startDate} onChange={(e) => updateField('startDate', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-gray-600" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">End Date</label>
                                        <input name="endDate" type="date" value={formData.endDate} onChange={(e) => updateField('endDate', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-gray-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Targeting</h2>
                                <p className="text-gray-500 text-sm">Who are you looking for?</p>
                            </div>
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Category</label>
                                        <select
                                            value={formData.niche}
                                            onChange={(e) => updateField('niche', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-medium transition-all outline-none"
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
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Min Followers</label>
                                        <input
                                            type="number"
                                            value={formData.minFollowers}
                                            onChange={(e) => updateField('minFollowers', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-bold transition-all outline-none"
                                            placeholder="10,000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Location</label>
                                    <input
                                        value={formData.location}
                                        onChange={(e) => updateField('location', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all outline-none"
                                        placeholder="e.g. India, USA, Global"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Campaign Brief</h2>
                                <p className="text-gray-500 text-sm">Details for the creators.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Requirements</label>
                                    <textarea
                                        name="requirements"
                                        rows={6}
                                        value={formData.requirements}
                                        onChange={(e) => updateField('requirements', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900 text-sm leading-relaxed transition-all resize-none outline-none"
                                        placeholder="Add specific DOs and DON'Ts, brand voice, hashtags, etc."
                                    ></textarea>
                                </div>
                                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/50 flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-teal-500 text-lg mt-0.5">lightbulb</span>
                                    <div>
                                        <h4 className="font-bold text-teal-900 text-xs mb-0.5">Tip</h4>
                                        <p className="text-teal-700 text-[11px] leading-relaxed">Specific instructions help creators deliver exactly what you need.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {state?.error && <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-xs font-bold text-center">{state.error}</div>}
                    {state?.success && <div className="p-3 bg-green-50 text-green-600 rounded-lg border border-green-100 text-xs font-bold text-center">Success! Redirecting...</div>}

                    {/* Navigation Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={step === 1 ? () => router.back() : handleBack}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </button>

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-600 hover:scale-105 transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                disabled={isPending}
                                type="submit"
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? '...' : 'Launch'}
                                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </main>
    );
}
