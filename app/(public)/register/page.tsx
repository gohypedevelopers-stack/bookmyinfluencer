'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, User, Phone, Instagram, Youtube, Mail, Lock,
    CheckCircle, ArrowRight, Loader2, Chrome, Github, Sparkles,
    Check, ChevronLeft, Facebook, Twitter, Linkedin,
    Gamepad2, Dumbbell, Utensils, Laptop, Shirt,
    GraduationCap, Globe, Heart, IndianRupee, TrendingUp, Zap, Layers
} from 'lucide-react';
import { registerUserAction } from './actions';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

// Total steps
const TOTAL_STEPS = 12;

const stepTitles = [
    "Enter your details",
    "Add your social handles",
    "Verify your email",
    "Create a secure password",
    "Welcome",
    "Select platforms",
    "Your niche",
    "Follower count",
    "Engagement rate",
    "Minimum price",
    "Starting rates",
    "All done!"
];

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

        try {
            await registerUserAction(fd);
            // Move to success step
            setDirection(1);
            setCurrentStep(12);
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
            case 5: return true; // welcome
            case 6: return onboardingData.platforms.length > 0;
            case 7: return !!onboardingData.niche;
            case 8: return !!onboardingData.followers;
            case 9: return true; // engagement optional
            case 10: return !!onboardingData.minimumPrice;
            case 11: return !!onboardingData.rates;
            default: return true;
        }
    };

    const goNext = async () => {
        setError('');
        if (currentStep === 11) {
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

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 400 : -400, opacity: 0, scale: 0.96 }),
        center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 400 : -400, opacity: 0, scale: 0.96 }),
    };

    const platforms = [
        { value: '', label: 'Select Platform' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'twitter', label: 'Twitter/X' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'facebook', label: 'Facebook' },
    ];

    // Common card wrapper
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
            <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl shadow-purple-900/20 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-6 py-4 flex items-center gap-2">
                    <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">BookMyInfluencers</span>
                </div>

                {/* Progress bar inside card */}
                <div className="w-full h-1.5 bg-gray-100">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8">
                    {children}
                </div>
            </div>
        </motion.div>
    );

    // Common Next button
    const NextButton = ({ label = "Next", onClick, disabled, loading: btnLoading }: { label?: string; onClick?: () => void; disabled?: boolean; loading?: boolean }) => (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick || goNext}
            disabled={disabled !== undefined ? disabled : !canProceed()}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {btnLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
                <>{label} <ArrowRight className="w-4 h-4" /></>
            )}
        </motion.button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                />
                <motion.div
                    animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                />
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
                />
            </div>

            {/* Back Button */}
            {currentStep > 1 && currentStep < 12 && (
                <button
                    onClick={goBack}
                    className="fixed top-6 left-6 z-50 p-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors text-white"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {/* Step Counter */}
            {currentStep < 12 && (
                <div className="fixed top-6 right-6 z-50 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                    {currentStep} / {TOTAL_STEPS - 1}
                </div>
            )}

            {/* Slide Content */}
            <div className="relative z-10 w-full max-w-lg">
                <AnimatePresence initial={false} custom={direction} mode="wait">

                    {/* ===== STEP 1: Enter your details ===== */}
                    {currentStep === 1 && (
                        <CardWrapper stepKey="step1">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Enter your details</h2>
                                    <p className="text-sm text-gray-500 mt-1">Let's start with the basics</p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            name="fullName" type="text" value={formData.fullName} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                            placeholder="John Doe" required autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                            placeholder="+1 (555) 000-0000" required
                                        />
                                    </div>
                                </div>

                                {/* Primary Platform */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select your primary platform</label>
                                    <div className="relative">
                                        <select name="primaryPlatform" value={formData.primaryPlatform} onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer" required>
                                            {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <NextButton />

                                {/* Social Login Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => signIn('google', { callbackUrl: '/' })}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-100 transition-all">
                                        <Chrome className="w-4 h-4" /> Google
                                    </button>
                                    <button type="button" onClick={() => signIn('github', { callbackUrl: '/' })}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-100 transition-all">
                                        <Github className="w-4 h-4" /> GitHub
                                    </button>
                                </div>

                                <p className="text-center text-sm text-gray-500">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-indigo-600 font-bold hover:underline">Log in →</Link>
                                </p>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 2: Social Handles ===== */}
                    {currentStep === 2 && (
                        <CardWrapper stepKey="step2">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Add your social handles</h2>
                                    <p className="text-sm text-gray-500 mt-1">Help brands find you easily</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Instagram URL</label>
                                    <div className="relative group">
                                        <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                                        <input name="instagramUrl" type="url" value={formData.instagramUrl} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 focus:bg-white transition-all"
                                            placeholder="instagram.com/@handle" autoFocus />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">YouTube URL</label>
                                    <div className="relative group">
                                        <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                        <input name="youtubeUrl" type="url" value={formData.youtubeUrl} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all"
                                            placeholder="youtube.com/@channel" />
                                    </div>
                                </div>

                                <NextButton />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 3: Email Verification ===== */}
                    {currentStep === 3 && (
                        <CardWrapper stepKey="step3">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Verify your email</h2>
                                    <p className="text-sm text-gray-500 mt-1">We'll send a verification code</p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email input */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                                            className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${emailVerified ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white'}`}
                                            placeholder="gohypemedia1@gmail.com" required disabled={emailVerified} autoFocus />
                                        {emailVerified && (
                                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                        )}
                                        {!emailVerified && formData.email && !otpSent && (
                                            <button type="button" onClick={requestOtp} disabled={otpLoading}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all disabled:opacity-50">
                                                {otpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Send Code'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* OTP Entry */}
                                {otpSent && !emailVerified && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enter the verification code</label>
                                        <div className="flex gap-2">
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
                                                        // Auto-focus next
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
                                                    className="w-full aspect-square text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-gray-50 text-gray-800 transition-all"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <button type="button" onClick={requestOtp} disabled={otpLoading}
                                                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                                                Resend code in 49s
                                            </button>
                                        </div>
                                        <button type="button" onClick={verifyOtp} disabled={otpLoading || otp.length !== 6}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                                            {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
                                        </button>
                                    </motion.div>
                                )}

                                {emailVerified && <NextButton />}
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 4: Password ===== */}
                    {currentStep === 4 && (
                        <CardWrapper stepKey="step4">
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Create a secure password</h2>
                                    <p className="text-sm text-gray-500 mt-1">Answer a confirmation code. questions</p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enter the verification code</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                                            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                            placeholder="••••••••" required autoFocus />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange}
                                            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                            placeholder="••••••••" required />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Match Indicator */}
                                {formData.password && formData.confirmPassword && (
                                    <div className={`text-xs font-medium flex items-center gap-1.5 ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                                        {formData.password === formData.confirmPassword ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5">✕</span>}
                                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                    </div>
                                )}

                                {/* Resend + Safety Info */}
                                <p className="text-xs text-gray-400">Resend code in 83s · SafeMedia</p>

                                {/* Terms */}
                                <div className="flex items-start gap-3">
                                    <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                                    <label htmlFor="agreeToTerms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                                        I agree to the <Link href="/terms" className="text-indigo-600 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link>.
                                    </label>
                                </div>

                                <NextButton />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 5: Welcome (Onboarding Start) ===== */}
                    {currentStep === 5 && (
                        <CardWrapper stepKey="step5">
                            <div className="flex flex-col items-center text-center space-y-6 py-6">
                                <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl rotate-3 shadow-lg flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome Creator!</h1>
                                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                                        Almost there! Let's set up your profile so brands can discover you.
                                    </p>
                                </div>
                                <NextButton label="Let's Go" />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 6: Platforms Selection ===== */}
                    {currentStep === 6 && (
                        <CardWrapper stepKey="step6">
                            <div className="space-y-5">
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-gray-900">Which platforms?</h2>
                                    <p className="text-sm text-gray-500 mt-1">Pick the ones you create on</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: "Instagram", icon: Instagram, activeColor: "text-pink-500" },
                                        { id: "YouTube", icon: Youtube, activeColor: "text-red-500" },
                                        { id: "TikTok", label: "TikTok", activeColor: "text-cyan-500" },
                                        { id: "Twitter (X)", icon: Twitter, activeColor: "text-blue-400" },
                                        { id: "LinkedIn", icon: Linkedin, activeColor: "text-blue-700" },
                                        { id: "Facebook", icon: Facebook, activeColor: "text-blue-600" },
                                    ].map((p) => (
                                        <motion.button
                                            key={p.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => togglePlatform(p.id)}
                                            className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left ${onboardingData.platforms.includes(p.id)
                                                ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            {p.icon ? (
                                                <p.icon className={`w-5 h-5 ${onboardingData.platforms.includes(p.id) ? p.activeColor : "text-gray-400"}`} />
                                            ) : (
                                                <span className="w-5 h-5 flex items-center justify-center font-bold text-xs text-gray-400">Tk</span>
                                            )}
                                            <span className="font-semibold text-sm">{p.id}</span>
                                            {onboardingData.platforms.includes(p.id) && <Check className="w-4 h-4 ml-auto text-indigo-500" />}
                                        </motion.button>
                                    ))}
                                </div>

                                <NextButton />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 7: Niche ===== */}
                    {currentStep === 7 && (
                        <CardWrapper stepKey="step7">
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 text-center">Your Primary Niche?</h2>
                                <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
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
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => { updateOnboarding("niche", item.name); goNext(); }}
                                            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${onboardingData.niche === item.name
                                                ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            <div className={`p-1.5 rounded-lg ${onboardingData.niche === item.name ? "bg-indigo-100" : "bg-gray-100"}`}>
                                                <item.icon size={16} />
                                            </div>
                                            <span className="font-semibold text-sm">{item.name}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 8: Followers ===== */}
                    {currentStep === 8 && (
                        <CardWrapper stepKey="step8">
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 text-center">How many followers?</h2>
                                <div className="space-y-2.5">
                                    {["1K - 10K", "10K - 50K", "50K - 100K", "100K - 500K", "500K+"].map((range) => (
                                        <motion.button
                                            key={range}
                                            whileHover={{ scale: 1.01, x: 3 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => { updateOnboarding("followers", range); goNext(); }}
                                            className={`w-full p-3.5 rounded-xl border flex justify-between items-center transition-all ${onboardingData.followers === range
                                                ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            <span className="font-bold text-sm">{range}</span>
                                            {onboardingData.followers === range && <Check className="w-4 h-4 text-indigo-500" />}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 9: Engagement ===== */}
                    {currentStep === 9 && (
                        <CardWrapper stepKey="step9">
                            <div className="space-y-5">
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-gray-900">Average Engagement?</h2>
                                    <p className="text-sm text-gray-500 mt-1">Optional, but helps you stand out</p>
                                </div>

                                <div className="relative">
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">%</span>
                                    <input type="number" value={onboardingData.engagement}
                                        onChange={(e) => updateOnboarding("engagement", e.target.value)}
                                        placeholder="e.g. 4.5"
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-2xl text-center font-bold placeholder-gray-300 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-gray-800"
                                        autoFocus />
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <NextButton />
                                    <button onClick={goNext} className="text-sm text-gray-400 hover:text-gray-600 font-medium py-1.5 transition-colors">
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 10: Minimum Price ===== */}
                    {currentStep === 10 && (
                        <CardWrapper stepKey="step10">
                            <div className="space-y-5">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-xl rotate-3 shadow-md mb-3">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Your Minimum Price?</h2>
                                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                        Setting a competitive price boosts your visibility to brands
                                    </p>
                                </div>

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₹</span>
                                    <input type="number" value={onboardingData.minimumPrice}
                                        onChange={(e) => updateOnboarding("minimumPrice", e.target.value)}
                                        placeholder="e.g. 500"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-2xl font-bold placeholder-gray-300 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-gray-800"
                                        autoFocus />
                                </div>

                                <NextButton />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 11: Rates ===== */}
                    {currentStep === 11 && (
                        <CardWrapper stepKey="step11">
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 text-center">Starting Rates?</h2>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                    <input type="number" value={onboardingData.rates}
                                        onChange={(e) => updateOnboarding("rates", e.target.value)}
                                        placeholder="1000"
                                        className="w-full pl-14 pr-20 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-2xl font-bold placeholder-gray-300 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-gray-800"
                                        autoFocus />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">per post</span>
                                </div>

                                <NextButton
                                    label="Complete Setup"
                                    disabled={!onboardingData.rates || isSubmitting}
                                    loading={isSubmitting}
                                />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 12: Success ===== */}
                    {currentStep === 12 && (
                        <CardWrapper stepKey="step12">
                            <div className="flex flex-col items-center text-center space-y-6 py-8">
                                <div className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center relative shadow-lg shadow-green-500/30">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                                        <Check className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <motion.div
                                        className="absolute inset-0 border-4 border-green-300 rounded-full"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.3, opacity: 0 }}
                                        transition={{ delay: 0.4, duration: 1.5, repeat: Infinity }}
                                    />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Profile Setup Complete!</h1>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                        Your potential is limitless. Brands can now discover your unique talent.
                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={async () => {
                                        // Auto-login and go to dashboard
                                        const result = await signIn('credentials', {
                                            email: formData.email,
                                            password: formData.password,
                                            redirect: false,
                                        });
                                        if (result?.ok) {
                                            router.push('/creator/dashboard');
                                        } else {
                                            // Fallback: redirect to login
                                            router.push('/login');
                                        }
                                    }}
                                    className="px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center gap-2"
                                >
                                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </CardWrapper>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="fixed bottom-4 left-0 w-full text-center text-white/40 text-xs">
                Trusted by 10,000+ creators worldwide
            </div>
        </div>
    );
}
