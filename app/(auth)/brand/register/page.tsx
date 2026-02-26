'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, Building2, Mail, Lock, CheckCircle, ArrowRight, Loader2,
    Check, ChevronLeft, Target, Megaphone, Smartphone, DollarSign, Users,
    Instagram, Youtube, Facebook, Twitter, Linkedin, Sparkles, TrendingUp,
    Globe, Briefcase, ShieldCheck, Zap, Layers, Rocket, Heart
} from 'lucide-react';
import { registerBrand, sendEmailOtp, verifyEmailOtp } from '@/app/brand/auth-actions';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. slideVariants
const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 400 : -400, opacity: 0, scale: 0.96 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 400 : -400, opacity: 0, scale: 0.96 }),
};

// 2. CardWrapper
const CardWrapper = ({ children, stepKey, direction, progressPercentage }: { children: React.ReactNode; stepKey: string; direction: number; progressPercentage: number }) => (
    <motion.div
        key={stepKey}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full"
    >
        <div className="w-full max-w-md mx-auto rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] overflow-hidden relative group p-[2px] bg-gradient-to-br from-white/80 via-white/40 to-white/80 border border-white/50">
            <div className="w-full h-full rounded-[2.4rem] overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(40px)',
                }}>
                {/* Card Header */}
                <div className="px-8 py-6 flex items-center gap-4 border-b border-slate-50/50"
                    style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-slate-900 font-black text-sm tracking-tighter uppercase block leading-tight">BookMyInfluencers</span>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em]">Brand Solutions</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[4px] bg-slate-50 relative">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-cyan-400"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                    />
                </div>

                {/* Card Body */}
                <div className="p-8 sm:p-10 text-slate-800">
                    {children}
                </div>
            </div>
        </div>
    </motion.div>
);

// 3. NextButton
const NextButton = ({
    label = "Next",
    onClick,
    disabled,
    loading: btnLoading
}: {
    label?: string;
    onClick: () => void;
    disabled: boolean;
    loading?: boolean;
}) => (
    <motion.button
        whileHover={{ scale: 1.01, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={disabled}
        className="group relative w-full py-3 text-white font-black text-sm rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_20px_40px_-12px_rgba(59,130,246,0.3)]"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 group-hover:scale-105 transition-transform duration-500" />

        {/* Shine Animation */}
        <motion.div
            className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-10"
            animate={{ left: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        />

        <div className="relative flex items-center justify-center gap-2 py-2 z-20">
            {btnLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
                <>{label} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
        </div>
    </motion.button>
);

const GlassIcon = ({ children, color = "blue", size = "large" }: { children: React.ReactNode, color?: string, size?: "small" | "large" }) => (
    <div className={`relative ${size === 'large' ? 'w-48 h-48' : 'w-16 h-16'} flex items-center justify-center group`}>
        {/* Outer Deep Glow */}
        <div className={`absolute inset-[-20%] blur-[80px] opacity-15 bg-${color}-400 rounded-full group-hover:opacity-25 transition-opacity duration-700`} />

        {/* Refined Glass Plate with Multiple Layers */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-white/20 backdrop-blur-[40px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Glossy Refraction Layer */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-40 transform rotate-[15deg]" />

            {/* Inner Glow Stripe */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

            {/* Side Glow Stripe */}
            <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent" />
        </div>

        {/* Floating Aura for Icon */}
        <div className={`absolute inset-[15%] rounded-[2rem] blur-2xl opacity-20 bg-${color}-400 group-hover:scale-110 transition-transform duration-700`} />

        {/* High-Reflect Shadow */}
        <div className="absolute bottom-[5%] left-[10%] right-[10%] h-[15%] rounded-full bg-slate-900/10 blur-xl translate-z-[-20px]" />

        {/* Content */}
        <div className="relative z-10 select-none transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
            {children}
        </div>
    </div>
);

const TOTAL_STEPS = 12;

// Follower tiers
const followerTiers = [
    { label: "Nano", desc: "1K – 10K followers", badge: "Most Authentic", min: 1000, max: 10000, gradient: "from-emerald-400 to-teal-500" },
    { label: "Micro", desc: "10K – 100K followers", badge: "High Engagement", min: 10000, max: 100000, gradient: "from-blue-400 to-cyan-500" },
    { label: "Macro", desc: "100K – 500K followers", badge: "Broad Reach", min: 100000, max: 500000, gradient: "from-violet-400 to-purple-500" },
    { label: "Mega", desc: "500K+ followers", badge: "Massive Impact", min: 500000, max: 10000000, gradient: "from-orange-400 to-rose-500" },
];

// Price tiers
const priceTiers = [
    { label: "₹500 – ₹2,000", badge: "Budget Friendly", min: 500, max: 2000 },
    { label: "₹2,000 – ₹10,000", badge: "Standard", min: 2000, max: 10000 },
    { label: "₹10,000 – ₹50,000", badge: "Premium", min: 10000, max: 50000 },
    { label: "₹50,000+", badge: "Elite", min: 50000, max: 1000000 },
];

export default function BrandRegisterPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);

    // Registration data
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        website: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });

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
        fd.append('industry', formData.industry);
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
            case 1: return !!formData.companyName;
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

    // 3D Background config per step group
    const getStepGroup = (step: number) => {
        if (step <= 4) return { group: 'registration', glow: 'bg-blue-600/20' };
        if (step <= 11) return { group: 'onboarding', glow: 'bg-indigo-600/20' };
        return { group: 'success', glow: 'bg-emerald-600/20' };
    };

    // Error display
    const ErrorDisplay = () => error ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
        </motion.div>
    ) : null;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* === PREMIUM MESH BACKGROUND === */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Mesh Gradient Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px] animate-blob" />
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[55%] h-[55%] bg-cyan-400/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
                <div className="absolute bottom-[10%] right-[10%] w-[45%] h-[45%] bg-blue-500/5 rounded-full blur-[120px] animate-blob" />

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                <style jsx>{`
                    @keyframes blob {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(30px, -50px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.9); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    .animation-delay-2000 { animation-delay: 2s; }
                    .animation-delay-4000 { animation-delay: 4s; }
                    .animate-blob {
                        animation: blob 15s infinite alternate ease-in-out;
                    }
                `}</style>

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={getStepGroup(currentStep).group}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="absolute inset-0"
                        >
                            {/* Top Left - Dynamic Brand Object */}
                            <motion.div
                                animate={{
                                    y: [0, -40, 0],
                                    rotateY: [0, 15, -15, 0],
                                    rotateX: [0, 10, -10, 0],
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-[12%] left-[8%] z-0"
                            >
                                <GlassIcon color="blue">
                                    {currentStep <= 4 ? (
                                        <div className="text-7xl group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 10px 20px rgba(59,130,246,0.3))' }}>{"\uD83D\uDE80"}</div>
                                    ) : (
                                        <div className="text-6xl group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 10px 20px rgba(6,182,212,0.3))' }}>{"\uD83C\uDFAF"}</div>
                                    )}
                                </GlassIcon>
                            </motion.div>

                            {/* Bottom Right - Dynamic Object */}
                            <motion.div
                                animate={{
                                    y: [0, 50, 0],
                                    rotateX: [0, 15, -15, 0],
                                    rotateY: [0, -10, 10, 0],
                                }}
                                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-[10%] right-[10%] z-0"
                            >
                                <GlassIcon color="cyan">
                                    {currentStep <= 4 ? (
                                        <div className="text-5xl group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 10px 15px rgba(6,182,212,0.3))' }}>{"\uD83D\uDCCA"}</div>
                                    ) : (
                                        <div className="text-6xl group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 10px 15px rgba(59,130,246,0.3))' }}>{"\uD83D\uDCE2"}</div>
                                    )}
                                </GlassIcon>
                            </motion.div>

                            {/* Floating Kinetic Growth Particles */}
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <motion.div
                                    key={`particle-${i}`}
                                    initial={{
                                        x: (i * 15) + "%",
                                        y: "110%",
                                        opacity: 0,
                                        scale: 0.5
                                    }}
                                    animate={{
                                        y: "-20%",
                                        opacity: [0, 0.4, 0],
                                        scale: [0.5, 1.2, 0.5],
                                        rotate: [0, 360]
                                    }}
                                    transition={{
                                        duration: 8 + Math.random() * 5,
                                        repeat: Infinity,
                                        delay: i * 2,
                                        ease: "linear"
                                    }}
                                    className="absolute"
                                >
                                    {i % 2 === 0 ? (
                                        <GlassIcon color="blue" size="small">
                                            <div className="text-xl">{"\uD83D\uDCC8"}</div>
                                        </GlassIcon>
                                    ) : (
                                        <GlassIcon color="cyan" size="small">
                                            <div className="text-lg">{"\u2728"}</div>
                                        </GlassIcon>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Back Button */}
            {currentStep > 1 && currentStep < 12 && (
                <button onClick={goBack}
                    className="fixed top-6 left-6 z-50 p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white transition-colors text-slate-500 hover:text-slate-900 shadow-sm">
                    <ChevronLeft size={24} />
                </button>
            )}

            {/* Step Counter */}
            {currentStep < 12 && (
                <div className="fixed top-6 right-6 z-50 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 text-sm font-bold shadow-sm">
                    {currentStep} / {TOTAL_STEPS - 1}
                </div>
            )}

            {/* Slide Content */}
            <div className="relative z-10 w-full max-w-lg">
                <AnimatePresence initial={false} custom={direction} mode="wait">

                    {/* ===== STEP 1: Brand Details ===== */}
                    {currentStep === 1 && (
                        <CardWrapper stepKey="step1" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Enter brand details</h2>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mt-1 opacity-80">Phase 1: Registration</p>
                                </div>
                                <ErrorDisplay />

                                {/* Company Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Company Name</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input name="companyName" type="text" value={formData.companyName} onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            placeholder="e.g. Acme Global" required />
                                    </div>
                                </div>

                                {/* Industry */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Industry Type</label>
                                    <div className="relative">
                                        <select name="industry" value={formData.industry} onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none cursor-pointer">
                                            <option value="" style={{ background: '#ffffff', color: '#94a3b8' }}>Select your industry</option>
                                            {['Technology', 'Fashion & Apparel', 'Beauty & Cosmetics', 'Health & Wellness', 'Food & Beverage', 'Finance', 'Education', 'Entertainment', 'Travel', 'Other'].map(opt => (
                                                <option key={opt} value={opt.toLowerCase()} style={{ background: '#ffffff', color: '#334155' }}>{opt}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Website */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Website URL</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input name="website" type="url" value={formData.website} onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            placeholder="https://www.yourbrand.com" />
                                    </div>
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />

                                <p className="text-center text-xs text-slate-400 font-bold">
                                    MEMBER ALREADY?{' '}
                                    <Link href="/brand/login" className="text-blue-600 hover:text-blue-500 transition-colors tracking-tighter uppercase">Sign In Here →</Link>
                                </p>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 2: Email Verification  ===== */}
                    {currentStep === 2 && (
                        <CardWrapper stepKey="step2" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify company email</h2>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mt-1 opacity-80">Security Check</p>
                                </div>
                                <ErrorDisplay />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Work Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                                            className={`w-full pl-12 pr-10 py-4 border rounded-2xl text-sm font-bold transition-all ${emailVerified
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50'
                                                }`}
                                            placeholder="hello@acme.com" required disabled={emailVerified} />
                                        {emailVerified && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />}
                                        {!emailVerified && formData.email && !otpSent && (
                                            <button type="button" onClick={requestOtp} disabled={otpLoading || timer > 0}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50">
                                                {otpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : timer > 0 ? `${timer}s` : 'Send OTP'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* OTP Entry */}
                                {otpSent && !emailVerified && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Verification Code</label>
                                        <div className="flex gap-2.5">
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
                                                    className="w-full aspect-square text-center text-xl font-black border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50 text-slate-900 transition-all"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between px-1">
                                            <button type="button" onClick={requestOtp} disabled={otpLoading || timer > 0}
                                                className="text-xs text-blue-400 hover:text-blue-300 font-black tracking-tight uppercase">
                                                {timer > 0 ? `Retry in ${timer}s` : 'Resend OTP'}
                                            </button>
                                            <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                                                className="text-xs text-slate-400 hover:text-slate-600 font-black tracking-tight uppercase transition-colors">
                                                ← Back
                                            </button>
                                        </div>
                                        <button type="button" onClick={verifyOtp} disabled={otpLoading || otp.length !== 6}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-base hover:opacity-90 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                            {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Proceed'}
                                        </button>
                                    </motion.div>
                                )}

                                {emailVerified && <NextButton onClick={goNext} disabled={false} />}
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 3: Password ===== */}
                    {currentStep === 3 && (
                        <CardWrapper stepKey="step3" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create secure password</h2>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mt-1 opacity-80">Finalize Account</p>
                                </div>
                                <ErrorDisplay />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            placeholder="••••••••" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange}
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            placeholder="••••••••" required />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1">
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {formData.password && formData.confirmPassword && (
                                    <div className={`text-xs font-black uppercase tracking-tight flex items-center gap-1.5 px-1 ${formData.password === formData.confirmPassword ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formData.password === formData.confirmPassword ? <Check size={14} /> : <Zap size={14} />}
                                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                    </div>
                                )}

                                {/* Terms */}
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
                                        className="mt-1 h-5 w-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" />
                                    <label htmlFor="agreeToTerms" className="text-[11px] text-slate-500 leading-tight font-bold cursor-pointer uppercase tracking-tight">
                                        I Agree to the <Link href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link> & <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
                                    </label>
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 4: Welcome ===== */}
                    {currentStep === 4 && (
                        <CardWrapper stepKey="step4" direction={direction} progressPercentage={progressPercentage}>
                            <div className="flex flex-col items-center text-center space-y-8 py-10">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 rounded-[2rem] shadow-2xl flex items-center justify-center relative"
                                >
                                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse" />
                                    <Rocket className="w-12 h-12 text-white relative z-10" />
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Registration complete!</h1>
                                    <p className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Phase 2: Discovery Setup</p>
                                    <p className="text-sm text-slate-500 max-w-[280px] mx-auto font-bold leading-relaxed">
                                        Let's personalize your discovery engine to find creators who match your brand's vision.
                                    </p>
                                </div>
                                <NextButton label="Start Onboarding" onClick={goNext} disabled={false} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 5: Brand Name ===== */}
                    {currentStep === 5 && (
                        <CardWrapper stepKey="step5" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">What's your brand name?</h2>
                                    <p className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mt-1 opacity-80">Defining Identity</p>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-500/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
                                    <input type="text" value={onboardingData.brandName}
                                        onChange={(e) => updateOnboarding('brandName', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && onboardingData.brandName) goNext(); }}
                                        className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-lg font-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all backdrop-blur-md relative z-0"
                                        placeholder="Enter public name" />
                                </div>
                                <NextButton label="Continue" onClick={goNext} disabled={!onboardingData.brandName} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 6: Campaign Type ===== */}
                    {currentStep === 6 && (
                        <CardWrapper stepKey="step6" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Campaign objective?</h2>
                                    <p className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mt-1 opacity-80">Campaign Strategy</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                                    {[
                                        { label: "Product Promotion", icon: Megaphone },
                                        { label: "Brand Awareness", icon: Target },
                                        { label: "App Installs", icon: Smartphone },
                                        { label: "Event Promotion", icon: Building2 },
                                        { label: "Affiliate Marketing", icon: DollarSign },
                                        { label: "Other", icon: Users },
                                    ].map((option) => (
                                        <motion.button key={option.label}
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            onClick={() => { updateOnboarding('campaignType', option.label); goNext(); }}
                                            className={`p-4 border rounded-[1.5rem] flex items-center gap-3 transition-all text-left group ${onboardingData.campaignType === option.label
                                                ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className={`p-2.5 rounded-xl ${onboardingData.campaignType === option.label ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-blue-500 transition-colors'}`}>
                                                <option.icon size={20} />
                                            </div>
                                            <span className={`font-black uppercase tracking-tighter text-sm ${onboardingData.campaignType === option.label ? 'text-white' : 'text-slate-500'}`}>{option.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 7: Budget ===== */}
                    {currentStep === 7 && (
                        <CardWrapper stepKey="step7" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Total budget?</h2>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mt-1 opacity-80">Budget Planning</p>
                                </div>
                                <div className="space-y-3">
                                    {["Under ₹10,000", "₹10,000 – ₹50,000", "₹50,000 – ₹2,00,000", "₹2,00,000+"].map((option) => (
                                        <motion.button key={option}
                                            whileHover={{ scale: 1.01, x: 5 }} whileTap={{ scale: 0.99 }}
                                            onClick={() => { updateOnboarding('budget', option); goNext(); }}
                                            className={`w-full p-5 border rounded-2xl text-left transition-all flex justify-between items-center group relative overflow-hidden ${onboardingData.budget === option
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-400 shadow-xl'
                                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                                }`}
                                        >
                                            <span className={`font-black tracking-tight text-base ${onboardingData.budget === option ? 'text-white' : 'text-slate-500 uppercase'}`}>{option}</span>
                                            {onboardingData.budget === option ? (
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                                                    <Check size={18} className="text-white" />
                                                </div>
                                            ) : (
                                                <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                                <button onClick={goNext} className="w-full text-center text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors py-2">
                                    Skip this step
                                </button>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 8: Target Followers ===== */}
                    {currentStep === 8 && (
                        <CardWrapper stepKey="step8" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Target creator size?</h2>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mt-1 opacity-80">Audience Scale</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {followerTiers.map((tier) => {
                                        const isSelected = onboardingData.minFollowers === tier.min && onboardingData.maxFollowers === tier.max;
                                        return (
                                            <motion.button key={tier.label}
                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                onClick={() => { updateOnboarding('minFollowers', tier.min); updateOnboarding('maxFollowers', tier.max); }}
                                                className={`p-4 border rounded-[1.5rem] text-left transition-all relative overflow-hidden group ${isSelected
                                                    ? 'bg-blue-600 border-blue-400 shadow-xl'
                                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg`}>
                                                        <Users className="w-5 h-5 text-white" />
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 bg-white/20 translate-x-1 -translate-y-1 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`font-black uppercase tracking-tighter text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>{tier.label}</div>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>{tier.desc}</div>
                                                <div className={`mt-3 inline-block text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                    {tier.badge}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <NextButton onClick={goNext} disabled={false} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 9: Price per Post ===== */}
                    {currentStep === 9 && (
                        <CardWrapper stepKey="step9" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Budget per post?</h2>
                                    <p className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mt-1 opacity-80">Unit Economics</p>
                                </div>
                                <div className="space-y-3">
                                    {priceTiers.map((tier) => {
                                        const isSelected = onboardingData.minPricePerPost === tier.min && onboardingData.maxPricePerPost === tier.max;
                                        return (
                                            <motion.button key={tier.label}
                                                whileHover={{ scale: 1.01, x: 5 }} whileTap={{ scale: 0.99 }}
                                                onClick={() => { updateOnboarding('minPricePerPost', tier.min); updateOnboarding('maxPricePerPost', tier.max); goNext(); }}
                                                className={`w-full p-5 border rounded-2xl text-left transition-all flex items-center justify-between group relative overflow-hidden ${isSelected
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-400 shadow-xl'
                                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <div>
                                                    <div className={`font-black tracking-tight text-base ${isSelected ? 'text-white' : 'text-slate-900'}`}>{tier.label}</div>
                                                    <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>Target per collaboration</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>{tier.badge}</span>
                                                    {isSelected && <Check className="w-5 h-5 text-white" />}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <button onClick={goNext} className="w-full text-center text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors py-2">
                                    Skip this step
                                </button>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 10: Platforms ===== */}
                    {currentStep === 10 && (
                        <CardWrapper stepKey="step10" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Target platforms?</h2>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mt-1 opacity-80">Channel Selection</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pb-2">
                                    {[
                                        { id: "Instagram", icon: Instagram, color: "from-pink-500 to-rose-500" },
                                        { id: "YouTube", icon: Youtube, color: "from-red-600 to-rose-700" },
                                        { id: "Facebook", icon: Facebook, color: "from-blue-600 to-indigo-700" },
                                        { id: "Twitter (X)", icon: Twitter, color: "from-sky-400 to-blue-500" },
                                        { id: "LinkedIn", icon: Linkedin, color: "from-blue-700 to-indigo-800" },
                                    ].map((p) => {
                                        const isActive = onboardingData.platforms.includes(p.id);
                                        return (
                                            <motion.button key={p.id}
                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                onClick={() => togglePlatform(p.id)}
                                                className={`p-5 border rounded-[1.8rem] flex flex-col items-center gap-3 transition-all relative overflow-hidden group ${isActive
                                                    ? 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-500/10'
                                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100/80 hover:border-slate-300'
                                                    }`}
                                            >
                                                {isActive && <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-10 animate-pulse`} />}
                                                <div className={`p-3 rounded-2xl transition-all ${isActive ? `bg-gradient-to-br ${p.color} text-white shadow-lg` : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                    <p.icon className="w-6 h-6" />
                                                </div>
                                                <span className={`font-black uppercase tracking-tighter text-[11px] ${isActive ? 'text-blue-900 border-b border-blue-200' : 'text-slate-500'}`}>{p.id}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <NextButton onClick={goNext} disabled={onboardingData.platforms.length === 0} />
                            </div>
                        </CardWrapper>
                    )}



                    {/* ===== STEP 11: Campaign Goals ===== */}
                    {currentStep === 11 && (
                        <CardWrapper stepKey="step11" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Campaign goals?</h2>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mt-1 opacity-80">Final Briefing</p>
                                </div>
                                <ErrorDisplay />

                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                    <textarea value={onboardingData.campaignGoals}
                                        onChange={(e) => updateOnboarding('campaignGoals', e.target.value)}
                                        placeholder="E.g., We want to increase brand awareness among Gen Z for our new sustainable activewear line..."
                                        className="w-full h-44 p-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none transition-all backdrop-blur-md relative z-10"
                                        autoFocus />
                                </div>

                                <NextButton label="Finalize Setup" onClick={handleFinalSubmit} disabled={isSubmitting || !onboardingData.campaignGoals} loading={isSubmitting} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 12: Success ===== */}
                    {currentStep === 12 && (
                        <CardWrapper stepKey="step12" direction={direction} progressPercentage={progressPercentage}>
                            <div className="flex flex-col items-center text-center space-y-8 py-4">
                                <div className="relative">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                                        className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-[2.2rem] flex items-center justify-center relative shadow-2xl shadow-emerald-500/30 z-10"
                                    >
                                        <Check className="w-12 h-12 text-white" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full -z-0"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Welcome aboard!</h1>
                                    <p className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Account Activated</p>
                                    <p className="text-sm text-slate-500 max-w-[280px] mx-auto font-bold leading-relaxed">
                                        Your brand profile is ready. We've matched you with elite creators based on your goals.
                                    </p>
                                </div>

                                {/* Preference chips */}
                                <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full">
                                    <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-black uppercase text-[9px] tracking-widest border border-blue-100 flex items-center gap-2">
                                        <Users size={12} />
                                        {followerTiers.find(t => t.min === onboardingData.minFollowers)?.label ?? "Matched"} REACH
                                    </div>
                                    <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl font-black uppercase text-[9px] tracking-widest border border-indigo-100 flex items-center gap-2">
                                        <DollarSign size={12} />
                                        {priceTiers.find(t => t.min === onboardingData.minPricePerPost)?.label ?? "Matched"} UNIT
                                    </div>
                                    {onboardingData.platforms.length > 0 && (
                                        <div className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-xl font-black uppercase text-[9px] tracking-widest border border-cyan-100 flex items-center gap-2">
                                            <Zap size={12} />
                                            {onboardingData.platforms.length} CHANNELS
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 w-full">
                                    <NextButton
                                        label="Find Matching Creators"
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
                                        disabled={false}
                                    />

                                    <button
                                        onClick={async () => {
                                            const result = await signIn('credentials', { email: formData.email, password: formData.password, redirect: false });
                                            if (result?.ok) { router.push('/brand'); }
                                            else { router.push('/brand/login'); }
                                        }}
                                        className="w-full py-4 text-slate-400 font-black text-sm uppercase tracking-widest hover:text-slate-600 transition-colors"
                                    >
                                        Skip to Dashboard
                                    </button>
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="fixed bottom-4 left-0 w-full text-center text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
                Trusted by 10,000+ brands worldwide
            </div>
        </div>
    );
}
