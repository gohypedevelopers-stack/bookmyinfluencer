'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, User, Phone, Instagram, Youtube, Mail, Lock,
    CheckCircle, ArrowRight, Loader2, Chrome, Github, Sparkles,
    Check, ChevronLeft, Facebook, Twitter, Linkedin,
    Gamepad2, Dumbbell, Utensils, Laptop, Shirt, Smartphone,
    GraduationCap, Globe, Heart, IndianRupee, TrendingUp, Zap, Layers, Rocket
} from 'lucide-react';
import { completeGoogleCreatorOnboarding, registerUserAction } from './actions';
import { signIn, getProviders, getSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import {
    handleRedirectResult,
    signInWithGooglePopup,
    type FirebaseGoogleUser,
} from '@/lib/firebase-auth-client';
import { motion, AnimatePresence } from 'framer-motion';
import LivePhotoCapture from "@/components/kyc/LivePhotoCapture";
import {
    SHARED_CREATOR_FOLLOWER_RANGES,
    SHARED_PLATFORM_OPTIONS,
} from "@/lib/onboarding-taxonomy";

// Total steps
const TOTAL_STEPS = 11;

const GoogleIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const popularLocations = ["Pan India", "Maharashtra", "Delhi", "Karnataka", "Telangana", "Gujarat", "Tamil Nadu", "West Bengal"];
const indiaLocations = [
    // States
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
    // Major Cities
    "Mumbai", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Howrah", "Ranchi", "Gwalior", "Jabalpur", "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Mysore", "Tiruchirappalli", "Bareilly", "Aligarh", "Tiruppur", "Gurgaon", "Moradabad", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Mira-Bhayandar", "Jalgaon", "Guntur", "Thiruvananthapuram", "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur", "Maheshtala", "Davanagere", "Kozhikode", "Kurnool", "Rajpur Sonarpur", "Rajahmundry", "Bokaro", "South Dumdum", "Bellary", "Patiala", "Gopalpur", "Agartala", "Bhagalpur", "Muzaffarnagar", "Bhatpara", "Panihati", "Latur", "Dhule", "Tirupati", "Rohtak", "Korba", "Bhilwara", "Berhampur", "Muzaffarpur", "Ahmednagar", "Mathura", "Kollam", "Avadi", "Kadapa", "Kamarhati", "Sambalpur", "Bilaspur", "Shahjahanpur", "Satara", "Bijapur", "Rampur", "Shivamogga", "Chandrapur", "Junagadh", "Thrissur", "Alwar", "Bardhaman", "Kulti", "Kakinada", "Nizamabad", "Parbhani", "Tumkur", "Khammam", "Ozhukarai", "Bihar Sharif", "Panipat", "Darbhanga", "Bally", "Aizawl", "Dewas", "Ichalkaranji", "Karnal", "Bathinda", "Jalna", "Eluru", "Kirari Suleman Nagar", "Barasat", "Purnia", "Satna", "Mau", "Sonipat", "Farrukhabad", "Sagar", "Rourkela", "Durg", "Imphal", "Ratlam", "Hapur", "Arrah", "Karimnagar", "Anantapur", "Etawah", "Ambernath", "North Dumdum", "Bharatpur", "Begusarai", "New Delhi", "Gandhidham", "Baranagar", "Tiruvottiyur", "Puducherry", "Sikar", "Thoothukudi", "Rewa", "Mirzapur", "Raichur", "Pali", "Ramagundam", "Haridwar", "Vijayanagaram", "Katihar", "Nagercoil", "Sri Ganganagar", "Karawal Nagar"
];

// 1. slideVariants
const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 500 : -500, opacity: 0, scale: 0.95 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 500 : -500, opacity: 0, scale: 0.95 }),
};

// 1.1 platforms
const platforms = [
    { value: '', label: 'Select Platform' },
    ...SHARED_PLATFORM_OPTIONS.map((platform) => ({
        value: platform.id,
        label: platform.label,
    })),
];

const creatorPlatformCards = [
    { id: "Instagram", provider: "instagram", icon: Instagram, activeColor: "text-pink-500", inactiveColor: "text-pink-400", activeBg: "bg-pink-50", inactiveBg: "bg-pink-50/60" },
    { id: "YouTube", provider: "youtube", icon: Youtube, activeColor: "text-red-500", inactiveColor: "text-red-400", activeBg: "bg-red-50", inactiveBg: "bg-red-50/60" },
] as const;

const creatorNicheCards = [
    { name: "Tech & Gadgets", icon: Laptop },
    { name: "Fashion & Style", icon: Shirt },
    { name: "Beauty & Makeup", icon: Sparkles },
    { name: "Fitness & Health", icon: Dumbbell },
    { name: "Food & Culinary", icon: Utensils },
    { name: "Travel & Lifestyle", icon: Globe },
    { name: "Finance & Crypto", icon: TrendingUp },
    { name: "Education", icon: GraduationCap },
    { name: "Gaming", icon: Gamepad2 },
    { name: "Parenting", icon: Heart },
    { name: "Other", icon: Sparkles },
] as const;

const CardWrapper = ({ children, stepKey, direction, progressPercentage, currentStep, totalSteps }: { children: React.ReactNode; stepKey: string; direction: number; progressPercentage: number; currentStep?: number; totalSteps?: number }) => (
    <div className="relative z-10 flex h-full min-h-0 w-full flex-col text-slate-900">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-100">
            <motion.div
                className="h-full rounded-r-full" style={{ background: "linear-gradient(90deg, #10b981, #059669, #34d399)" }}
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
            className="flex flex-1 flex-col items-center justify-center w-full max-w-[400px] mx-auto px-5 pt-16 pb-8 md:px-8 md:py-8"
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
        className="w-full py-4 text-white rounded-2xl font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-5 shadow-lg shadow-emerald-200/60 hover:shadow-emerald-300/60 hover:scale-[1.01] active:scale-[0.99]" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
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
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-4 text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 mt-5 shadow-lg ${disabled ? "opacity-40 cursor-not-allowed shadow-none hover:shadow-none hover:scale-100 active:scale-100" : "shadow-emerald-200/60 hover:shadow-emerald-300/60 hover:scale-[1.01] active:scale-[0.99]"}`} style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
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

    const [onboardingData, setOnboardingData] = useState({
        platforms: [] as string[],
        niche: '',
        location: '',
        followers: '',
        engagement: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleAvailable, setGoogleAvailable] = useState(false);
    const [providersLoaded, setProvidersLoaded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [error, setError] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomNiche, setIsCustomNiche] = useState(false);
    const [kycCompleted, setKycCompleted] = useState(false);
    const [locationQuery, setLocationQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const redirectAfterLogin = useCallback((session: Session | null) => {
        if (session?.user?.role === 'ADMIN') router.push('/admin');
        else if (session?.user?.role === 'MANAGER') router.push('/manager');
        else if (session?.user?.role === 'BRAND') router.push('/brand/campaigns');
        else if (session?.user?.role === 'INFLUENCER') {
            const path = (session.user as any)?.onboardingComplete ? '/creator/dashboard' : '/creator/onboarding';
            router.push(path);
        } else {
            router.push('/');
        }
        router.refresh();
    }, [router]);

    const continueGoogleCreatorSignup = useCallback(async (firebaseUser: FirebaseGoogleUser) => {
        setGoogleLoading(true);
        setError('');

        const result = await signIn('credentials', {
            redirect: false,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Creator',
            image: firebaseUser.photoURL || null,
            isGoogleLogin: 'true',
            role: 'INFLUENCER',
            password: 'bypass',
        });

        if (result?.error) {
            setError(result.error || 'Google sign-up failed');
            setGoogleLoading(false);
            return;
        }

        const session = await getSession();
        if (session?.user?.role !== 'INFLUENCER') {
            setGoogleLoading(false);
            redirectAfterLogin(session);
            return;
        }

        setFormData(prev => ({
            ...prev,
            email: firebaseUser.email,
            fullName: prev.fullName || firebaseUser.displayName || 'Creator',
        }));
        setEmailVerified(true);
        setIsGoogleUser(true);
        setDirection(1);
        setCurrentStep(4);
        setGoogleLoading(false);
    }, [redirectAfterLogin]);

    useEffect(() => {
        let active = true;

        async function hydrateAuthState() {
            try {
                const firebaseUser = await handleRedirectResult();
                if (firebaseUser) {
                    if (!active) return;
                    setGoogleAvailable(true);
                    setProvidersLoaded(true);
                    setMounted(true);
                    await continueGoogleCreatorSignup(firebaseUser);
                    return;
                }
            } catch (err: any) {
                console.error("Redirect auth error:", err);
                setError(err.message || "Failed to complete Google authentication");
            }

            const [providers, session] = await Promise.all([
                getProviders(),
                getSession(),
            ]);

            if (!active) return;

            setGoogleAvailable(true);
            setProvidersLoaded(true);
            setMounted(true);

            if (session?.user) {
                redirectAfterLogin(session);
            }
        }

        hydrateAuthState().catch((error) => {
            console.error(error);
            if (!active) return;
            setGoogleAvailable(true);
            setProvidersLoaded(true);
            setMounted(true);
        });

        return () => {
            active = false;
        };
    }, [continueGoogleCreatorSignup, redirectAfterLogin]);

    const handleGoogleRegister = async () => {
        setGoogleLoading(true);
        setError('');

        try {
            const firebaseUser = await signInWithGooglePopup();
            await continueGoogleCreatorSignup(firebaseUser);
        } catch (error: any) {
            console.error(error);
            if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
                setError('');
            } else {
                setError(error.message || 'Unable to complete Google sign-up');
            }
            setGoogleLoading(false);
        }
    };

    const getDisplayStep = (step: number) => {
        return step;
    };
    const displayStep = getDisplayStep(currentStep);
    const progressPercentage = ((displayStep - 1) / TOTAL_STEPS) * 100;

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
            else if (data.devOtpAvailable) {
                setOtpSent(true);
                setError([data.message, data.infoMessage].filter(Boolean).join(" "));
            }
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
        fd.append('location', onboardingData.location);
        fd.append('followers', onboardingData.followers);
        fd.append('engagement', onboardingData.engagement);

        try {
            const res = isGoogleUser
                ? await completeGoogleCreatorOnboarding(fd)
                : await registerUserAction(fd);

            if (!res?.success) {
                setError(res?.error || 'Registration failed. Please try again.');
                setIsSubmitting(false);
                return;
            }

            if (isGoogleUser) {
                await signIn('credentials', {
                    redirect: false,
                    email: formData.email,
                    name: formData.fullName || 'Creator',
                    isGoogleLogin: 'true',
                    role: 'INFLUENCER',
                    password: 'bypass',
                });
            } else {
                // Log the user in silently to establish session for KYC upload API
                await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });
            }

            // Move to KYC step
            setDirection(1);
            setCurrentStep(10);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validation per step
    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return !!formData.fullName && !!formData.mobileNumber;
            case 2: return emailVerified;
            case 3: return !!formData.password && formData.password === formData.confirmPassword && formData.password.length >= 6 && formData.agreeToTerms;
            case 4: return true; // Welcome
            case 5: return onboardingData.platforms.length > 0;
            case 6: return !!onboardingData.niche;
            case 7: return !!onboardingData.location; // Location
            case 8: return !!onboardingData.followers; // Followers
            case 9: return true; // engagement optional
            default: return true;
        }
    };

    const goNext = async () => {
        setError('');
        if (currentStep === 9) {
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

    const sidebarContent = (): { icon: React.ReactNode; tag: string; title: string; desc: string } => {
        if (currentStep === 1) return { icon: <User className="w-8 h-8 text-white" />, tag: "Getting Started", title: "Start your creator profile", desc: "Set up the essentials so brands can understand who you are from the first screen." };
        if (currentStep === 2) return { icon: <Mail className="w-8 h-8 text-white" />, tag: "Account Security", title: "Verify your email", desc: "Secure your creator account and unlock the next onboarding steps with a verified email." };
        if (currentStep === 3) return { icon: <Lock className="w-8 h-8 text-white" />, tag: "Protection", title: "Keep it secure", desc: "A strong password protects your deals, profile data, and future earnings." };
        if (currentStep === 4) return { icon: <Rocket className="w-8 h-8 text-white" />, tag: "Onboarding", title: "You are in motion", desc: "Your basic account is ready. Now shape the profile details brands use to shortlist creators." };
        if (currentStep === 5) return { icon: <Layers className="w-8 h-8 text-white" />, tag: "Platforms", title: "Pick your platforms", desc: "Tell us where you create so matching works around your strongest content formats." };
        if (currentStep === 6) return { icon: <Sparkles className="w-8 h-8 text-white" />, tag: "Positioning", title: "Define your niche", desc: "Your niche helps brands instantly understand your style, category, and audience fit." };
        if (currentStep === 7) return { icon: <Globe className="w-8 h-8 text-white" />, tag: "Location", title: "Where are you based?", desc: "Brands look for creators in specific regions for localized campaigns." };
        if (currentStep === 8) return { icon: <Heart className="w-8 h-8 text-white" />, tag: "Audience", title: "Show your reach", desc: "Follower size gives brands a quick signal about campaign scale and creator tier." };
        if (currentStep === 9) return { icon: <TrendingUp className="w-8 h-8 text-white" />, tag: "Performance", title: "Highlight engagement", desc: "Engagement quality helps you stand out beyond raw follower numbers." };
        if (currentStep === 10) return { icon: <CheckCircle className="w-8 h-8 text-white" />, tag: "Verification", title: "Build trust faster", desc: "A quick selfie verification adds credibility and makes your profile more brand-ready." };
        return { icon: <Rocket className="w-8 h-8 text-white" />, tag: "Success", title: "Ready for discovery", desc: "Your creator profile is now ready to be seen by brands looking for the right voice and audience." };
    };

    const sidebar = sidebarContent();

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative font-sans text-slate-900" style={{ background: "radial-gradient(ellipse at 20% 50%, #e6f4ea 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #e0f2f1 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, #f1f8e9 0%, transparent 50%), #f8fafc" }}>

            {/* Decorative floating blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 left-[8%] w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />
                <motion.div animate={{ y: [0, 20, 0], x: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-10 right-[8%] w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl" />
                {/* Decorative dots grid */}
                <div className="absolute top-12 right-12 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)", backgroundSize: "24px 24px", width: "120px", height: "120px" }} />
                <div className="absolute bottom-12 left-12 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #059669 1px, transparent 1px)", backgroundSize: "24px 24px", width: "120px", height: "120px" }} />
            </div>

            {/* Slide Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-[28rem] md:max-w-[840px] min-h-[520px] overflow-hidden rounded-[2rem] border border-slate-200/60 ring-1 ring-white/60 shadow-[0_32px_80px_-16px_rgba(30,41,59,0.15)] flex"
            >
                <div className="hidden md:flex flex-col w-[34%] min-h-[520px] overflow-hidden relative"
                    style={{ background: "linear-gradient(165deg, #059669 0%, #047857 100%)" }}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-br from-emerald-400/30 to-transparent blur-3xl rotate-12" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[50%] bg-gradient-to-tl from-teal-400/30 to-transparent blur-3xl -rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full p-8 text-white">
                        <div className="mb-12 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                <User size={22} className="text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight">Bookmyinfluencer</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-bold uppercase tracking-wider text-white/80">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        {sidebar.tag}
                                    </div>

                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-black leading-tight tracking-tight">
                                            {sidebar.title}
                                        </h2>
                                        <p className="text-lg text-indigo-100 font-medium leading-relaxed max-w-sm">
                                            {sidebar.desc}
                                        </p>
                                    </div>

                                    <div className="pt-4 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                            {sidebar.icon}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-9 h-9 rounded-full border-2 border-emerald-600 bg-slate-200 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="creator" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-9 h-9 rounded-full border-2 border-emerald-600 bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">
                                    +10k
                                </div>
                            </div>
                            <p className="text-xs font-black text-white/50 uppercase tracking-[0.1em]">
                                Trusted by ambitious creators
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white/90 backdrop-blur-sm flex flex-col relative overflow-hidden min-h-[520px]">
                    {currentStep > 1 && !isSubmitting && currentStep < 10 && (
                        <button
                            onClick={goBack}
                            className="absolute top-5 left-5 z-20 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
                        >
                            <ChevronLeft size={22} />
                        </button>
                    )}

                    {/* Step Counter */}
                    {currentStep < 10 && (
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full z-20 uppercase tracking-widest shadow-sm">
                            Step {getDisplayStep(currentStep)} <span className="text-slate-200 mx-1">/</span> {TOTAL_STEPS}
                        </div>
                    )}

                    <AnimatePresence initial={false} custom={direction} mode="wait">

                    {/* ===== STEP 1: Enter your details ===== */}
                    {currentStep === 1 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step1" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-lg shadow-emerald-200/60" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg></div>
                                <h2 className="text-3xl font-extrabold text-center mb-1 tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Create your account</h2>
                                <p className="text-center text-slate-400 text-sm mb-3">Join thousands of creators earning with top brands.</p>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="button"
                                    onClick={handleGoogleRegister}
                                    disabled={!providersLoaded || googleLoading || loading}
                                    title={!googleAvailable ? (process.env.NODE_ENV === 'development' ? 'Google signup [Simulation Mode]' : 'Google signup needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET') : 'Continue with Google'}
                                    className="relative w-full overflow-hidden flex items-center justify-center gap-2 h-[52px] bg-white border border-slate-200/80 rounded-2xl text-slate-700 font-bold text-[15px] transition-all duration-400 hover:bg-slate-50 hover:border-slate-300 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 group"
                                >
                                    {/* Click Ripple / Hover Glow Effect */}
                                    <div className="absolute inset-0 bg-slate-100 opacity-0 group-active:opacity-100 transition-opacity duration-150" />
                                    
                                    <div className="relative z-10 flex items-center gap-2.5">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            {googleLoading ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                                                >
                                                    <GoogleIcon className="w-5 h-5 opacity-90 drop-shadow-sm" />
                                                </motion.div>
                                            ) : (
                                                <GoogleIcon className="w-5 h-5 group-hover:scale-110 group-hover:drop-shadow-md transition-all duration-300" />
                                            )}
                                        </div>
                                        <span className="group-hover:text-slate-900 transition-colors">
                                            {googleLoading ? "Connecting..." : "Google"}
                                        </span>
                                    </div>
                                    
                                    {/* Subtle interactive shine */}
                                    <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-[30deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
                                </button>

                                <div className="flex items-center my-0 before:flex-1 before:border-t before:border-slate-200 before:mr-4 after:flex-1 after:border-t after:border-slate-200 after:ml-4">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OR CONTINUE WITH</span>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-1.5 w-full text-left">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#059669] w-5 h-5 transition-colors" />
                                        <input
                                            name="fullName" type="text" value={formData.fullName} onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-2.5 bg-[#ecfdf5]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] focus:outline-none transition-all text-slate-900"
                                            placeholder="e.g. John Doe" required autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div className="space-y-1.5 w-full text-left">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#059669] w-5 h-5 transition-colors" />
                                        <input
                                            name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-2.5 bg-[#ecfdf5]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] focus:outline-none transition-all text-slate-900"
                                            placeholder="e.g. 9876543210" required
                                        />
                                    </div>
                                </div>
                                <NextButton onClick={goNext} disabled={!canProceed()} />

                                <p className="text-center text-sm text-slate-500 pt-1">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-[#059669] font-bold hover:underline">Sign in</Link>
                                </p>
                            </div>
                        </CardWrapper>
                    )}
                    {/* ===== STEP 2: Email Verification ===== */}
                    {currentStep === 2 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step2" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <h2 className="text-3xl font-extrabold text-center mb-1 tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Verify Email</h2>
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
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#059669] w-5 h-5 transition-colors" />
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                                            className={`w-full pl-11 pr-28 py-3.5 border rounded-2xl text-base placeholder-slate-400 transition-all ${emailVerified ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-[#ecfdf5]/50 border-[#e2e8f0] text-slate-900 focus:border-[#059669] focus:ring-1 focus:ring-[#059669] focus:bg-white focus:outline-none'}`}
                                            placeholder="hello@example.com" required disabled={emailVerified || otpSent} autoFocus />
                                        {emailVerified && (
                                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400" />
                                        )}
                                        {!emailVerified && formData.email && !otpSent && (
                                            <button type="button" onClick={requestOtp} disabled={otpLoading}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 font-bold text-[#059669] bg-[#ecfdf5] rounded-xl hover:bg-[#d1fae5] transition-all disabled:opacity-50 text-sm">
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
                                                    className="w-full aspect-square text-center text-2xl font-bold border border-[#e2e8f0] rounded-2xl focus:outline-none focus:border-[#059669] bg-[#ecfdf5]/50 text-slate-900 transition-all focus:bg-white"
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
                                                className="w-full py-4 text-slate-400 hover:text-emerald-600 font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                Skip Verification
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 3: Password ===== */}
                    {currentStep === 3 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step3" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <h2 className="text-3xl font-extrabold text-center mb-1 tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Secure Account</h2>
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
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#059669] w-5 h-5 transition-colors" />
                                        <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                                            className="w-full pl-11 pr-11 py-2.5 bg-[#ecfdf5]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] focus:outline-none transition-all text-slate-900"
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
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#059669] w-5 h-5 transition-colors" />
                                        <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange}
                                            className="w-full pl-11 pr-11 py-2.5 bg-[#ecfdf5]/50 border border-[#e2e8f0] rounded-2xl text-base placeholder-slate-400 focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] focus:outline-none transition-all text-slate-900"
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
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#059669] accent-[#059669] focus:ring-[#059669] cursor-pointer" />
                                    <label htmlFor="agreeToTerms" className="text-sm text-slate-500 leading-relaxed cursor-pointer">
                                        I agree to the <Link href="/terms" className="text-[#059669] font-semibold hover:underline">Terms</Link> and <Link href="/privacy" className="text-[#059669] font-semibold hover:underline">Privacy Policy</Link>.
                                    </label>
                                </div>

                                <NextButton onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 4: Welcome (Onboarding Start) ===== */}
                    {currentStep === 4 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step4" direction={direction} progressPercentage={progressPercentage}>
                            <div className="flex flex-col items-center text-center space-y-8">
                                <div className="w-20 h-20 rounded-2xl rotate-3 shadow-xl shadow-emerald-200/60 flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                                    <Sparkles className="w-12 h-12 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    Welcome Creator!
                                </h1>
                                <p className="text-lg md:text-xl text-slate-600 max-w-sm mx-auto leading-relaxed">
                                    Start earning by collaborating with top brands. It's time to monetize your passion.
                                </p>
                                <ProceedButton label="Let's Go" onClick={goNext} disabled={false} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 5: Platforms Selection ===== */}
                    {currentStep === 5 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step5" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-4">
                                <div className="text-center">
                                    <h2 className="text-2xl font-extrabold mb-1 tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Which platforms?</h2>
                                    <p className="text-slate-400 text-xs">Pick the ones you create on.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {creatorPlatformCards.map((p) => {
                                        const isActive = onboardingData.platforms.includes(p.id);
                                        return (
                                            <motion.button
                                                key={p.id}
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => togglePlatform(p.id)}
                                                className={`py-5 px-4 rounded-2xl border-2 flex flex-col items-center gap-2.5 transition-all cursor-pointer relative
                                    ${isActive
                                                        ? "bg-emerald-50 border-emerald-400 shadow-md shadow-emerald-100/60 ring-1 ring-emerald-200"
                                                        : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                                                    }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? p.activeBg : p.inactiveBg}`}>
                                                    <p.icon className={`w-6 h-6 ${isActive ? p.activeColor : p.inactiveColor}`} />
                                                </div>
                                                <span className={`font-semibold text-sm ${isActive ? 'text-emerald-700' : 'text-slate-600'}`}>{p.id}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <ProceedButton label="Next Step" onClick={goNext} disabled={!canProceed()} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 6: Niche ===== */}
                    {currentStep === 6 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step6" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full max-w-[520px] space-y-6 flex flex-col items-center">
                                <h2 className="text-3xl font-extrabold text-center mb-1 tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Primary Niche?</h2>
                                {!isCustomNiche ? (
                                    <div className="grid grid-cols-2 gap-2.5 w-full">
                                        {creatorNicheCards.map((item) => (
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
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-400 shadow-md shadow-emerald-100/60 ring-1 ring-emerald-200"
                                                        : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-700 transition-all"
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${onboardingData.niche === item.name ? "bg-[#059669]/10" : "bg-slate-100"}`}>
                                                    <item.icon size={20} />
                                                </div>
                                                <span className="font-semibold">{item.name}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 w-full pt-4">
                                        <div className="relative group">
                                            <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 w-6 h-6 transition-colors" />
                                            <input
                                                type="text"
                                                value={onboardingData.niche}
                                                onChange={(e) => updateOnboarding("niche", e.target.value)}
                                                className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-200 rounded-2xl text-xl text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                                                placeholder="e.g. Sustainable Fashion"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && onboardingData.niche) {
                                                        goNext();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <NextButton onClick={goNext} disabled={!onboardingData.niche} />
                                        <button onClick={() => setIsCustomNiche(false)} className="w-full text-center text-sm text-slate-500 hover:text-slate-800 uppercase font-bold tracking-widest py-2 transition-colors">
                                            ← Return to list
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 7: Location ===== */}
                    {currentStep === 7 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step7" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full max-w-[520px] space-y-6 flex flex-col items-center">
                                <h2 className="text-3xl font-extrabold text-center mb-1 tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Where are you based?</h2>
                                <div className="grid grid-cols-2 gap-2.5 w-full z-10 relative">
                                    {popularLocations.map((loc) => (
                                        <motion.button
                                            key={loc}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setLocationQuery("");
                                                updateOnboarding("location", loc);
                                                goNext();
                                            }}
                                            className={`p-3 rounded-xl border flex items-center justify-center gap-3 transition-all cursor-pointer
                                                ${onboardingData.location === loc
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-400 shadow-md shadow-emerald-100/60 ring-1 ring-emerald-200"
                                                    : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-700 transition-all"
                                                }`}
                                        >
                                            <span className="font-semibold">{loc}</span>
                                        </motion.button>
                                    ))}
                                </div>
                                <div className="w-full mt-2 relative border border-slate-200 rounded-xl bg-white shadow-sm overflow-visible z-20">
                                    <input
                                        type="text"
                                        value={
                                            popularLocations.includes(onboardingData.location) && locationQuery === ""
                                                ? "" : locationQuery || onboardingData.location
                                        }
                                        onChange={(e) => {
                                            setLocationQuery(e.target.value);
                                            updateOnboarding("location", e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        onKeyDown={(e) => { 
                                            if (e.key === 'Enter' && onboardingData.location) { 
                                                setShowSuggestions(false); 
                                                goNext(); 
                                            } 
                                        }}
                                        placeholder="Or enter a specific state/city..."
                                        className="w-full px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 font-semibold text-lg pb-[14px]"
                                    />
                                    
                                    {showSuggestions && locationQuery.length > 0 && (
                                        <div className="absolute top-[102%] left-0 z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 max-h-56 overflow-y-auto custom-scrollbar">
                                            {indiaLocations.filter(loc => loc.toLowerCase().includes(locationQuery.toLowerCase())).slice(0, 10).map((loc, idx) => (
                                                <button key={idx}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setLocationQuery("");
                                                        updateOnboarding("location", loc);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="w-full text-left px-5 py-3.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium border-b border-slate-100/50 last:border-0 transition-colors flex justify-between items-center"
                                                >
                                                    {loc}
                                                    {onboardingData.location === loc && <Check size={16} className="text-emerald-600" />}
                                                </button>
                                            ))}
                                            {indiaLocations.filter(loc => loc.toLowerCase().includes(locationQuery.toLowerCase())).length === 0 && (
                                                <div className="px-5 py-4 text-sm text-slate-500 text-center">
                                                    Press enter to use "{locationQuery}" as custom location.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <NextButton onClick={goNext} disabled={!onboardingData.location} />
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 8: Followers ===== */}
                    {currentStep === 8 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step8" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <h2 className="text-3xl font-extrabold text-center mb-1 tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>How many followers?</h2>
                                <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                                    {SHARED_CREATOR_FOLLOWER_RANGES.map((range) => (
                                        <motion.button
                                            key={range.label}
                                            whileHover={{ scale: 1.01, x: 5 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => {
                                                updateOnboarding("followers", range.label)
                                                goNext()
                                            }}
                                            className={`w-full py-4 px-4 rounded-2xl border-2 flex justify-between items-center transition-all cursor-pointer hover:translate-y-[-1px]
                                 ${onboardingData.followers === range.label
                                                     ? "bg-emerald-50 text-emerald-600 border-emerald-400 shadow-md shadow-emerald-100/60 ring-1 ring-emerald-200"
                                                     : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-700 transition-all"
                                                 }`}
                                        >
                                            <span className="font-bold text-base">{range.label}</span>
                                            {onboardingData.followers === range.label && <Check />}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 9: Engagement ===== */}
                    {currentStep === 9 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step9" direction={direction} progressPercentage={progressPercentage}>
                            <div className="w-full space-y-3">
                                <div className="text-center">
                                    <h2 className="text-2xl font-extrabold mb-1 tracking-tight" style={{ background: "linear-gradient(135deg, #1e293b 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Average Engagement?</h2>
                                    <p className="text-xs text-slate-400">Optional, but helps you stand out.</p>
                                </div>

                                <div className="max-w-[280px] mx-auto flex items-center bg-[#ecfdf5]/50 border border-[#e2e8f0] rounded-2xl shadow-sm focus-within:border-[#059669] focus-within:ring-1 focus-within:ring-[#059669] focus-within:bg-white transition-all overflow-hidden">
                                    <input type="number" value={onboardingData.engagement}
                                        onChange={(e) => updateOnboarding("engagement", e.target.value)}
                                        placeholder="e.g. 4.5"
                                        className="flex-1 px-5 py-3 text-2xl text-center font-black placeholder-slate-300 focus:outline-none bg-transparent text-slate-900 min-w-0"
                                        autoFocus />
                                    <span className="pr-4 text-slate-400 font-bold text-xl select-none">%</span>
                                </div>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex flex-col gap-2">
                                    <NextButton onClick={goNext} disabled={!canProceed() || isSubmitting} loading={isSubmitting} />
                                    <button onClick={goNext} disabled={isSubmitting} className="text-slate-400 hover:text-slate-600 font-medium py-2 transition-colors text-center w-full text-sm disabled:opacity-50">
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        </CardWrapper>
                    )}


                    {/* ===== STEP 10: Live Photo KYC ===== */}
                    {currentStep === 10 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step10" direction={direction} progressPercentage={90}>
                            <div className="w-full max-w-[520px] space-y-6 flex flex-col justify-center items-center relative z-10 text-white">
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
                                            setCurrentStep(11);
                                        }}
                                    />
                                </div>
                                <button onClick={() => {
                                    setDirection(1);
                                    setCurrentStep(11);
                                }} className="text-slate-400 hover:text-emerald-600 font-medium text-sm transition-colors text-center w-full mt-4 underline decoration-slate-200">
                                    Skip for now (Do this later from Dashboard)
                                </button>
                            </div>
                        </CardWrapper>
                    )}

                    {/* ===== STEP 11: Final Success ===== */}
                    {currentStep === 11 && (
                        <CardWrapper currentStep={currentStep} totalSteps={TOTAL_STEPS} stepKey="step11" direction={direction} progressPercentage={100}>
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
            </motion.div>

            {/* Footer */}
            <div className="fixed bottom-6 w-full text-center text-slate-400 text-xs pointer-events-none md:hidden">
                <p>Trusted by 10,000+ creators worldwide</p>
            </div>
        </div >
    );
}
