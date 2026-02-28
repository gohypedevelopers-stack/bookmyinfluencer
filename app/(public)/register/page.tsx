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

// Total steps
const TOTAL_STEPS = 11;

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
    <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden min-h-[650px] flex flex-col items-center justify-center relative z-10 text-white">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-white/10">
            <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
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
            className="w-full p-8 md:p-12 flex flex-col items-center justify-center flex-1"
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
        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={disabled}
        className="w-full py-5 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl font-bold text-lg hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 mt-4"
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className="px-10 py-5 bg-white text-purple-600 text-xl font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-3 mt-4 w-full md:w-auto"
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

    const progressPercentage = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

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
        fd.append('minimumPrice', onboardingData.minimumPrice);
        fd.append('rates', onboardingData.rates);
        fd.append('priceStory', onboardingData.priceStory);
        fd.append('pricePost', onboardingData.pricePost);
        fd.append('priceCollab', onboardingData.priceCollab);
        fd.append('priceType', onboardingData.priceType);

        try {
            await registerUserAction(fd);
            // Move to success step
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 overflow-hidden relative font-sans">

            {/* Background Animated Blobs - exactly matching CreatorOnboarding */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                />
                <motion.div
                    animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 -right-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                />
            </div>

            {/* Back Button */}
            {
                currentStep > 1 && !isSubmitting && currentStep < 11 && (
                    <button onClick={goBack}
                        className="fixed lg:absolute top-8 left-8 z-50 p-2 rounded-full hover:bg-white/10 transition-colors text-white/80">
                        <ChevronLeft size={28} />
                    </button>
                )
            }

            {/* Slide Content */}
            <div className="relative z-10 w-full max-w-xl flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction} mode="wait">

                    {/* ===== STEP 1: Enter your details ===== */}
                    {currentStep === 1 && (
                        <CardWrapper stepKey="step1" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full max-w-md space-y-8">
                                <h2 className="text-3xl font-bold text-center">First, your details</h2>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Full Name */}
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" />
                                    <input
                                        name="fullName" type="text" value={formData.fullName} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-xl placeholder-white/40 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white"
                                        placeholder="Full Name" required autoFocus
                                    />
                                </div>

                                {/* Mobile Number */}
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" />
                                    <input
                                        name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-xl placeholder-white/40 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white"
                                        placeholder="Mobile Number" required
                                    />
                                </div>

                                {/* Primary Platform */}
                                <div className="relative">
                                    <select name="primaryPlatform" value={formData.primaryPlatform} onChange={handleInputChange}
                                        className="w-full px-6 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-xl focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all appearance-none cursor-pointer" required>
                                        {platforms.map(p => <option key={p.value} value={p.value} className="bg-purple-600 text-white">{p.label}</option>)}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />

                                <div className="flex justify-center pt-2">
                                    <button type="button" onClick={() => signIn('google', { callbackUrl: '/' })}
                                        className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-medium text-base transition-all w-full max-w-[280px]">
                                        <Chrome className="w-5 h-5" /> Continue with Google
                                    </button>
                                </div>

                                <p className="text-center text-sm text-white/60">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-white font-bold hover:underline">Log in</Link>
                                </p>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 2: Social Handles ===== */}
                    {currentStep === 2 && (
                        <CardWrapper stepKey="step2" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full max-w-md space-y-8">
                                <h2 className="text-3xl font-bold text-center">Social Handles</h2>

                                <div className="relative group">
                                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" />
                                    <input name="instagramUrl" type="url" value={formData.instagramUrl} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-xl placeholder-white/40 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white"
                                        placeholder="Instagram handle" autoFocus />
                                </div>

                                <div className="relative group">
                                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" />
                                    <input name="youtubeUrl" type="url" value={formData.youtubeUrl} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-xl placeholder-white/40 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white"
                                        placeholder="YouTube channel URL" />
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 3: Email Verification ===== */}
                    {currentStep === 3 && (
                        <CardWrapper stepKey="step3" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full max-w-md space-y-6">
                                <h2 className="text-3xl font-bold text-center">Verify Email</h2>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-base font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email input */}
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" />
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                                            className={`w-full pl-12 pr-28 py-5 border-2 rounded-2xl text-xl placeholder-white/40 transition-all ${emailVerified ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-white/10 border-white/20 text-white focus:border-white/50 focus:bg-white/20 focus:outline-none'}`}
                                            placeholder="hello@example.com" required disabled={emailVerified || otpSent} autoFocus />
                                        {emailVerified && (
                                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400" />
                                        )}
                                        {!emailVerified && formData.email && !otpSent && (
                                            <button type="button" onClick={requestOtp} disabled={otpLoading}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 font-bold text-white bg-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50">
                                                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
                                            </button>
                                        )}
                                    </div>
                                    {otpSent && !emailVerified && (
                                        <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                                            className="text-sm text-white/60 hover:text-white font-medium pl-2 transition-colors">
                                            ← Change email
                                        </button>
                                    )}
                                </div>

                                {/* OTP Entry */}
                                {otpSent && !emailVerified && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-4">
                                        <label className="text-sm font-bold text-white/60 uppercase tracking-wider text-center block">Enter Code</label>
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
                                                    className="w-full aspect-square text-center text-3xl font-bold border-2 border-white/20 rounded-2xl focus:outline-none focus:border-white/50 bg-white/10 text-white transition-all"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between px-1">
                                            <button type="button" onClick={requestOtp} disabled={otpLoading}
                                                className="text-sm text-white/60 hover:text-white font-medium">
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
                                                className="w-full py-4 text-white/40 hover:text-white font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                            <div className="w-full max-w-md space-y-6">
                                <h2 className="text-3xl font-bold text-center">Secure Account</h2>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Password */}
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" />
                                    <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-xl placeholder-white/40 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white"
                                        placeholder="Password" required autoFocus />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" />
                                    <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-xl placeholder-white/40 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white"
                                        placeholder="Confirm Password" required />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1">
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Match Indicator */}
                                {formData.password && formData.confirmPassword && (
                                    <div className={`text-sm font-medium flex items-center gap-1.5 pl-2 ${formData.password === formData.confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formData.password === formData.confirmPassword ? <Check className="w-4 h-4" /> : <span className="w-4 h-4 font-bold">✕</span>}
                                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                    </div>
                                )}

                                {/* Terms */}
                                <div className="flex items-start gap-3 pt-4 px-1">
                                    <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
                                        className="mt-1 h-5 w-5 rounded border-white/20 text-purple-600 focus:ring-white/10 cursor-pointer bg-white/10" />
                                    <label htmlFor="agreeToTerms" className="text-sm text-white/80 leading-relaxed cursor-pointer">
                                        I agree to the <Link href="/terms" className="text-white font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-white font-bold hover:underline">Privacy</Link>.
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
                                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl rotate-3 shadow-lg flex items-center justify-center mb-2">
                                    <Sparkles className="w-12 h-12 text-white" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
                                    Welcome Creator!
                                </h1>
                                <p className="text-lg md:text-xl text-white/80 max-w-sm mx-auto leading-relaxed">
                                    Start earning by collaborating with top brands. It's time to monetize your passion.
                                </p>
                                <ProceedButton label="Let's Go" onClick={goNext} disabled={false} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 6: Platforms Selection ===== */}
                    {currentStep === 6 && (
                        <CardWrapper stepKey="step6" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full max-w-md space-y-6">
                                <h2 className="text-3xl font-bold text-center">Which platforms?</h2>
                                <p className="text-white/70 text-center -mt-4">Pick the ones you create on.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: "Instagram", icon: Instagram, color: "group-hover:text-pink-400" },
                                        { id: "YouTube", icon: Youtube, color: "group-hover:text-red-500" },
                                    ].map((p) => (
                                        <motion.button
                                            key={p.id}
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => togglePlatform(p.id)}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all group backdrop-blur-sm
                                ${onboardingData.platforms.includes(p.id)
                                                    ? "bg-white text-purple-600 border-white shadow-lg"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                                }`}
                                        >
                                            <p.icon className={`w-8 h-8 ${!onboardingData.platforms.includes(p.id) ? "text-white" : "text-purple-600"}`} />
                                            <span className="font-semibold">{p.id}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                <ProceedButton label="Next Step" onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 7: Niche ===== */}
                    {currentStep === 7 && (
                        <CardWrapper stepKey="step7" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full max-w-md space-y-6 flex flex-col items-center">
                                <h2 className="text-3xl font-bold text-center">Your Primary Niche?</h2>
                                {!isCustomNiche ? (
                                    <div className="grid grid-cols-2 gap-3 w-full h-[360px] overflow-y-auto pr-2 custom-scrollbar">
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
                                                className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left
                                ${onboardingData.niche === item.name
                                                        ? "bg-white text-purple-600 border-white shadow-lg"
                                                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${onboardingData.niche === item.name ? "bg-purple-100" : "bg-white/10"}`}>
                                                    <item.icon size={20} />
                                                </div>
                                                <span className="font-semibold">{item.name}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 w-full pt-10">
                                        <div className="relative">
                                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
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
                                        <button onClick={() => setIsCustomNiche(false)} className="w-full text-center text-sm text-white/60 hover:text-white uppercase font-bold tracking-widest py-2">
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
                            <div className="w-full max-w-md space-y-8">
                                <h2 className="text-3xl font-bold text-center">How many followers?</h2>
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
                                            className={`w-full p-5 rounded-xl border flex justify-between items-center transition-all
                                ${onboardingData.followers === range
                                                    ? "bg-white text-purple-600 border-white shadow-lg"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
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
                            <div className="w-full max-w-md space-y-8">
                                <h2 className="text-3xl font-bold text-center">Average Engagement?</h2>
                                <p className="text-center text-white/70 -mt-6">Optional, but helps you stand out.</p>

                                <div className="relative max-w-[280px] mx-auto">
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 font-bold text-3xl z-10">%</span>
                                    <input type="number" value={onboardingData.engagement}
                                        onChange={(e) => updateOnboarding("engagement", e.target.value)}
                                        placeholder="e.g. 4.5"
                                        className="w-full px-6 py-6 bg-white/10 border-2 border-white/20 rounded-3xl text-5xl text-center font-black placeholder-white/20 focus:outline-none focus:border-white/50 transition-all text-white shadow-inner"
                                        autoFocus />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <NextButton onClick={goNext} disabled={!canProceed()} />
                                    <button onClick={goNext} className="text-white/60 hover:text-white font-medium py-3 transition-colors text-center w-full">
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
                                <h2 className="text-3xl font-bold text-center">Your Minimum Price?</h2>
                                <p className="text-white/70 text-center max-w-xs mb-4">Setting a competitive minimum price boosts your visibility.</p>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-medium w-full text-center">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative w-full flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60 w-8 h-8 pointer-events-none" />
                                        <input type="number" value={onboardingData.rates}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                updateOnboarding("rates", val);
                                                updateOnboarding("minimumPrice", val); // Sync them
                                                updateOnboarding("pricePost", val);
                                            }}
                                            placeholder="1000"
                                            className="w-full pl-20 pr-6 py-6 bg-white/10 border-2 border-white/20 rounded-2xl text-4xl font-bold placeholder-white/20 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white appearance-none" />
                                    </div>
                                    <select
                                        value={onboardingData.priceType}
                                        onChange={(e) => updateOnboarding("priceType", e.target.value)}
                                        className="py-6 px-6 bg-white/10 border-2 border-white/20 rounded-2xl text-xl font-bold focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all text-white cursor-pointer appearance-none min-w-[160px] text-center"
                                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                    >
                                        <option value="Per Post" className="text-gray-900 font-medium">per post</option>
                                        <option value="Per Story" className="text-gray-900 font-medium">per story</option>
                                        <option value="Per Collab" className="text-gray-900 font-medium">per collab</option>
                                    </select>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleFinalSubmit}
                                    disabled={!onboardingData.rates || isSubmitting}
                                    className="w-full mt-6 py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-green-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                                    ) : "Complete Setup"}
                                </motion.button>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 11: Final Success ===== */}
                    {currentStep === 11 && (
                        <CardWrapper stepKey="step11" direction={direction} progressPercentage={progressPercentage}>
                            <div className="flex flex-col items-center text-center space-y-8">
                                <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center relative">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                                        <Check className="w-14 h-14 text-white" />
                                    </motion.div>
                                    <motion.div className="absolute inset-0 border-4 border-white/30 rounded-full"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.2, opacity: 0 }}
                                        transition={{ delay: 0.4, duration: 1.5, repeat: Infinity }}
                                    />
                                </div>

                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Profile Setup Complete!</h1>
                                <p className="text-xl text-white/80 max-w-sm mx-auto">
                                    Your potential is limitless. Brands can now discover your unique talent.
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={async () => {
                                        const result = await signIn('credentials', {
                                            email: formData.email,
                                            password: formData.password,
                                            redirect: false,
                                        });
                                        router.push(result?.ok ? '/creator/dashboard' : '/login');
                                    }}
                                    className="px-12 py-5 mt-6 bg-white text-purple-600 text-xl font-bold rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all flex items-center gap-3"
                                >
                                    Go to Dashboard <ArrowRight size={24} />
                                </motion.button>
                            </div>
                        </CardWrapper>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="fixed bottom-6 w-full text-center text-white/40 text-sm pointer-events-none">
                <p>Trusted by 10,000+ creators worldwide</p>
            </div>
        </div >
    );
}
