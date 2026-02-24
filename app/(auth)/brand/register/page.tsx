'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, Building2, Mail, Lock, CheckCircle, ArrowRight, Loader2,
    Check, ChevronLeft, Target, Megaphone, Smartphone, DollarSign, Users,
    Instagram, Youtube, Facebook, Twitter, Linkedin, Sparkles, TrendingUp,
    Globe, Briefcase, ShieldCheck
} from 'lucide-react';
import { registerBrand, sendEmailOtp, verifyEmailOtp } from '@/app/brand/auth-actions';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_STEPS = 13;

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
            setCurrentStep(13);
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
            case 11: return !!onboardingData.creatorType;
            case 12: return true;
            default: return true;
        }
    };

    const goNext = async () => {
        setError('');
        if (currentStep === 12) {
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

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 400 : -400, opacity: 0, scale: 0.96 }),
        center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 400 : -400, opacity: 0, scale: 0.96 }),
    };

    // Dark card wrapper
    const CardWrapper = ({ children, stepKey }: { children: React.ReactNode; stepKey: string }) => (
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
            <div className="w-full max-w-md mx-auto bg-slate-900 rounded-3xl shadow-2xl shadow-blue-900/30 border border-slate-700/50 overflow-hidden">
                {/* Card header */}
                <div className="px-6 py-4 flex items-center gap-2.5 border-b border-slate-700/50">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">BookMyInfluencers</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-800">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                </div>

                {/* Card body */}
                <div className="p-6 sm:p-8">
                    {children}
                </div>
            </div>
        </motion.div>
    );

    // Next button (themed)
    const NextButton = ({ label = "Next", onClick, disabled, loading: btnLoading }: { label?: string; onClick?: () => void; disabled?: boolean; loading?: boolean }) => (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick || goNext}
            disabled={disabled !== undefined ? disabled : !canProceed()}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {btnLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
                <>{label} <ArrowRight className="w-4 h-4" /></>
            )}
        </motion.button>
    );

    // Error display
    const ErrorDisplay = () => error ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
        </motion.div>
    ) : null;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* === ANIMATED 3D BACKGROUND === */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Large gradient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl" />

                {/* Floating 3D sphere — top left */}
                <motion.div
                    animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[8%] w-32 h-32"
                >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-600/20 backdrop-blur-sm border border-blue-400/20 shadow-2xl shadow-blue-500/10" />
                    <div className="absolute top-3 left-5 w-8 h-4 bg-white/10 rounded-full rotate-[-30deg] blur-sm" />
                </motion.div>

                {/* Floating 3D cube — right */}
                <motion.div
                    animate={{ y: [0, 25, 0], rotateZ: [0, 45, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[10%] w-20 h-20"
                >
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-purple-500/25 to-pink-500/15 border border-purple-400/20 shadow-xl shadow-purple-500/10 backdrop-blur-sm rotate-12" />
                </motion.div>

                {/* Floating 3D ring — bottom left */}
                <motion.div
                    animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[15%] left-[12%] w-24 h-24"
                >
                    <div className="w-full h-full rounded-full border-4 border-indigo-400/20 shadow-lg shadow-indigo-500/10" />
                    <div className="absolute inset-3 rounded-full border-2 border-blue-300/10" />
                </motion.div>

                {/* Floating 3D pyramid / diamond — bottom right */}
                <motion.div
                    animate={{ y: [0, -35, 0], rotate: [45, 90, 45] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[20%] right-[15%] w-16 h-16"
                >
                    <div className="w-full h-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/15 border border-cyan-400/20 shadow-lg shadow-cyan-500/10 backdrop-blur-sm" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                </motion.div>

                {/* Floating bars — analytics illusion */}
                <motion.div
                    animate={{ y: [0, 12, 0], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[55%] left-[5%] flex items-end gap-1.5"
                >
                    {[20, 35, 25, 45, 30, 50, 38].map((h, i) => (
                        <div key={i} className="w-2 rounded-full bg-gradient-to-t from-blue-500/20 to-indigo-400/10" style={{ height: `${h}px` }} />
                    ))}
                </motion.div>

                {/* Small dots grid — subtle pattern */}
                <div className="absolute top-[30%] right-[5%] grid grid-cols-4 gap-3 opacity-20">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    ))}
                </div>

                {/* Floating small sphere — accent */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[40%] left-[30%] w-6 h-6 rounded-full bg-gradient-to-br from-pink-400/30 to-rose-500/20 border border-pink-400/20"
                />

                {/* Another small sphere */}
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[35%] right-[30%] w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/15 border border-emerald-400/15"
                />
            </div>

            {/* Back Button */}
            {currentStep > 1 && currentStep < 13 && (
                <button onClick={goBack}
                    className="fixed top-6 left-6 z-50 p-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                    <ChevronLeft size={24} />
                </button>
            )}

            {/* Step Counter */}
            {currentStep < 13 && (
                <div className="fixed top-6 right-6 z-50 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 text-sm font-medium">
                    {currentStep} / {TOTAL_STEPS - 1}
                </div>
            )}

            {/* Slide Content */}
            <div className="relative z-10 w-full max-w-lg">
                <AnimatePresence initial={false} custom={direction} mode="wait">

                    {/* ===== STEP 1: Brand Details ===== */}
                    {currentStep === 1 && (
                        <CardWrapper stepKey="step1">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Enter your brand details</h2>
                                    <p className="text-sm text-slate-400 mt-1">Let's start with the basics</p>
                                </div>
                                <ErrorDisplay />

                                {/* Company Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input name="companyName" type="text" value={formData.companyName} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                            placeholder="e.g. Acme Corp" required autoFocus />
                                    </div>
                                </div>

                                {/* Industry */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industry Type</label>
                                    <div className="relative">
                                        <select name="industry" value={formData.industry} onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                            <option value="">Select your industry</option>
                                            <option value="tech">Technology</option>
                                            <option value="fashion">Fashion & Apparel</option>
                                            <option value="beauty">Beauty & Cosmetics</option>
                                            <option value="health">Health & Wellness</option>
                                            <option value="food">Food & Beverage</option>
                                            <option value="finance">Finance</option>
                                            <option value="education">Education</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Website */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website URL</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input name="website" type="url" value={formData.website} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                            placeholder="https://www.yourbrand.com" />
                                    </div>
                                </div>

                                <NextButton />

                                <p className="text-center text-sm text-slate-500">
                                    Already have an account?{' '}
                                    <Link href="/brand/login" className="text-blue-400 font-bold hover:underline">Sign In →</Link>
                                </p>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 2: Email Verification  ===== */}
                    {currentStep === 2 && (
                        <CardWrapper stepKey="step2">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Verify your email</h2>
                                    <p className="text-sm text-slate-400 mt-1">We'll send a verification code</p>
                                </div>
                                <ErrorDisplay />

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                                            className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${emailVerified
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                : 'bg-slate-800/60 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500'
                                                }`}
                                            placeholder="gohypemedia1@gmail.com" required disabled={emailVerified} autoFocus />
                                        {emailVerified && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />}
                                        {!emailVerified && formData.email && !otpSent && (
                                            <button type="button" onClick={requestOtp} disabled={otpLoading || timer > 0}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-all disabled:opacity-50">
                                                {otpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : timer > 0 ? `${timer}s` : 'Send Code'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* OTP Entry */}
                                {otpSent && !emailVerified && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enter the verification code</label>
                                        <div className="flex gap-2">
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
                                                    className="w-full aspect-square text-center text-xl font-bold border-2 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-800/60 text-white transition-all"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <button type="button" onClick={requestOtp} disabled={otpLoading || timer > 0}
                                                className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                                                {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
                                            </button>
                                        </div>
                                        <button type="button" onClick={verifyOtp} disabled={otpLoading || otp.length !== 6}
                                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                            {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
                                        </button>
                                    </motion.div>
                                )}

                                {emailVerified && <NextButton />}
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 3: Password ===== */}
                    {currentStep === 3 && (
                        <CardWrapper stepKey="step3">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Create a secure password</h2>
                                    <p className="text-sm text-slate-400 mt-1">Make it strong and memorable</p>
                                </div>
                                <ErrorDisplay />

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                                            className="w-full pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                            placeholder="••••••••" required autoFocus />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange}
                                            className="w-full pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                            placeholder="••••••••" required />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {formData.password && formData.confirmPassword && (
                                    <div className={`text-xs font-medium flex items-center gap-1.5 ${formData.password === formData.confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formData.password === formData.confirmPassword ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5">✕</span>}
                                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                    </div>
                                )}

                                {/* Safety badge */}
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
                                    Secure 256-bit SSL · SafeMedia
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-3">
                                    <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
                                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 cursor-pointer" />
                                    <label htmlFor="agreeToTerms" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                                        I agree to the <Link href="/terms" className="text-blue-400 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400 font-bold hover:underline">Privacy Policy</Link>.
                                    </label>
                                </div>

                                <NextButton />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 4: Welcome ===== */}
                    {currentStep === 4 && (
                        <CardWrapper stepKey="step4">
                            <div className="flex flex-col items-center text-center space-y-6 py-6">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl rotate-3 shadow-lg shadow-blue-500/30 flex items-center justify-center"
                                >
                                    <Target className="w-10 h-10 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-white mb-2">You're all set!</h1>
                                    <p className="text-lg text-blue-300 font-semibold mb-1">Let's get know your brand</p>
                                    <p className="text-sm text-slate-400 max-w-xs mx-auto">
                                        Answer a few questions to complete your profile.
                                    </p>
                                </div>
                                <NextButton label="Get Started" />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 5: Brand Name ===== */}
                    {currentStep === 5 && (
                        <CardWrapper stepKey="step5">
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-white">What is your Brand Name?</h2>
                                <div className="relative group">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input type="text" value={onboardingData.brandName}
                                        onChange={(e) => updateOnboarding('brandName', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && onboardingData.brandName) goNext(); }}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-base font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                        placeholder="Enter your brand name" autoFocus />
                                </div>
                                <NextButton label="Continue" />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 6: Campaign Type ===== */}
                    {currentStep === 6 && (
                        <CardWrapper stepKey="step6">
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-white">What type of campaign?</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                            className={`p-3.5 border rounded-xl flex items-center gap-3 transition-all text-left ${onboardingData.campaignType === option.label
                                                ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                                                : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${onboardingData.campaignType === option.label ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                                <option.icon size={18} />
                                            </div>
                                            <span className="font-semibold text-sm">{option.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 7: Budget ===== */}
                    {currentStep === 7 && (
                        <CardWrapper stepKey="step7">
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-white">Total campaign budget?</h2>
                                <div className="space-y-2.5">
                                    {["Under ₹10,000", "₹10,000 – ₹50,000", "₹50,000 – ₹2,00,000", "₹2,00,000+"].map((option) => (
                                        <motion.button key={option}
                                            whileHover={{ scale: 1.01, x: 3 }} whileTap={{ scale: 0.99 }}
                                            onClick={() => { updateOnboarding('budget', option); goNext(); }}
                                            className={`w-full p-3.5 border rounded-xl text-left font-bold text-sm transition-all flex justify-between items-center ${onboardingData.budget === option
                                                ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                                                : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800/80'
                                                }`}
                                        >
                                            {option}
                                            {onboardingData.budget === option && <Check className="w-4 h-4 text-blue-400" />}
                                        </motion.button>
                                    ))}
                                </div>
                                <button onClick={goNext} className="text-sm text-blue-400 hover:text-blue-300 font-medium float-right">Skip</button>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 8: Target Followers ===== */}
                    {currentStep === 8 && (
                        <CardWrapper stepKey="step8">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Target creator size?</h2>
                                    <p className="text-sm text-slate-400 mt-1">Select the follower range that fits your campaign</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {followerTiers.map((tier) => {
                                        const isSelected = onboardingData.minFollowers === tier.min && onboardingData.maxFollowers === tier.max;
                                        return (
                                            <motion.button key={tier.label}
                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                onClick={() => { updateOnboarding('minFollowers', tier.min); updateOnboarding('maxFollowers', tier.max); }}
                                                className={`p-3.5 border rounded-xl text-left transition-all relative overflow-hidden ${isSelected
                                                    ? 'bg-blue-500/10 border-blue-500/40'
                                                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/80'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                                                        <Users className="w-4 h-4 text-white" />
                                                    </div>
                                                    {isSelected && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                                                </div>
                                                <div className="font-bold text-sm text-white">{tier.label}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">{tier.desc}</div>
                                                <span className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded-full">{tier.badge}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <NextButton label="Continue" />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 9: Price per Post ===== */}
                    {currentStep === 9 && (
                        <CardWrapper stepKey="step9">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Budget per post?</h2>
                                    <p className="text-sm text-slate-400 mt-1">How much per creator collaboration?</p>
                                </div>
                                <div className="space-y-2.5">
                                    {priceTiers.map((tier) => {
                                        const isSelected = onboardingData.minPricePerPost === tier.min && onboardingData.maxPricePerPost === tier.max;
                                        return (
                                            <motion.button key={tier.label}
                                                whileHover={{ scale: 1.01, x: 3 }} whileTap={{ scale: 0.99 }}
                                                onClick={() => { updateOnboarding('minPricePerPost', tier.min); updateOnboarding('maxPricePerPost', tier.max); goNext(); }}
                                                className={`w-full p-3.5 border rounded-xl text-left transition-all flex items-center justify-between ${isSelected
                                                    ? 'bg-blue-500/10 border-blue-500/40'
                                                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/80'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-bold text-sm text-white">{tier.label}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">per post / collaboration</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded-full">{tier.badge}</span>
                                                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <button onClick={goNext} className="text-sm text-blue-400 hover:text-blue-300 font-medium float-right">Skip</button>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 10: Platforms ===== */}
                    {currentStep === 10 && (
                        <CardWrapper stepKey="step10">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Target Platforms?</h2>
                                    <p className="text-sm text-slate-400 mt-1">Select all that apply</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: "Instagram", icon: Instagram, activeColor: "text-pink-400" },
                                        { id: "YouTube", icon: Youtube, activeColor: "text-red-400" },
                                        { id: "Facebook", icon: Facebook, activeColor: "text-blue-400" },
                                        { id: "Twitter (X)", icon: Twitter, activeColor: "text-sky-400" },
                                        { id: "LinkedIn", icon: Linkedin, activeColor: "text-blue-500" },
                                    ].map((p) => (
                                        <motion.button key={p.id}
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            onClick={() => togglePlatform(p.id)}
                                            className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${onboardingData.platforms.includes(p.id)
                                                ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30'
                                                : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/80'
                                                }`}
                                        >
                                            <p.icon className={`w-7 h-7 ${onboardingData.platforms.includes(p.id) ? p.activeColor : 'text-slate-400'}`} />
                                            <span className={`font-semibold text-sm ${onboardingData.platforms.includes(p.id) ? 'text-white' : 'text-slate-400'}`}>{p.id}</span>
                                        </motion.button>
                                    ))}
                                </div>
                                <NextButton label="Continue" />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 11: Creator Type ===== */}
                    {currentStep === 11 && (
                        <CardWrapper stepKey="step11">
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-white">Preferred Creators?</h2>
                                <div className="space-y-2.5">
                                    {[
                                        { label: "Nano", desc: "1K–10K followers", badge: "Most Authentic" },
                                        { label: "Micro", desc: "10K–100K followers", badge: "High Engagement" },
                                        { label: "Macro", desc: "100K–500K followers", badge: "Broad Reach" },
                                        { label: "Celebrity", desc: "500K+ followers", badge: "Massive Impact" },
                                    ].map((option) => (
                                        <motion.button key={option.label}
                                            whileHover={{ scale: 1.01, x: 3 }} whileTap={{ scale: 0.99 }}
                                            onClick={() => { updateOnboarding('creatorType', option.label); goNext(); }}
                                            className={`w-full p-4 border rounded-xl text-left transition-all ${onboardingData.creatorType === option.label
                                                ? 'bg-blue-500/10 border-blue-500/40'
                                                : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/80'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="font-bold text-sm text-white">{option.label}</span>
                                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded-full">{option.badge}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">{option.desc}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 12: Campaign Goals ===== */}
                    {currentStep === 12 && (
                        <CardWrapper stepKey="step12">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Campaign Goals</h2>
                                    <p className="text-sm text-slate-400 mt-1">Tell us what you want to achieve</p>
                                </div>
                                <ErrorDisplay />

                                <textarea value={onboardingData.campaignGoals}
                                    onChange={(e) => updateOnboarding('campaignGoals', e.target.value)}
                                    placeholder="E.g., We want to increase brand awareness among Gen Z..."
                                    className="w-full h-36 p-4 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none transition-all"
                                    autoFocus />

                                <NextButton label="Finish Setup" disabled={isSubmitting} loading={isSubmitting} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 13: Success ===== */}
                    {currentStep === 13 && (
                        <CardWrapper stepKey="step13">
                            <div className="flex flex-col items-center text-center space-y-6 py-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center relative shadow-lg shadow-emerald-500/30">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                                        <Check className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <motion.div className="absolute inset-0 border-4 border-emerald-300/40 rounded-full"
                                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.4, opacity: 0 }}
                                        transition={{ delay: 0.4, duration: 1.5, repeat: Infinity }} />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-extrabold text-white mb-2">You&apos;re All Set!</h1>
                                    <p className="text-sm text-slate-400 max-w-xs mx-auto">
                                        We&apos;ve personalised your experience. Based on your preferences, creators are ready to work with your brand.
                                    </p>
                                </div>

                                {/* Preference chips */}
                                <div className="flex flex-wrap justify-center gap-2 text-xs">
                                    <span className="px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-full font-medium border border-blue-500/20 flex items-center gap-1.5">
                                        <Users size={12} />
                                        {followerTiers.find(t => t.min === onboardingData.minFollowers)?.label ?? "Any"} creators
                                    </span>
                                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 rounded-full font-medium border border-emerald-500/20 flex items-center gap-1.5">
                                        <DollarSign size={12} />
                                        {priceTiers.find(t => t.min === onboardingData.minPricePerPost)?.label ?? "Any"} / post
                                    </span>
                                    {onboardingData.platforms.length > 0 && (
                                        <span className="px-3 py-1.5 bg-purple-500/10 text-purple-300 rounded-full font-medium border border-purple-500/20 flex items-center gap-1.5">
                                            <TrendingUp size={12} />
                                            {onboardingData.platforms.slice(0, 2).join(', ')}{onboardingData.platforms.length > 2 ? ` +${onboardingData.platforms.length - 2}` : ''}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
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
                                        className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={16} /> Find Matching Creators
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={async () => {
                                            const result = await signIn('credentials', { email: formData.email, password: formData.password, redirect: false });
                                            if (result?.ok) { router.push('/brand'); }
                                            else { router.push('/brand/login'); }
                                        }}
                                        className="flex-1 py-3.5 bg-slate-800 text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-700 transition-all"
                                    >
                                        Go to Dashboard
                                    </motion.button>
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="fixed bottom-4 left-0 w-full text-center text-white/20 text-xs">
                Trusted by 10,000+ brands worldwide
            </div>
        </div>
    );
}
