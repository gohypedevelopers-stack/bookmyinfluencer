'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, User, Phone, Instagram, Youtube, Mail, Lock,
    CheckCircle, ArrowRight, Loader2, Chrome, Github, Sparkles,
    Check, ChevronLeft, Facebook, Twitter, Linkedin,
    Gamepad2, Dumbbell, Utensils, Laptop, Shirt, Smartphone,
    GraduationCap, Globe, Heart, IndianRupee, TrendingUp, Zap, Layers, Rocket
} from 'lucide-react';
import { registerUserAction } from './actions';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import LivePhotoCapture from "@/components/kyc/LivePhotoCapture";

// Total steps
const TOTAL_STEPS = 12;

// 1. slideVariants
const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 500 : -500, opacity: 0, scale: 0.95 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 500 : -500, opacity: 0, scale: 0.95 }),
};

// 1.1 platforms
const platforms = [
    { value: '', label: 'Select Platform' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
];

const CardWrapper = ({ children, stepKey, direction, progressPercentage }: { children: React.ReactNode; stepKey: string; direction: number; progressPercentage: number }) => (
    <div className="w-full max-w-[26rem] bg-white/90 backdrop-blur-sm border border-white/80 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08),0_0_0_1px_rgba(99,102,241,0.05)] overflow-hidden min-h-0 flex flex-col items-center justify-center relative z-10 text-slate-900">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-100">
            <motion.div
                className="h-full rounded-r-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)" }}
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>

        {/* Content Area */}
        <motion.div
            key={stepKey}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full px-8 py-5 md:px-10 flex flex-col items-center justify-center flex-1"
        >
            {children}
        </motion.div>
    </div>
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
    <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={disabled}
        className="w-full py-3 text-white rounded-2xl font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-200/60 hover:shadow-indigo-300/60 hover:scale-[1.01] active:scale-[0.99]" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
    >
        {btnLoading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
        ) : (
            <>{label}</>
        )}
    </motion.button>
);

const ProceedButton = ({
    label = "Let's Go",
    onClick,
    disabled,
    loading: btnLoading
}: {
    label?: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
}) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className="w-full py-3 text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-200/60 hover:shadow-indigo-300/60 hover:scale-[1.01] active:scale-[0.99]" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
    >
        {btnLoading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
        ) : (
            <>{label} <ArrowRight size={24} /></>
        )}
    </motion.button>
)


export default function RegisterPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);

    // Registration data
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        primaryPlatform: '',
        instagramUrl: '',
        youtubeUrl: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });

    // Onboarding data
    const [onboardingData, setOnboardingData] = useState({
        platforms: [] as string[],
        niche: '',
        followers: '',
        engagement: '',
        minimumPrice: '',
        rates: '',
        priceStory: '',
        pricePost: '',
        priceCollab: '',
        priceType: 'Per Post',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomNiche, setIsCustomNiche] = useState(false);
    const [kycCompleted, setKycCompleted] = useState(false);

    const progressPercentage = ((currentStep - 1) / (12 - 1)) * 100;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'email' && emailVerified) {
            setEmailVerified(false);
            setOtpSent(false);
            setOtp("");
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
        setOnboardingData(prev => {
            const platforms = prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform];
            return { ...prev, platforms };
        });
    }, []);

    const requestOtp = async () => {
        if (!formData.email) { setError("Please enter an email address first"); return; }
        setOtpLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/request-otp", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await res.json();
            if (data.ok) { setOtpSent(true); }
            else { setError(data.message || data.error || "Failed to send OTP"); }
        } catch { setError("Failed to send OTP"); }
        finally { setOtpLoading(false); }
    };

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) { setError("Please enter valid 6-digit OTP"); return; }
        setOtpLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp }),
            });
            const data = await res.json();
            if (data.ok) { setEmailVerified(true); setOtpSent(false); }
            else { setError(data.message || data.error || "Invalid OTP"); }
        } catch { setError("Failed to verify OTP"); }
        finally { setOtpLoading(false); }
    };

    // Final submit: registration + onboarding
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        const fd = new FormData();
        fd.append('email', formData.email);
        fd.append('password', formData.password);
        fd.append('fullName', formData.fullName);
        fd.append('mobileNumber', formData.mobileNumber);
        fd.append('primaryPlatform', formData.primaryPlatform);
        fd.append('instagramUrl', formData.instagramUrl);
        fd.append('youtubeUrl', formData.youtubeUrl);
        // Onboarding data
        fd.append('platforms', JSON.stringify(onboardingData.platforms));
        fd.append('niche', onboardingData.niche);
        fd.append('followers', onboardingData.followers);
        fd.append('engagement', onboardingData.engagement);
        fd.append('priceStory', onboardingData.priceStory);
        fd.append('pricePost', onboardingData.pricePost);
        fd.append('priceCollab', onboardingData.priceCollab);

        try {
            const res = await registerUserAction(fd);

            if (!res?.success) {
                setError(res?.error || 'Registration failed. Please try again.');
                setIsSubmitting(false);
                return;
            }

            // Log the user in silently to establish session for KYC upload API
            await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            // Move to KYC step
            setDirection(1);
            setCurrentStep(11);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validation per step
    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return !!formData.fullName && !!formData.mobileNumber && !!formData.primaryPlatform;
            case 2: return true; // social handles are optional
            case 3: return emailVerified;
            case 4: return !!formData.password && formData.password === formData.confirmPassword && formData.password.length >= 6 && formData.agreeToTerms;
            case 5: return true; // Welcome
            case 6: return onboardingData.platforms.length > 0;
            case 7: return !!onboardingData.niche;
            case 8: return !!onboardingData.followers;
            case 9: return true; // engagement optional
            case 10: return !!onboardingData.rates;
            default: return true;
        }
    };

    const goNext = async () => {
        setError('');
        if (currentStep === 10) {
            // Final step before success — submit everything
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

    return (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative font-sans text-slate-900" style={{ background: "radial-gradient(ellipse at 20% 50%, #e0e7ff 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #fce7f3 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, #dbeafe 0%, transparent 50%), #f8fafc" }}>

            {/* Decorative floating blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 left-[8%] w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />
                <motion.div animate={{ y: [0, 20, 0], x: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-10 right-[8%] w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
                {/* Decorative dots grid */}
                <div className="absolute top-12 right-12 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "24px 24px", width: "120px", height: "120px" }} />
                <div className="absolute bottom-12 left-12 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #8b5cf6 1px, transparent 1px)", backgroundSize: "24px 24px", width: "120px", height: "120px" }} />
            </div>

            {/* Back Button */}
            {
                currentStep > 1 && !isSubmitting && currentStep < 11 && (
                    <button onClick={goBack}
                        className="fixed lg:absolute top-8 left-8 z-50 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
                        <ChevronLeft size={28} />
                    </button>
                )
            }

            {/* Slide Content */}
            <div className="relative z-10 w-full max-w-[28rem] flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction} mode="wait">

                    {/* ===== STEP 1: Enter your details ===== */}
                    {currentStep === 1 && (
                        <CardWrapper stepKey="step1" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-lg shadow-indigo-200/60" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg></div>
                                <h2 className="text-2xl font-extrabold text-center mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Create your account</h2>
                                <p className="text-center text-slate-400 text-sm mb-3">Join thousands of creators earning with top brands.</p>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Full Name */}
                                <div className="space-y-1.5 w-full text-left">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4f46e5] w-5 h-5 transition-colors" />
                                        <input
                                            name="fullName" type="text" value={formData.fullName} onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all text-slate-900"
                                            placeholder="e.g. John Doe" required autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div className="space-y-1.5 w-full text-left">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4f46e5] w-5 h-5 transition-colors" />
                                        <input
                                            name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all text-slate-900"
                                            placeholder="e.g. 9876543210" required
                                        />
                                    </div>
                                </div>

                                {/* Primary Platform */}
                                <div className="space-y-1.5 w-full text-left">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Primary Platform</label>
                                    <div className="relative">
                                        <select name="primaryPlatform" value={formData.primaryPlatform} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base text-slate-900 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all appearance-none cursor-pointer" required>
                                            {platforms.map(p => <option key={p.value} value={p.value} className="bg-white text-slate-900">{p.label}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />

                                <div className="flex items-center my-0 before:flex-1 before:border-t before:border-slate-200 before:mr-4 after:flex-1 after:border-t after:border-slate-200 after:ml-4">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OR CONTINUE WITH</span>
                                </div>

                                <button type="button" onClick={() => signIn('google', { callbackUrl: '/' })}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm transition-all w-full shadow-sm">
                                    <Chrome className="w-5 h-5" /> Google
                                </button>

                                <p className="text-center text-sm text-slate-500 pt-1">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-[#4f46e5] font-bold hover:underline">Sign in</Link>
                                </p>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 2: Social Handles ===== */}
                    {currentStep === 2 && (
                        <CardWrapper stepKey="step2" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <h2 className="text-2xl font-extrabold text-center mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Social Handles</h2>
                                <p className="text-center text-slate-400 text-sm mb-3">Link your social profiles to get discovered.</p>

                                <div className="relative group">
                                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4f46e5] w-5 h-5 transition-colors" />
                                    <input name="instagramUrl" type="url" value={formData.instagramUrl} onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all text-slate-900"
                                        placeholder="Instagram handle" autoFocus />
                                </div>

                                <div className="relative group">
                                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4f46e5] w-5 h-5 transition-colors" />
                                    <input name="youtubeUrl" type="url" value={formData.youtubeUrl} onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all text-slate-900"
                                        placeholder="YouTube channel URL" />
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 3: Email Verification ===== */}
                    {currentStep === 3 && (
                        <CardWrapper stepKey="step3" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <h2 className="text-2xl font-extrabold text-center mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Verify Email</h2>
                                <p className="text-center text-slate-400 text-sm mb-3">We'll send an OTP to confirm your email.</p>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-base font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 block text-left">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4f46e5] w-5 h-5 transition-colors" />
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                                            className={`w-full pl-11 pr-28 py-3.5 border rounded-2xl text-base placeholder-slate-400 transition-all ${emailVerified ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-[#f0f4ff]/50 border-[#e2e8f0] text-slate-900 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:bg-white focus:outline-none'}`}
                                            placeholder="hello@example.com" required disabled={emailVerified || otpSent} autoFocus />
                                        {emailVerified && (
                                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400" />
                                        )}
                                        {!emailVerified && formData.email && !otpSent && (
                                            <button type="button" onClick={requestOtp} disabled={otpLoading}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 font-bold text-[#4f46e5] bg-[#f0f4ff] rounded-xl hover:bg-[#e0e7ff] transition-all disabled:opacity-50 text-sm">
                                                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
                                            </button>
                                        )}
                                    </div>
                                    {otpSent && !emailVerified && (
                                        <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                                            className="text-sm text-slate-500 hover:text-white font-medium pl-2 transition-colors">
                                            ← Change email
                                        </button>
                                    )}
                                </div>

                                {/* OTP Entry */}
                                {otpSent && !emailVerified && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-4">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center block">Enter Code</label>
                                        <div className="flex gap-3">
                                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                                <input
                                                    key={i}
                                                    type="text"
                                                    maxLength={1}
                                                    value={otp[i] || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        const newOtp = otp.split('');
                                                        newOtp[i] = val;
                                                        setOtp(newOtp.join(''));
                                                        if (val && i < 5) {
                                                            const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                                                            next?.focus();
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !otp[i] && i > 0) {
                                                            const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement;
                                                            prev?.focus();
                                                        }
                                                    }}
                                                    className="w-full aspect-square text-center text-2xl font-bold border border-[#e2e8f0] rounded-2xl focus:outline-none focus:border-[#4f46e5] bg-[#f0f4ff]/50 text-slate-900 transition-all focus:bg-white"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between px-1">
                                            <button type="button" onClick={requestOtp} disabled={otpLoading}
                                                className="text-sm text-slate-500 hover:text-white font-medium">
                                                Resend code
                                            </button>
                                        </div>
                                        <NextButton label={otpLoading ? "Verifying..." : "Verify Code"} onClick={verifyOtp} disabled={otpLoading || otp.length !== 6} />
                                    </motion.div>
                                )}

                                <div className="space-y-3 pt-4">
                                    {emailVerified ? (
                                        <NextButton onClick={goNext} disabled={!canProceed()} />
                                    ) : (
                                        <div className="pt-8">
                                            <button
                                                type="button"
                                                onClick={goNext}
                                                disabled={!formData.email}
                                                className="w-full py-4 text-slate-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                Skip Verification
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 4: Password ===== */}
                    {currentStep === 4 && (
                        <CardWrapper stepKey="step4" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <h2 className="text-2xl font-extrabold text-center mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Secure Account</h2>
                                <p className="text-center text-slate-400 text-sm mb-3">Choose a strong password to protect your account.</p>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Password */}
                                <div className="space-y-1.5 w-full text-left">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4f46e5] w-5 h-5 transition-colors" />
                                        <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                                            className="w-full pl-11 pr-11 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all text-slate-900"
                                            placeholder="Min. 6 characters" required autoFocus />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5 w-full text-left">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4f46e5] w-5 h-5 transition-colors" />
                                        <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange}
                                            className="w-full pl-11 pr-11 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all text-slate-900"
                                            placeholder="Repeat your password" required />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1">
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Match Indicator */}
                                {formData.password && formData.confirmPassword && (
                                    <div className={`text-sm font-medium flex items-center gap-1.5 pl-2 ${formData.password === formData.confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formData.password === formData.confirmPassword ? <Check className="w-4 h-4" /> : <span className="w-4 h-4 font-bold">✕</span>}
                                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                    </div>
                                )}

                                {/* Terms */}
                                <div className="flex items-start gap-3 px-1">
                                    <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#4f46e5] accent-[#4f46e5] focus:ring-[#4f46e5] cursor-pointer" />
                                    <label htmlFor="agreeToTerms" className="text-sm text-slate-500 leading-relaxed cursor-pointer">
                                        I agree to the <Link href="/terms" className="text-[#4f46e5] font-semibold hover:underline">Terms</Link> and <Link href="/privacy" className="text-[#4f46e5] font-semibold hover:underline">Privacy Policy</Link>.
                                    </label>
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 5: Welcome (Onboarding Start) ===== */}
                    {currentStep === 5 && (
                        <CardWrapper stepKey="step5" direction={direction} progressPercentage={progressPercentage}>
                            <div className="flex flex-col items-center text-center space-y-8">
                                <div className="w-20 h-20 rounded-2xl rotate-3 shadow-xl shadow-orange-200/60 flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                                    <Sparkles className="w-12 h-12 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    Welcome Creator!
                                </h1>
                                <p className="text-lg md:text-xl text-slate-600 max-w-sm mx-auto leading-relaxed">
                                    Start earning by collaborating with top brands. It's time to monetize your passion.
                                </p>
                                <ProceedButton label="Let's Go" onClick={goNext} disabled={false} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 6: Platforms Selection ===== */}
                    {currentStep === 6 && (
                        <CardWrapper stepKey="step6" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-4">
                                <div className="text-center">
                                    <h2 className="text-xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Which platforms?</h2>
                                    <p className="text-slate-400 text-xs">Pick the ones you create on.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: "Instagram", icon: Instagram, activeColor: "text-pink-500", inactiveColor: "text-pink-400", activeBg: "bg-pink-50", inactiveBg: "bg-pink-50/60" },
                                        { id: "YouTube", icon: Youtube, activeColor: "text-red-500", inactiveColor: "text-red-400", activeBg: "bg-red-50", inactiveBg: "bg-red-50/60" },
                                    ].map((p) => {
                                        const isActive = onboardingData.platforms.includes(p.id);
                                        return (
                                            <motion.button
                                                key={p.id}
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => togglePlatform(p.id)}
                                                className={`py-5 px-4 rounded-2xl border-2 flex flex-col items-center gap-2.5 transition-all cursor-pointer relative
                                    ${isActive
                                                        ? "bg-indigo-50 border-indigo-400 shadow-md shadow-indigo-100/60 ring-1 ring-indigo-200"
                                                        : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                                                    }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? p.activeBg : p.inactiveBg}`}>
                                                    <p.icon className={`w-6 h-6 ${isActive ? p.activeColor : p.inactiveColor}`} />
                                                </div>
                                                <span className={`font-semibold text-sm ${isActive ? 'text-indigo-700' : 'text-slate-600'}`}>{p.id}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <ProceedButton label="Next Step" onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 7: Niche ===== */}
                    {currentStep === 7 && (
                        <CardWrapper stepKey="step7" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full max-w-md space-y-6 flex flex-col items-center">
                                <h2 className="text-2xl font-extrabold text-center mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Primary Niche?</h2>
                                {!isCustomNiche ? (
                                    <div className="grid grid-cols-2 gap-2.5 w-full">
                                        {[
                                            { name: "Fashion", icon: Shirt },
                                            { name: "Tech", icon: Laptop },
                                            { name: "Fitness", icon: Dumbbell },
                                            { name: "Finance", icon: TrendingUp },
                                            { name: "Travel", icon: Globe },
                                            { name: "Food", icon: Utensils },
                                            { name: "Gaming", icon: Gamepad2 },
                                            { name: "Lifestyle", icon: Heart },
                                            { name: "Education", icon: GraduationCap },
                                            { name: "Other", icon: Sparkles },
                                        ].map((item) => (
                                            <motion.button
                                                key={item.name}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    if (item.name === "Other") {
                                                        setIsCustomNiche(true);
                                                        updateOnboarding("niche", "");
                                                    } else {
                                                        updateOnboarding("niche", item.name);
                                                        // Auto progress when standard niche picked
                                                        goNext();
                                                    }
                                                }}
                                                className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer
                                ${onboardingData.niche === item.name
                                                        ? "bg-indigo-50 text-indigo-600 border-indigo-400 shadow-md shadow-indigo-100/60 ring-1 ring-indigo-200"
                                                        : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700 transition-all"
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${onboardingData.niche === item.name ? "bg-[#4f46e5]/10" : "bg-slate-100"}`}>
                                                    <item.icon size={20} />
                                                </div>
                                                <span className="font-semibold">{item.name}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 w-full pt-4">
                                        <div className="relative">
                                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                                            <input
                                                type="text"
                                                value={onboardingData.niche}
                                                onChange={(e) => updateOnboarding("niche", e.target.value)}
                                                className="w-full pl-14 pr-6 py-6 bg-white/10 border-2 border-white/20 rounded-2xl text-2xl text-white font-bold placeholder-white/30 focus:outline-none focus:border-white/50 transition-all shadow-inner"
                                                placeholder="Enter your niche"
                                                autoFocus
                                            />
                                        </div>
                                        <NextButton onClick={goNext} disabled={!onboardingData.niche} />
                                        <button onClick={() => setIsCustomNiche(false)} className="w-full text-center text-sm text-slate-500 hover:text-white uppercase font-bold tracking-widest py-2">
                                            ← Return to list
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 8: Followers ===== */}
                    {currentStep === 8 && (
                        <CardWrapper stepKey="step8" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <h2 className="text-2xl font-extrabold text-center mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>How many followers?</h2>
                                <div className="space-y-4">
                                    {["1K - 10K", "10K - 50K", "50K - 100K", "100K - 500K", "500K+"].map((range) => (
                                        <motion.button
                                            key={range}
                                            whileHover={{ scale: 1.01, x: 5 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => {
                                                updateOnboarding("followers", range)
                                                goNext()
                                            }}
                                            className={`w-full py-4 px-5 rounded-2xl border-2 flex justify-between items-center transition-all cursor-pointer hover:translate-x-1
                                ${onboardingData.followers === range
                                                    ? "bg-indigo-50 text-indigo-600 border-indigo-400 shadow-md shadow-indigo-100/60 ring-1 ring-indigo-200"
                                                    : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700 transition-all"
                                                }`}
                                        >
                                            <span className="font-bold text-lg">{range}</span>
                                            {onboardingData.followers === range && <Check />}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 9: Engagement ===== */}
                    {currentStep === 9 && (
                        <CardWrapper stepKey="step9" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <div className="text-center">
                                    <h2 className="text-xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Average Engagement?</h2>
                                    <p className="text-xs text-slate-400">Optional, but helps you stand out.</p>
                                </div>

                                <div className="max-w-[220px] mx-auto flex items-center bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl shadow-sm focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5] focus-within:bg-white transition-all overflow-hidden">
                                    <input type="number" value={onboardingData.engagement}
                                        onChange={(e) => updateOnboarding("engagement", e.target.value)}
                                        placeholder="e.g. 4.5"
                                        className="flex-1 px-5 py-3 text-2xl text-center font-black placeholder-slate-300 focus:outline-none bg-transparent text-slate-900 min-w-0"
                                        autoFocus />
                                    <span className="pr-4 text-slate-400 font-bold text-xl select-none">%</span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <NextButton onClick={goNext} disabled={!canProceed()} />
                                    <button onClick={goNext} className="text-slate-400 hover:text-slate-600 font-medium py-2 transition-colors text-center w-full text-sm">
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        </CardWrapper>
                    )}


                    {/* ===== STEP 10: Pricing ===== */}
                    {currentStep === 10 && (
                        <CardWrapper stepKey="step10" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full max-w-md space-y-6 flex flex-col justify-center items-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl rotate-3 shadow-lg mb-2">
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-center mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Minimum Price?</h2>
                                <p className="text-slate-500 text-center max-w-xs mb-4">Setting a competitive minimum price boosts your visibility.</p>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-medium w-full text-center">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="w-full space-y-3">
                                    {/* Per Story Input */}
                                    <div className="relative w-full">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide">
                                            STORY
                                        </div>
                                        <IndianRupee className="absolute left-[90px] top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                        <input type="number" value={onboardingData.priceStory}
                                            onChange={(e) => updateOnboarding("priceStory", e.target.value)}
                                            placeholder="500"
                                            className="w-full pl-32 pr-4 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base font-bold placeholder-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all text-slate-900 appearance-none" />
                                    </div>

                                    {/* Per Post Input */}
                                    <div className="relative w-full">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide">
                                            POST
                                        </div>
                                        <IndianRupee className="absolute left-[90px] top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                        <input type="number" value={onboardingData.pricePost}
                                            onChange={(e) => updateOnboarding("pricePost", e.target.value)}
                                            placeholder="1000"
                                            className="w-full pl-32 pr-4 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base font-bold placeholder-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all text-slate-900 appearance-none" />
                                    </div>

                                    {/* Per Collab Input */}
                                    <div className="relative w-full">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide">
                                            COLLAB
                                        </div>
                                        <IndianRupee className="absolute left-[90px] top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                        <input type="number" value={onboardingData.priceCollab}
                                            onChange={(e) => updateOnboarding("priceCollab", e.target.value)}
                                            placeholder="5000"
                                            className="w-full pl-32 pr-4 py-2.5 bg-[#f0f4ff]/50 border border-[#e2e8f0] rounded-2xl text-base font-bold placeholder-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] focus:outline-none transition-all text-slate-900 appearance-none" />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleFinalSubmit}
                                    disabled={(!onboardingData.priceStory && !onboardingData.pricePost && !onboardingData.priceCollab) || isSubmitting}
                                    className="w-full py-4 mt-6 text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/60" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                                >
                                    {isSubmitting ? (
                                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                                    ) : "Complete Setup"}
                                </motion.button>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 11: Live Photo KYC ===== */}
                    {currentStep === 11 && (
                        <CardWrapper stepKey="step11" direction={direction} progressPercentage={90}>
                            <div className="w-full max-w-md space-y-6 flex flex-col justify-center items-center relative z-10 text-white">
                                <div className="text-center space-y-2 mb-2 w-full">
                                    <h2 className="text-3xl md:text-3xl font-bold text-slate-900 drop-shadow-sm">Identity Verification</h2>
                                    <p className="text-slate-500 text-sm">Take a quick selfie to verify your identity and build trust with brands.</p>
                                </div>
                                <div className="w-full bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                                    <LivePhotoCapture
                                        userId={""} // The API fetches userId from the active session we just created
                                        onUploadSuccess={(key: string) => {
                                            setKycCompleted(true);
                                            setDirection(1);
                                            setCurrentStep(12);
                                        }}
                                    />
                                </div>
                                <button onClick={() => {
                                    setDirection(1);
                                    setCurrentStep(12);
                                }} className="text-slate-400 hover:text-white font-medium text-sm transition-colors text-center w-full mt-4 underline decoration-white/20">
                                    Skip for now (Do this later from Dashboard)
                                </button>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 12: Final Success ===== */}
                    {currentStep === 12 && (
                        <CardWrapper stepKey="step12" direction={direction} progressPercentage={100}>
                            <div className="flex flex-col items-center text-center space-y-8">
                                <div className="w-24 h-24 rounded-full flex items-center justify-center relative shadow-xl shadow-emerald-200/60" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                                        <Check className="w-12 h-12 text-white" />
                                    </motion.div>
                                    <motion.div className="absolute inset-0 border-4 border-white/30 rounded-full"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.2, opacity: 0 }}
                                        transition={{ delay: 0.4, duration: 1.5, repeat: Infinity }}
                                    />
                                </div>

                                <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Profile Setup Complete!</h1>
                                <p className="text-xl text-slate-600 max-w-sm mx-auto">
                                    Your potential is limitless. Brands can now discover your unique talent.
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/creator/dashboard')}
                                    className="px-10 py-4 mt-6 text-white text-lg font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-200/60 hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                                >
                                    Go to Dashboard <ArrowRight size={24} />
                                </motion.button>
                            </div>
                        </CardWrapper>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="fixed bottom-6 w-full text-center text-slate-400 text-xs pointer-events-none">
                <p>Trusted by 10,000+ creators worldwide</p>
            </div>
        </div >
    );
}
