'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, Building2, Mail, Lock, CheckCircle, ArrowRight, Loader2,
    Check, ChevronLeft, Target, Megaphone, Smartphone, DollarSign, Users,
    Instagram, Youtube, Sparkles, TrendingUp, Globe, Zap, Rocket, X
} from 'lucide-react';
import { registerBrand, sendEmailOtp, verifyEmailOtp } from '@/app/brand/auth-actions';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
    })
};

const CardWrapper = ({ children, stepKey, direction }: { children: React.ReactNode; stepKey: string; direction: number; }) => (
    <motion.div
        key={stepKey}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
        className="flex flex-col h-full"
    >
        {children}
    </motion.div>
);

const NextButton = ({
    label = "Continue",
    onClick,
    disabled,
    loading: btnLoading
}: {
    label?: string;
    onClick: () => void;
    disabled: boolean;
    loading?: boolean;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full py-3 text-white font-bold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-5 shadow-lg shadow-indigo-200/60 hover:shadow-indigo-300/60 hover:scale-[1.01] active:scale-[0.99]" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)" }}
    >
        {btnLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
            <>{label} {(label === "Continue" || label === "Next" || label === "Start Onboarding") ? <ArrowRight size={20} /> : null}</>
        )}
    </button>
);

const TOTAL_STEPS = 12;

// Follower tiers
const followerTiers = [
    { label: "Nano", desc: "1K – 10K followers", badge: "Most Authentic", min: 1000, max: 10000, color: "from-emerald-400 to-teal-500" },
    { label: "Micro", desc: "10K – 100K followers", badge: "High Engagement", min: 10000, max: 100000, color: "from-blue-400 to-cyan-500" },
    { label: "Macro", desc: "100K – 500K followers", badge: "Broad Reach", min: 100000, max: 500000, color: "from-violet-400 to-purple-500" },
    { label: "Mega", desc: "500K+ followers", badge: "Massive Impact", min: 500000, max: 10000000, color: "from-orange-400 to-rose-500" },
];

// Price tiers — differ by collaboration type
const priceTypeMap: Record<string, { label: string; badge: string; min: number; max: number }[]> = {
    'Per Post': [
        { label: '₹500 – ₹2,000', badge: 'Budget Friendly', min: 500, max: 2000 },
        { label: '₹2,000 – ₹10,000', badge: 'Standard', min: 2000, max: 10000 },
        { label: '₹10,000 – ₹50,000', badge: 'Premium', min: 10000, max: 50000 },
        { label: '₹50,000+', badge: 'Elite', min: 50000, max: 1000000 },
    ],
    'Per Story': [
        { label: '₹200 – ₹1,000', badge: 'Budget Friendly', min: 200, max: 1000 },
        { label: '₹1,000 – ₹5,000', badge: 'Standard', min: 1000, max: 5000 },
        { label: '₹5,000 – ₹20,000', badge: 'Premium', min: 5000, max: 20000 },
        { label: '₹20,000+', badge: 'Elite', min: 20000, max: 500000 },
    ],
    'Per Collab': [
        { label: '₹5,000 – ₹25,000', badge: 'Budget Friendly', min: 5000, max: 25000 },
        { label: '₹25,000 – ₹1,00,000', badge: 'Standard', min: 25000, max: 100000 },
        { label: '₹1,00,000 – ₹5,00,000', badge: 'Premium', min: 100000, max: 500000 },
        { label: '₹5,00,000+', badge: 'Elite', min: 500000, max: 10000000 },
    ],
};

const priceTiers = [
    { label: "₹500 – ₹2,000", badge: "Budget Friendly", min: 500, max: 2000 },
    { label: "₹2,000 – ₹10,000", badge: "Standard", min: 2000, max: 10000 },
    { label: "₹10,000 – ₹50,000", badge: "Premium", min: 10000, max: 50000 },
    { label: "₹50,000+", badge: "Elite", min: 50000, max: 1000000 },
]

export default function BrandRegisterPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);

    // Registration data
    const [formData, setFormData] = useState({
        companyName: '',
        industries: [] as string[],
        website: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });

    // Custom industry state
    const [showCustomIndustry, setShowCustomIndustry] = useState(false);
    const [customIndustry, setCustomIndustry] = useState('');

    // Onboarding data
    const [onboardingData, setOnboardingData] = useState({
        brandName: '',
        campaignType: '',
        budget: '',
        minFollowers: 10000,
        maxFollowers: 100000,
        minPricePerPost: 2000,
        maxPricePerPost: 10000,
        platforms: [] as string[],
        creatorType: '',
        campaignGoals: '',
        priceType: 'Per Post',
    });

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timer, setTimer] = useState(0);

    const progressPercentage = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'email' && emailVerified) {
            setEmailVerified(false);
            setOtpSent(false);
            setOtp('');
        }
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const updateOnboarding = useCallback((key: string, value: any) => {
        setOnboardingData(prev => ({ ...prev, [key]: value }));
    }, []);

    const togglePlatform = useCallback((platform: string) => {
        setOnboardingData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform],
        }));
    }, []);

    const requestOtp = async () => {
        if (!formData.email) { setError("Please enter an email address first"); return; }
        setOtpLoading(true); setError('');
        const res = await sendEmailOtp(formData.email);
        if (res.success) { setOtpSent(true); setTimer(60); }
        else { setError(res.error || "Failed to send OTP"); }
        setOtpLoading(false);
    };

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) { setError("Please enter valid 6-digit OTP"); return; }
        setOtpLoading(true); setError('');
        const res = await verifyEmailOtp(formData.email, otp);
        if (res.success) { setEmailVerified(true); setOtpSent(false); }
        else { setError(res.error || "Invalid OTP"); }
        setOtpLoading(false);
    };

    // Final submit: registration + onboarding
    const handleFinalSubmit = async () => {
        setIsSubmitting(true); setError('');

        const fd = new FormData();
        fd.append('companyName', formData.companyName);
        fd.append('email', formData.email);
        fd.append('password', formData.password);
        fd.append('website', formData.website);
        fd.append('industry', formData.industries.join(', '));
        // Onboarding data
        fd.append('brandName', onboardingData.brandName || formData.companyName);
        fd.append('campaignType', onboardingData.campaignType);
        fd.append('campaignBudget', onboardingData.budget);
        fd.append('targetPlatforms', JSON.stringify(onboardingData.platforms));
        fd.append('preferredCreatorType', onboardingData.creatorType);
        fd.append('campaignGoals', onboardingData.campaignGoals);
        fd.append('minFollowers', String(onboardingData.minFollowers));
        fd.append('maxFollowers', String(onboardingData.maxFollowers));
        fd.append('minPricePerPost', String(onboardingData.minPricePerPost));
        fd.append('maxPricePerPost', String(onboardingData.maxPricePerPost));

        const res = await registerBrand(fd);
        if (res.success) {

            // Log the user in silently to establish session
            await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            setDirection(1);
            setCurrentStep(12);
        } else {
            setError(res.error || 'Registration failed.');
        }
        setIsSubmitting(false);
    };

    // Validation
    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return !!formData.companyName && formData.industries.length > 0;
            case 2: return emailVerified;
            case 3: return !!formData.password && formData.password === formData.confirmPassword && formData.password.length >= 8 && formData.agreeToTerms;
            case 4: return true;
            case 5: return !!onboardingData.brandName;
            case 6: return !!onboardingData.campaignType;
            case 7: return !!onboardingData.budget;
            case 8: return true;
            case 9: return true;
            case 10: return onboardingData.platforms.length > 0;
            case 11: return true;
            default: return true;
        }
    };

    const goNext = async () => {
        setError('');
        if (currentStep === 11) {
            await handleFinalSubmit();
            return;
        }
        if (currentStep < TOTAL_STEPS) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        }
    };

    const goBack = () => {
        if (currentStep > 1 && !isSubmitting) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    const ErrorDisplay = () => error ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-3 mb-6 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
            {error}
        </motion.div>
    ) : null;

    // Step-specific sidebar content
    const sidebarContent = (): { icon: React.ReactNode; tag: string; title: string; desc: string } => {
        if (currentStep <= 3) return { icon: <Building2 className="w-7 h-7 text-white" />, tag: "Account Setup", title: "Register your brand", desc: "Join 10,000+ brands discovering creators who drive real results." };
        if (currentStep === 4) return { icon: <Sparkles className="w-7 h-7 text-white" />, tag: "Verification", title: "Verify your email", desc: "A one-time code sent to confirm your identity securely." };
        if (currentStep <= 7) return { icon: <Target className="w-7 h-7 text-white" />, tag: "Campaign Setup", title: "Define your goals", desc: "Tell us what you want to achieve so we can match you with the right creators." };
        if (currentStep <= 10) return { icon: <TrendingUp className="w-7 h-7 text-white" />, tag: "Creator Match", title: "Find your audience", desc: "We surface creators your customers already follow and trust." };
        return { icon: <Rocket className="w-7 h-7 text-white" />, tag: "Almost Done", title: "One last step!", desc: "Finalize your profile and start discovering top creators today." };
    };
    const sidebar = sidebarContent();

    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden relative font-sans p-3 md:p-5"
            style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1060 45%, #24243e 100%)" }}>

            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.55, 0.35] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 65%)" }} />
                <motion.div animate={{ scale: [1, 1.22, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 65%)" }} />
                <motion.div animate={{ y: [0, -28, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-20"
                    style={{ background: "radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)" }} />
            </div>
            {/* Split-panel card */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: "easeOut" }}
                className="w-full max-w-xl relative z-10 rounded-3xl overflow-hidden flex shadow-[0_40px_100px_rgba(0,0,0,0.55)]">

                {/* RIGHT: White form panel */}
                <div className="flex-1 bg-white flex flex-col relative overflow-hidden min-h-0">
                    {/* In-panel progress bar */}
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-100 z-20">
                        <motion.div className="h-full" style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }}
                            initial={{ width: "0%" }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.5, ease: "easeInOut" }} />
                    </div>

                    {/* Back Button */}
                    {currentStep > 1 && currentStep < 12 && (
                        <button onClick={goBack} className="absolute top-5 left-5 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 z-20">
                            <ChevronLeft size={20} />
                        </button>
                    )}

                    {/* Step Counter */}
                    {currentStep < 12 && (
                        <div className="absolute top-5 right-5 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full z-20">
                            {currentStep} / {TOTAL_STEPS - 1}
                        </div>
                    )}

                    {/* Scrollable form area */}
                    <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-10 overflow-y-auto">
                        <ErrorDisplay />
                        <AnimatePresence initial={false} custom={direction} mode="wait">

                            {/* ===== STEP 1: Brand Details ===== */}
                            {currentStep === 1 && (
                                <CardWrapper stepKey="step1" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Enter brand details</h2>
                                            <p className="text-sm text-slate-400 mt-1">Registration - Phase 1</p>
                                        </div>

                                        {/* Company Name */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Company Name</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                                                <input name="companyName" type="text" value={formData.companyName} onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
                                                    placeholder="e.g. Acme Global" required />
                                            </div>
                                        </div>

                                        {/* Industry */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Industry Type</label>
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <select
                                                        name="industrySelect"
                                                        value=""
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === 'Others') {
                                                                setShowCustomIndustry(true);
                                                            } else if (val && !formData.industries.includes(val)) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    industries: [...prev.industries, val]
                                                                }));
                                                                setShowCustomIndustry(false);
                                                            }
                                                        }}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled>Select industry</option>
                                                        {['Technology', 'Fashion & Apparel', 'Beauty & Cosmetics', 'Health & Wellness', 'Food & Beverage', 'Finance', 'Education', 'Entertainment', 'Travel', 'Others'].map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>

                                                {/* Custom Industry Input */}
                                                <AnimatePresence>
                                                    {showCustomIndustry && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                            <div className="flex gap-2 mt-2">
                                                                <input
                                                                    type="text"
                                                                    value={customIndustry}
                                                                    onChange={(e) => setCustomIndustry(e.target.value)}
                                                                    placeholder="Enter your industry"
                                                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-100 transition-all"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            const val = customIndustry.trim();
                                                                            if (val && !formData.industries.includes(val)) {
                                                                                setFormData(prev => ({ ...prev, industries: [...prev.industries, val] }));
                                                                                setCustomIndustry('');
                                                                                setShowCustomIndustry(false);
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const val = customIndustry.trim();
                                                                        if (val && !formData.industries.includes(val)) {
                                                                            setFormData(prev => ({ ...prev, industries: [...prev.industries, val] }));
                                                                            setCustomIndustry('');
                                                                            setShowCustomIndustry(false);
                                                                        }
                                                                    }}
                                                                    className="px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-all" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Selection Chips */}
                                                <AnimatePresence>
                                                    {formData.industries.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {formData.industries.map((ind) => (
                                                                <motion.div
                                                                    key={ind}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium"
                                                                >
                                                                    <span>{ind}</span>
                                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, industries: prev.industries.filter(i => i !== ind) }))} className="text-blue-500 hover:text-blue-700 transition-colors">
                                                                        <X size={14} strokeWidth={2.5} />
                                                                    </button>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Website */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Website URL</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                                                <input name="website" type="url" value={formData.website} onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
                                                    placeholder="https://www.yourbrand.com" />
                                            </div>
                                        </div>

                                        <NextButton label="Next" onClick={goNext} disabled={!canProceed()} />

                                        <p className="text-center text-sm text-slate-400 mt-4">
                                            Member already?{' '}
                                            <Link href="/brand/login" className="text-violet-600 font-semibold hover:underline">Sign In</Link>
                                        </p>
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 2: Email Verification  ===== */}
                            {currentStep === 2 && (
                                <CardWrapper stepKey="step2" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Verify company email</h2>
                                            <p className="text-sm text-slate-400 mt-1">Security Check</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Work Email</label>
                                            <div className="relative">
                                                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${emailVerified ? 'text-emerald-500' : 'text-gray-400'}`} />
                                                <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                                                    className={`w-full pl-11 pr-28 py-3 text-base border rounded-2xl focus:outline-none transition-all ${emailVerified
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                        : 'bg-[#f0f4ff]/50 border-slate-200 focus:border-indigo-500'
                                                        }`}
                                                    placeholder="hello@acme.com" required disabled={emailVerified} />
                                                {emailVerified && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />}
                                                {!emailVerified && formData.email && !otpSent && (
                                                    <button type="button" onClick={requestOtp} disabled={otpLoading || timer > 0}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-all disabled:opacity-50">
                                                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : timer > 0 ? `${timer}s` : 'Send OTP'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* OTP Entry */}
                                        {otpSent && !emailVerified && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-gray-100">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Verification Code</label>
                                                <div className="flex gap-2 justify-center">
                                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                                        <input key={i} type="text" maxLength={1} value={otp[i] || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '');
                                                                const newOtp = otp.split(''); newOtp[i] = val; setOtp(newOtp.join(''));
                                                                if (val && i < 5) { const next = e.target.parentElement?.children[i + 1] as HTMLInputElement; next?.focus(); }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Backspace' && !otp[i] && i > 0) { const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement; prev?.focus(); }
                                                            }}
                                                            className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-slate-50 focus:bg-white transition-all text-slate-800"
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <button type="button" onClick={requestOtp} disabled={otpLoading || timer > 0} className="text-sm text-violet-600 font-semibold hover:underline">
                                                        {timer > 0 ? `Retry in ${timer}s` : 'Resend OTP'}
                                                    </button>
                                                    <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }} className="text-sm text-slate-400 font-medium hover:text-slate-700">
                                                        Change Email
                                                    </button>
                                                </div>
                                                <button type="button" onClick={verifyOtp} disabled={otpLoading || otp.length !== 6}
                                                    className="w-full py-3 text-white rounded-2xl font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-md shadow-indigo-200/50" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                                                    {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm OTP'}
                                                </button>
                                            </motion.div>
                                        )}

                                        <div className="space-y-3 pt-4">
                                            {emailVerified ? (
                                                <NextButton label="Continue" onClick={goNext} disabled={false} />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!formData.email) {
                                                            setError("Please enter your work email first");
                                                            return;
                                                        }
                                                        goNext();
                                                    }}
                                                    className="w-full py-2.5 text-slate-400 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-sm"
                                                >
                                                    Skip Verification for now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 3: Password ===== */}
                            {currentStep === 3 && (
                                <CardWrapper stepKey="step3" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Create secure password</h2>
                                            <p className="text-sm text-slate-400 mt-1">Finalize Account</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                                                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                                                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
                                                    placeholder="••••••••" required />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                                                <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange}
                                                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
                                                    placeholder="••••••••" required />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {formData.password && formData.confirmPassword && (
                                            <div className={`text-sm font-medium flex items-center gap-1.5 px-1 ${formData.password === formData.confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {formData.password === formData.confirmPassword ? <Check size={16} /> : <Zap size={16} />}
                                                {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                            </div>
                                        )}

                                        {/* Terms */}
                                        <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                            <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
                                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                            <label htmlFor="agreeToTerms" className="text-sm text-slate-500 cursor-pointer">
                                                I agree to the <Link href="/terms" className="text-violet-600 font-semibold hover:underline">Terms of Service</Link> & <Link href="/privacy" className="text-violet-600 font-semibold hover:underline">Privacy Policy</Link>
                                            </label>
                                        </div>

                                        <NextButton label="Create Account" onClick={goNext} disabled={!canProceed()} />
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 4: Welcome ===== */}
                            {currentStep === 4 && (
                                <CardWrapper stepKey="step4" direction={direction}>
                                    <div className="flex flex-col items-center text-center space-y-6 pt-6">
                                        <div className="w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center mb-4 shadow-xl shadow-blue-200/60" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                                            <Target className="w-10 h-10 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-extrabold tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Registration complete!</h1>
                                        <p className="text-sm text-slate-500 max-w-sm">
                                            Let's personalize your discovery engine to find creators who match your brand's vision.
                                        </p>
                                        <div className="pt-4 w-full">
                                            <NextButton label="Start Onboarding" onClick={goNext} disabled={false} />
                                        </div>
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 5: Brand Name ===== */}
                            {currentStep === 5 && (
                                <CardWrapper stepKey="step5" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>What is your Brand Name?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Defining Identity</p>
                                        </div>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                                            <input type="text" value={onboardingData.brandName}
                                                onChange={(e) => updateOnboarding('brandName', e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && onboardingData.brandName) goNext(); }}
                                                className="w-full pl-10 pr-4 py-2.5 text-base border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition-all bg-[#f0f4ff]/50 focus:bg-white text-slate-800 placeholder-slate-400"
                                                placeholder="Enter public name" autoFocus />
                                        </div>
                                        <NextButton label="Continue" onClick={goNext} disabled={!onboardingData.brandName} />
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 6: Campaign Type ===== */}
                            {currentStep === 6 && (
                                <CardWrapper stepKey="step6" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>What type of campaign?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Campaign Strategy</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                                            {[
                                                { label: "Product Promotion", icon: Megaphone },
                                                { label: "Brand Awareness", icon: Target },
                                                { label: "App Installs", icon: Smartphone },
                                                { label: "Event Promotion", icon: Building2 },
                                                { label: "Affiliate Marketing", icon: DollarSign },
                                                { label: "Other", icon: Users },
                                            ].map((option) => (
                                                <button key={option.label}
                                                    onClick={() => { updateOnboarding('campaignType', option.label); goNext(); }}
                                                    className={`p-5 border-2 rounded-2xl flex items-center gap-4 transition-all text-left group
                                                ${onboardingData.campaignType === option.label
                                                            ? 'border-blue-600 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className={`p-3 rounded-xl transition-colors ${onboardingData.campaignType === option.label ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500 group-hover:bg-violet-50 group-hover:text-violet-600'}`}>
                                                        <option.icon size={22} />
                                                    </div>
                                                    <span className="font-semibold text-slate-700">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 7: Budget ===== */}
                            {currentStep === 7 && (
                                <CardWrapper stepKey="step7" direction={direction}>
                                    <div className="space-y-5">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Total campaign budget?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Budget Planning</p>
                                        </div>
                                        <div className="space-y-3">
                                            {["Under ₹10,000", "₹10,000 – ₹50,000", "₹50,000 – ₹2,00,000", "₹2,00,000 – ₹5,00,000", "₹5,00,000 – ₹10,00,000", "₹10,00,000+"].map((option) => (
                                                <button key={option}
                                                    onClick={() => { updateOnboarding('budget', option); goNext(); }}
                                                    className={`w-full p-5 border-2 rounded-2xl text-left font-semibold text-lg transition-all flex justify-between items-center
                                                ${onboardingData.budget === option
                                                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                >
                                                    {option}
                                                    {onboardingData.budget === option && <Check className="text-blue-600" size={18} />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button onClick={goNext} className="text-violet-500 font-semibold hover:underline text-sm">Skip this step</button>
                                        </div>
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 8: Target Followers ===== */}
                            {currentStep === 8 && (
                                <CardWrapper stepKey="step8" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Target creator size?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Select the follower range that fits your campaign.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {followerTiers.map((tier) => {
                                                const isSelected = onboardingData.minFollowers === tier.min && onboardingData.maxFollowers === tier.max;
                                                return (
                                                    <button key={tier.label}
                                                        onClick={() => { updateOnboarding('minFollowers', tier.min); updateOnboarding('maxFollowers', tier.max); }}
                                                        className={`p-5 border-2 rounded-2xl text-left transition-all hover:shadow-md relative overflow-hidden group
                                                    ${isSelected ? 'border-violet-500 bg-violet-50/60 shadow-lg shadow-violet-100/50' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/20'}`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                                                                <Users className="w-5 h-5 text-white" />
                                                            </div>
                                                            {isSelected && (
                                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="font-bold text-lg text-gray-900">{tier.label}</div>
                                                        <div className="text-sm text-gray-500 mt-0.5">{tier.desc}</div>
                                                        <span className="mt-2 inline-block text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tier.badge}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <NextButton label="Continue" onClick={goNext} disabled={false} />
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 9: Price per Post ===== */}
                            {currentStep === 9 && (
                                <CardWrapper stepKey="step9" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Budget range?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Select a pricing type and your budget per collaboration.</p>
                                        </div>

                                        {/* Price Type Selector — pill buttons */}
                                        <div className="flex gap-2 mb-1">
                                            {['Per Post', 'Per Story', 'Per Collab'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => updateOnboarding('priceType', type)}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${onboardingData.priceType === type
                                                        ? 'border-violet-500 text-violet-700 shadow-md shadow-violet-100/60'
                                                        : 'border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/20'
                                                        }`}
                                                    style={onboardingData.priceType === type ? { background: "linear-gradient(135deg, #eef2ff, #ede9fe)" } : {}}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="space-y-3">
                                            {(priceTypeMap[onboardingData.priceType] ?? priceTypeMap['Per Post']).map((tier) => {
                                                const isSelected = onboardingData.minPricePerPost === tier.min && onboardingData.maxPricePerPost === tier.max;
                                                return (
                                                    <button key={tier.label}
                                                        onClick={() => { updateOnboarding('minPricePerPost', tier.min); updateOnboarding('maxPricePerPost', tier.max); goNext(); }}
                                                        className={`w-full p-5 border-2 rounded-2xl text-left transition-all flex items-center justify-between group
                                                    ${isSelected ? 'border-violet-500 bg-violet-50/60 shadow-lg shadow-violet-100/50' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/20'}`}
                                                    >
                                                        <div>
                                                            <div className="font-bold text-lg text-gray-900">{tier.label}</div>
                                                            <div className="text-sm text-gray-500 mt-0.5">{onboardingData.priceType.toLowerCase()}</div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">{tier.badge}</span>
                                                            {isSelected && <Check className="text-blue-600" size={18} />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button onClick={goNext} className="text-violet-500 font-semibold hover:underline text-sm">Skip this step</button>
                                        </div>
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 10: Platforms ===== */}
                            {currentStep === 10 && (
                                <CardWrapper stepKey="step10" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Target Platforms?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Select all that apply</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pb-2">
                                            {[
                                                { id: "Instagram", icon: Instagram, color: "text-pink-600" },
                                                { id: "YouTube", icon: Youtube, color: "text-red-600" },
                                            ].map((p) => {
                                                const isActive = onboardingData.platforms.includes(p.id);
                                                return (
                                                    <button key={p.id}
                                                        onClick={() => togglePlatform(p.id)}
                                                        className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-4 transition-all
                                                    ${isActive
                                                                ? 'border-violet-500 bg-violet-50/60 ring-2 ring-violet-200 shadow-lg shadow-violet-100/50'
                                                                : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/20'
                                                            }`}
                                                    >
                                                        <p.icon className={`w-10 h-10 ${isActive ? p.color : 'text-gray-400'}`} />
                                                        <span className={`font-semibold ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>{p.id}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <NextButton label="Continue" onClick={goNext} disabled={onboardingData.platforms.length === 0} />
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 11: Campaign Goals ===== */}
                            {currentStep === 11 && (
                                <CardWrapper stepKey="step11" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center md:text-left mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Campaign Goals</h2>
                                            <p className="text-sm text-slate-400 mt-1">Tell us a bit more about what you want to achieve.</p>
                                        </div>
                                        <textarea value={onboardingData.campaignGoals}
                                            onChange={(e) => updateOnboarding('campaignGoals', e.target.value)}
                                            placeholder="E.g., We want to increase brand awareness among Gen Z for our new line..."
                                            className="w-full h-40 p-5 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white resize-none text-base"
                                            autoFocus />
                                        <NextButton label="Finish Setup" onClick={handleFinalSubmit} disabled={isSubmitting || !onboardingData.campaignGoals} loading={isSubmitting} />
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 12: Success ===== */}
                            {currentStep === 12 && (
                                <CardWrapper stepKey="step12" direction={direction}>
                                    <div className="flex flex-col items-center text-center space-y-6 py-8">
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                                            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-2"
                                        >
                                            <Check className="w-12 h-12 text-white" strokeWidth={3} />
                                        </motion.div>

                                        <h1 className="text-4xl font-bold text-gray-900">You're All Set!</h1>
                                        <p className="text-gray-500 max-w-md text-base">
                                            Your brand profile is ready. We've matched you with elite creators based on your goals.
                                        </p>

                                        {/* Preference summary chips */}
                                        <div className="flex flex-wrap justify-center gap-2 text-sm pt-2">
                                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100 flex items-center gap-1.5">
                                                <Users size={14} />
                                                {followerTiers.find(t => t.min === onboardingData.minFollowers)?.label ?? "Any"} creators
                                            </span>
                                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-medium border border-emerald-100 flex items-center gap-1.5">
                                                <DollarSign size={14} />
                                                {priceTiers.find(t => t.min === onboardingData.minPricePerPost)?.label ?? "Any"} {onboardingData.priceType.toLowerCase()}
                                            </span>
                                            {onboardingData.platforms.length > 0 && (
                                                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full font-medium border border-purple-100 flex items-center gap-1.5">
                                                    <TrendingUp size={14} />
                                                    {onboardingData.platforms.slice(0, 2).join(", ")}{onboardingData.platforms.length > 2 ? ` +${onboardingData.platforms.length - 2}` : ""}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full">
                                            <button
                                                onClick={async () => {
                                                    const result = await signIn('credentials', { email: formData.email, password: formData.password, redirect: false });
                                                    if (result?.ok) {
                                                        const params = new URLSearchParams({
                                                            fromOnboarding: '1',
                                                            minFollowers: String(onboardingData.minFollowers),
                                                            maxFollowers: String(onboardingData.maxFollowers),
                                                            minPrice: String(onboardingData.minPricePerPost),
                                                            maxPrice: String(onboardingData.maxPricePerPost),
                                                        });
                                                        router.push(`/brand/discover?${params.toString()}`);
                                                    } else {
                                                        router.push('/brand/login');
                                                    }
                                                }}
                                                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-semibold rounded-2xl hover:from-blue-700 mx-2 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                            >
                                                <Sparkles size={18} />
                                                Find Matching Creators
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const result = await signIn('credentials', { email: formData.email, password: formData.password, redirect: false });
                                                    if (result?.ok) { router.push('/brand'); }
                                                    else { router.push('/brand/login'); }
                                                }}
                                                className="flex-1 py-4 bg-gray-100 text-gray-700 text-base font-semibold rounded-2xl hover:bg-gray-200 mx-2 transition-all mt-3 sm:mt-0"
                                            >
                                                Skip to Dashboard
                                            </button>
                                        </div>
                                    </div>
                                </CardWrapper>
                            )}

                        </AnimatePresence>
                    </div>{/* end form area */}
                </div>{/* end right panel */}
            </motion.div>{/* end split card */}

            {/* Footer */}
            <div className="absolute bottom-3 left-0 w-full text-center text-white/30 text-xs font-medium z-20">
                Trusted by 10,000+ brands worldwide
            </div>
        </div>
    );
}
