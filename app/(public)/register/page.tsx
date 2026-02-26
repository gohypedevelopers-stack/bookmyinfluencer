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
    "All done!"
];

const GlassIcon = ({ children, color = "pink", size = "large" }: { children: React.ReactNode, color?: string, size?: "small" | "large" }) => (
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

// 1. slideVariants
const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 400 : -400, opacity: 0, scale: 0.96 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 400 : -400, opacity: 0, scale: 0.96 }),
};

// 1.1 platforms
const platforms = [
    { value: '', label: 'Select Platform' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'facebook', label: 'Facebook' },
];

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
        <div className="w-full max-w-md mx-auto rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] overflow-hidden relative group p-[2px] bg-gradient-to-br from-white/80 via-white/40 to-white/80 border border-white/50">
            <div className="w-full h-full rounded-[2.4rem] overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(40px)',
                }}>
                {/* Card Header */}
                <div className="px-8 py-6 flex items-center gap-4 border-b border-slate-50/50"
                    style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/10">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-slate-900 font-black text-sm tracking-tighter uppercase block leading-tight">BookMyInfluencers</span>
                        <span className="text-[10px] text-pink-600 font-bold uppercase tracking-[0.2em]">Premium Platform</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[4px] bg-slate-50 relative">
                    <motion.div
                        className="h-full bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400"
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
        className="group relative w-full py-4.5 text-white font-black text-base rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_20px_40px_-12px_rgba(236,72,153,0.3)]"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 group-hover:scale-105 transition-transform duration-500" />

        {/* Shine Animation */}
        <motion.div
            className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-10"
            animate={{ left: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        />

        <div className="relative flex items-center justify-center gap-2 py-4 z-20">
            {btnLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
                <>{label} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
        </div>
    </motion.button>
);

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

    // 3D Background config per step group
    const getStepGroup = (step: number) => {
        if (step <= 4) return 'registration';
        if (step <= 8) return 'onboarding'; // Welcome(5), Platforms(6), Niche(7), Followers(8)
        if (step <= 10) return 'pricing';
        return 'completion';
    };

    const stepGroup = getStepGroup(currentStep);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans" style={{ perspective: '1200px' }}>
            {/* === PREMIUM MESH BACKGROUND === */}
            {/* Mesh Gradient Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-400/10 rounded-full blur-[120px] animate-blob" />
            <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-purple-400/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-10%] right-[20%] w-[55%] h-[55%] bg-cyan-400/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
            <div className="absolute bottom-[10%] left-[10%] w-[45%] h-[45%] bg-pink-500/5 rounded-full blur-[120px] animate-blob" />

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

            {/* Glassmorphic Gold Orb - Right */}
            <motion.div
                animate={{
                    y: [0, 25, 0],
                    x: [0, -8, 0],
                    scale: [1, 1.12, 1],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] right-[8%]"
            >
                <div className="w-24 h-24 rounded-full" style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(234,179,8,0.15))',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 32px rgba(245,158,11,0.25), inset 0 -4px 12px rgba(255,255,255,0.1), inset 0 4px 12px rgba(245,158,11,0.15)',
                }}>
                    <div className="absolute top-3 left-4 w-7 h-4 rounded-full bg-white/20 blur-sm" style={{ transform: 'rotate(-25deg)' }} />
                </div>
            </motion.div>

            {/* Money Bag - Center Left */}
            <motion.div
                animate={{
                    y: [0, -35, 0],
                    rotate: [-8, 8, -8],
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[45%] left-[4%]"
            >
                <div className="text-6xl" style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.5))' }}>
                    💰
                </div>
            </motion.div>

            {/* 3D Floating Chart - Bottom Right */}
            <motion.div
                animate={{
                    y: [0, -18, 0],
                    rotateX: [10, -5, 10],
                    rotateZ: [-3, 3, -3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[15%] right-[10%]"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div className="text-7xl" style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.4))' }}>
                    📈
                </div>
            </motion.div>

            {/* Floating gold particles */}
            {[
                { top: '30%', left: '22%', delay: 0, size: 10 },
                { top: '55%', right: '20%', delay: 1.2, size: 7 },
                { top: '72%', left: '18%', delay: 2.4, size: 8 },
                { top: '18%', right: '28%', delay: 0.6, size: 6 },
                { top: '65%', right: '6%', delay: 1.8, size: 9 },
            ].map((p, i) => (
                <motion.div
                    key={`price-p-${i}`}
                    animate={{
                        y: [0, -25, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.4, 1],
                    }}
                    transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
                    className="absolute rounded-full"
                    style={{
                        ...p,
                        width: p.size,
                        height: p.size,
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.7), rgba(234,179,8,0.4))',
                        boxShadow: `0 0 ${p.size * 2}px rgba(245,158,11,0.3)`,
                    }}
                />
            ))}

            {/* 3D Animated Objects Layer for Premium Influencer Theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={getStepGroup(currentStep)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="absolute inset-0"
                    >
                        {/* Top Left - Dynamic Influencer Object */}
                        <motion.div
                            animate={{
                                y: [0, -40, 0],
                                rotateY: [0, 15, -15, 0],
                                rotateX: [0, 10, -10, 0],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[12%] left-[8%] z-0"
                        >
                            <GlassIcon color="pink">
                                {currentStep <= 5 ? (
                                    <div className="text-7xl group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 10px 20px rgba(236,72,153,0.3))' }}>{"\uD83D\uDE80"}</div>
                                ) : (
                                    <div className="text-6xl group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 10px 20px rgba(236,72,153,0.3))' }}>{"\uD83D\uDCF8"}</div>
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
                                {currentStep <= 5 ? (
                                    <div className="text-5xl group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 10px 15px rgba(6,182,212,0.3))' }}>{"\uD83D\uDCCA"}</div>
                                ) : (
                                    <div className="text-6xl group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 10px 15px rgba(239,68,68,0.3))' }}>{"\uD83C\uDFAC"}</div>
                                )}
                            </GlassIcon>
                        </motion.div>

                        {/* Floating Hearts & Sparkles Particles */}
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
                                    <GlassIcon color="pink" size="small">
                                        <div className="text-xl">{"\u2764\uFE0F"}</div>
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

            {/* Back Button */}
            {
                currentStep > 1 && !isSubmitting && (
                    <button onClick={goBack}
                        className="fixed top-6 left-6 z-50 p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white transition-colors text-slate-500 hover:text-slate-900 shadow-sm">
                        <ChevronLeft size={24} />
                    </button>
                )
            }

            {/* Step Counter */}
            {
                currentStep < TOTAL_STEPS && (
                    <div className="fixed top-6 right-6 z-50 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 text-sm font-bold shadow-sm">
                        {currentStep} / {TOTAL_STEPS - 1}
                    </div>
                )
            }

            {/* Slide Content */}
            <div className="relative z-10 w-full max-w-lg">
                <AnimatePresence initial={false} custom={direction} mode="wait">

                    {/* ===== STEP 1: Enter your details ===== */}
                    {currentStep === 1 && (
                        <CardWrapper stepKey="step1" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Enter your details</h2>
                                    <p className="text-sm text-slate-500 mt-1">Let's start with the basics</p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            name="fullName" type="text" value={formData.fullName} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500/30 focus:bg-white transition-all placeholder-slate-400"
                                            placeholder="John Doe" required
                                        />
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500/30 focus:bg-white transition-all placeholder-slate-400"
                                            placeholder="+1 (555) 000-0000" required
                                        />
                                    </div>
                                </div>

                                {/* Primary Platform */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select your primary platform</label>
                                    <div className="relative">
                                        <select name="primaryPlatform" value={formData.primaryPlatform} onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500/30 focus:bg-white transition-all appearance-none cursor-pointer" required>
                                            {platforms.map(p => <option key={p.value} value={p.value} style={{ background: '#ffffff', color: p.value ? '#0f172a' : '#94a3b8' }}>{p.label}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />

                                {/* Social Login Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="px-3 text-slate-400 font-medium bg-white">Or continue with</span></div>
                                </div>

                                <div className="flex justify-center">
                                    <button type="button" onClick={() => signIn('google', { callbackUrl: '/' })}
                                        className="flex items-center justify-center gap-2 px-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-100 transition-all shadow-sm">
                                        <Chrome className="w-4 h-4" /> Google
                                    </button>
                                </div>

                                <p className="text-center text-sm text-slate-500">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-pink-600 font-bold hover:underline">Log in →</Link>
                                </p>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 2: Social Handles ===== */}
                    {currentStep === 2 && (
                        <CardWrapper stepKey="step2" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Add your social handles</h2>
                                    <p className="text-sm text-slate-500 mt-1">Help brands find you easily</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instagram URL</label>
                                    <div className="relative group">
                                        <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                                        <input name="instagramUrl" type="url" value={formData.instagramUrl} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 focus:bg-white transition-all placeholder-slate-400"
                                            placeholder="instagram.com/@handle" autoFocus />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">YouTube URL</label>
                                    <div className="relative group">
                                        <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                        <input name="youtubeUrl" type="url" value={formData.youtubeUrl} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/30 focus:bg-white transition-all placeholder-slate-400"
                                            placeholder="youtube.com/@channel" />
                                    </div>
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 3: Email Verification ===== */}
                    {currentStep === 3 && (
                        <CardWrapper stepKey="step3" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Verify your email</h2>
                                    <p className="text-sm text-slate-500 mt-1">We'll send a verification code</p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email input */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                                            className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${emailVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-cyan-500/10 focus:border-cyan-500/30 focus:bg-white placeholder-slate-400'}`}
                                            placeholder="gohypemedia1@gmail.com" required disabled={emailVerified || otpSent} autoFocus />
                                        {emailVerified && (
                                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                        )}
                                        {!emailVerified && formData.email && !otpSent && (
                                            <button type="button" onClick={requestOtp} disabled={otpLoading}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold text-cyan-400 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-all disabled:opacity-50">
                                                {otpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Send Code'}
                                            </button>
                                        )}
                                    </div>
                                    {/* Change Email button - visible when OTP was sent */}
                                    {otpSent && !emailVerified && (
                                        <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                                            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium mt-1 transition-colors">
                                            ← Change email address
                                        </button>
                                    )}
                                </div>

                                {/* OTP Entry */}
                                {otpSent && !emailVerified && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enter the verification code</label>
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
                                                    className="w-full aspect-square text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500/30 focus:ring-2 focus:ring-cyan-500/10 bg-slate-50 text-slate-900 transition-all"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <button type="button" onClick={requestOtp} disabled={otpLoading}
                                                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                                                Resend code in 49s
                                            </button>
                                        </div>
                                        <button type="button" onClick={verifyOtp} disabled={otpLoading || otp.length !== 6}
                                            className="w-full py-3 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>
                                            {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
                                        </button>
                                    </motion.div>
                                )}

                                {emailVerified && <NextButton onClick={goNext} disabled={!canProceed()} />}
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 4: Password ===== */}
                    {currentStep === 4 && (
                        <CardWrapper stepKey="step4" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Create a secure password</h2>
                                    <p className="text-sm text-slate-500 mt-1">Must be at least 6 characters</p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500/30 focus:bg-white transition-all placeholder-slate-400"
                                            placeholder="••••••••" required autoFocus />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange}
                                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500/30 focus:bg-white transition-all placeholder-slate-400"
                                            placeholder="••••••••" required />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Match Indicator */}
                                {formData.password && formData.confirmPassword && (
                                    <div className={`text-xs font-medium flex items-center gap-1.5 ${formData.password === formData.confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formData.password === formData.confirmPassword ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5">✕</span>}
                                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                    </div>
                                )}

                                {/* Password Requirements */}
                                {formData.password && formData.password.length < 6 && (
                                    <p className="text-xs text-amber-400/80">Password must be at least 6 characters</p>
                                )}

                                {/* Terms */}
                                <div className="flex items-start gap-3">
                                    <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                                    <label htmlFor="agreeToTerms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                                        I agree to the <Link href="/terms" className="text-pink-600 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-pink-600 font-bold hover:underline">Privacy Policy</Link>.
                                    </label>
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 5: Welcome (Onboarding Start) ===== */}
                    {currentStep === 5 && (
                        <CardWrapper stepKey="step5" direction={direction} progressPercentage={progressPercentage}>
                            <div className="flex flex-col items-center text-center space-y-6 py-6">
                                <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl rotate-3 shadow-lg flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Welcome Creator!</h1>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                                        Almost there! Let's set up your profile so brands can discover you.
                                    </p>
                                </div>
                                <NextButton label="Let's Go" onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 6: Platforms Selection ===== */}
                    {currentStep === 6 && (
                        <CardWrapper stepKey="step6" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-5">
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-slate-900">Which platforms?</h2>
                                    <p className="text-sm text-slate-500 mt-1">Pick the ones you create on</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: "Instagram", icon: Instagram, activeColor: "text-pink-500" },
                                        { id: "YouTube", icon: Youtube, activeColor: "text-red-500" },
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
                                                ? "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm shadow-cyan-500/5"
                                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                                }`}
                                        >
                                            {p.icon ? (
                                                <p.icon className={`w-5 h-5 ${onboardingData.platforms.includes(p.id) ? p.activeColor : "text-slate-400"}`} />
                                            ) : (
                                                <span className="w-5 h-5 flex items-center justify-center font-bold text-xs text-slate-400">Tk</span>
                                            )}
                                            <span className="font-semibold text-sm">{p.id}</span>
                                            {onboardingData.platforms.includes(p.id) && <Check className="w-4 h-4 ml-auto text-indigo-500" />}
                                        </motion.button>
                                    ))}
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 7: Niche ===== */}
                    {/* ===== STEP 7: Niche ===== */}
                    {currentStep === 7 && (
                        <CardWrapper stepKey="step7" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-slate-900 text-center">Your Primary Niche?</h2>
                                {!isCustomNiche ? (
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
                                                onClick={() => {
                                                    if (item.name === "Other") {
                                                        setIsCustomNiche(true);
                                                        updateOnboarding("niche", "");
                                                    } else {
                                                        updateOnboarding("niche", item.name);
                                                        goNext();
                                                    }
                                                }}
                                                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${onboardingData.niche === item.name
                                                    ? "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm shadow-cyan-500/5"
                                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${onboardingData.niche === item.name ? "bg-cyan-100" : "bg-slate-100"}`}>
                                                    <item.icon size={16} />
                                                </div>
                                                <span className="font-semibold text-sm">{item.name}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-cyan-500/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors z-10" />
                                            <input
                                                type="text"
                                                value={onboardingData.niche}
                                                onChange={(e) => updateOnboarding("niche", e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && onboardingData.niche) goNext(); }}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-base font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all backdrop-blur-md relative z-0"
                                                placeholder="Enter your niche"
                                                autoFocus
                                            />
                                        </div>
                                        <NextButton label="Continue" onClick={goNext} disabled={!onboardingData.niche} />
                                        <button
                                            onClick={() => {
                                                setIsCustomNiche(false);
                                                updateOnboarding("niche", "");
                                            }}
                                            className="w-full text-center text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors py-2"
                                        >
                                            ← Back to categories
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 8: Followers ===== */}
                    {currentStep === 8 && (
                        <CardWrapper stepKey="step8" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-slate-900 text-center">How many followers?</h2>
                                <div className="space-y-2.5">
                                    {["1K - 10K", "10K - 50K", "50K - 100K", "100K - 500K", "500K+"].map((range) => (
                                        <motion.button
                                            key={range}
                                            whileHover={{ scale: 1.01, x: 3 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => { updateOnboarding("followers", range); goNext(); }}
                                            className={`w-full p-3.5 rounded-xl border flex justify-between items-center transition-all ${onboardingData.followers === range
                                                ? "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm shadow-cyan-500/5"
                                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                                }`}
                                        >
                                            <span className="font-bold text-sm">{range}</span>
                                            {onboardingData.followers === range && <Check className="w-4 h-4 text-cyan-400" />}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 9: Engagement ===== */}
                    {currentStep === 9 && (
                        <CardWrapper stepKey="step9" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-5">
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-slate-900">Average Engagement?</h2>
                                    <p className="text-sm text-slate-500 mt-1">Optional, but helps you stand out</p>
                                </div>

                                <div className="relative">
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 font-extrabold text-2xl pointer-events-none z-10">%</span>
                                    <input type="number" value={onboardingData.engagement}
                                        onChange={(e) => updateOnboarding("engagement", e.target.value)}
                                        placeholder="e.g. 4.5"
                                        className="w-full px-4 pr-14 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-2xl text-center font-bold placeholder-slate-400 focus:bg-white focus:border-cyan-500/30 focus:outline-none transition-all text-slate-900"
                                        autoFocus />
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <NextButton onClick={goNext} disabled={!canProceed()} />
                                    <button onClick={goNext} className="text-sm text-slate-400 hover:text-slate-600 font-medium py-1.5 transition-colors">
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 10: Pricing (Merged) ===== */}
                    {currentStep === 10 && (
                        <CardWrapper stepKey="step10" direction={direction} progressPercentage={progressPercentage}>
                            <div className="space-y-5">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-xl rotate-3 shadow-md mb-3">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Your Minimum Price?</h2>
                                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                        Setting a competitive price boosts your visibility to brands
                                    </p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-4">
                                    {/* Per Story */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <div className="flex items-center justify-between mb-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within:text-emerald-500 transition-colors">Per Story Rate</label>
                                            <Smartphone className="w-3.5 h-3.5 text-slate-300 group-focus-within:text-emerald-400 transition-colors" />
                                        </div>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" />
                                            <input type="number" value={onboardingData.priceStory}
                                                onChange={(e) => updateOnboarding("priceStory", e.target.value)}
                                                placeholder="500"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-900"
                                                autoFocus />
                                        </div>
                                    </div>

                                    {/* Per Post */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-blue-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <div className="flex items-center justify-between mb-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within:text-blue-500 transition-colors">Per Post Rate</label>
                                            <Instagram className="w-3.5 h-3.5 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
                                            <input type="number" value={onboardingData.pricePost}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateOnboarding("pricePost", val);
                                                    updateOnboarding("rates", val); // Sync legacy fields
                                                    updateOnboarding("minimumPrice", val);
                                                }}
                                                placeholder="2000"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900" />
                                        </div>
                                    </div>

                                    {/* Per Collab */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-purple-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <div className="flex items-center justify-between mb-1.5 px-1">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within:text-purple-500 transition-colors">Per Collab Rate</label>
                                            <Zap className="w-3.5 h-3.5 text-slate-300 group-focus-within:text-purple-400 transition-colors" />
                                        </div>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors z-10" />
                                            <input type="number" value={onboardingData.priceCollab}
                                                onChange={(e) => updateOnboarding("priceCollab", e.target.value)}
                                                placeholder="5000"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-slate-900" />
                                        </div>
                                    </div>
                                </div>

                                <NextButton
                                    label="Complete Setup"
                                    onClick={handleFinalSubmit}
                                    disabled={!onboardingData.rates || isSubmitting}
                                    loading={isSubmitting}
                                />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 11: Success ===== */}
                    {currentStep === 11 && (
                        <CardWrapper stepKey="step11" direction={direction} progressPercentage={progressPercentage}>
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
                                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Profile Setup Complete!</h1>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">
                                        Your potential is limitless. Brands can now discover your unique talent.
                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={async () => {
                                        const result = await signIn('credentials', {
                                            email: formData.email,
                                            password: formData.password,
                                            redirect: false,
                                        });
                                        if (result?.ok) {
                                            router.push('/creator/dashboard');
                                        } else {
                                            router.push('/login');
                                        }
                                    }}
                                    className="px-10 py-4 text-white text-base font-black rounded-2xl shadow-lg transition-all flex items-center gap-2 uppercase tracking-widest"
                                    style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #c026d3)', boxShadow: '0 8px 25px rgba(139,92,246,0.3)' }}
                                >
                                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </CardWrapper>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="fixed bottom-4 left-0 w-full text-center text-slate-400 text-xs">
                Trusted by 10,000+ creators worldwide
            </div>
        </div >
    );
}
