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
import {
    SHARED_FOLLOWER_TIERS as followerTiers,
    SHARED_MICRO_FOLLOWER_RANGES as microFollowerRanges,
    SHARED_NICHE_LABELS,
} from '@/lib/onboarding-taxonomy';

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
        className="flex flex-col w-full max-w-[380px] mx-auto"
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
        className="w-full py-4 text-white font-black rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6 shadow-[0_12px_24px_-6px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_35px_-8px_rgba(79,70,229,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] relative overflow-hidden group"
        style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1, #4338ca)" }}
    >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {btnLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
            <>{label} {(label === "Continue" || label === "Next" || label === "Start Onboarding") ? <ArrowRight size={20} /> : null}</>
        )}
    </button>
);

const TOTAL_STEPS = 13;

type PriceTier = { label: string; badge: string; min: number; max: number };

// Per-collaboration pricing aligned to selected target creator size
const perCollabPriceTiersByFollowerTier: Record<string, PriceTier[]> = {
    Micro: [
        { label: 'â‚¹5,000 â€“ â‚¹25,000', badge: 'Micro Starter', min: 5000, max: 25000 },
        { label: 'â‚¹25,000 â€“ â‚¹75,000', badge: 'Growth', min: 25000, max: 75000 },
        { label: 'â‚¹75,000 â€“ â‚¹1,50,000', badge: 'High Impact', min: 75000, max: 150000 },
        { label: 'â‚¹1,50,000+', badge: 'Premium', min: 150000, max: 10000000 },
    ],
    Macro: [
        { label: 'â‚¹50,000 â€“ â‚¹2,00,000', badge: 'Macro Starter', min: 50000, max: 200000 },
        { label: 'â‚¹2,00,000 â€“ â‚¹5,00,000', badge: 'Performance', min: 200000, max: 500000 },
        { label: 'â‚¹5,00,000 â€“ â‚¹10,00,000', badge: 'Scaled Reach', min: 500000, max: 1000000 },
        { label: 'â‚¹10,00,000+', badge: 'Premium', min: 1000000, max: 10000000 },
    ],
};

const allPerCollabPriceTiers: PriceTier[] = Object.values(perCollabPriceTiersByFollowerTier).flat();

const popularLocations = ["Pan India", "Maharashtra", "Delhi", "Karnataka", "Telangana", "Gujarat", "Tamil Nadu", "West Bengal"];
const indiaLocations = [
    // States
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
    // Major Cities
    "Mumbai", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Howrah", "Ranchi", "Gwalior", "Jabalpur", "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Mysore", "Tiruchirappalli", "Bareilly", "Aligarh", "Tiruppur", "Gurgaon", "Moradabad", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Mira-Bhayandar", "Jalgaon", "Guntur", "Thiruvananthapuram", "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur", "Maheshtala", "Davanagere", "Kozhikode", "Kurnool", "Rajpur Sonarpur", "Rajahmundry", "Bokaro", "South Dumdum", "Bellary", "Patiala", "Gopalpur", "Agartala", "Bhagalpur", "Muzaffarnagar", "Bhatpara", "Panihati", "Latur", "Dhule", "Tirupati", "Rohtak", "Korba", "Bhilwara", "Berhampur", "Muzaffarpur", "Ahmednagar", "Mathura", "Kollam", "Avadi", "Kadapa", "Kamarhati", "Sambalpur", "Bilaspur", "Shahjahanpur", "Satara", "Bijapur", "Rampur", "Shivamogga", "Chandrapur", "Junagadh", "Thrissur", "Alwar", "Bardhaman", "Kulti", "Kakinada", "Nizamabad", "Parbhani", "Tumkur", "Khammam", "Ozhukarai", "Bihar Sharif", "Panipat", "Darbhanga", "Bally", "Aizawl", "Dewas", "Ichalkaranji", "Karnal", "Bathinda", "Jalna", "Eluru", "Kirari Suleman Nagar", "Barasat", "Purnia", "Satna", "Mau", "Sonipat", "Farrukhabad", "Sagar", "Rourkela", "Durg", "Imphal", "Ratlam", "Hapur", "Arrah", "Karimnagar", "Anantapur", "Etawah", "Ambernath", "North Dumdum", "Bharatpur", "Begusarai", "New Delhi", "Gandhidham", "Baranagar", "Tiruvottiyur", "Puducherry", "Sikar", "Thoothukudi", "Rewa", "Mirzapur", "Raichur", "Pali", "Ramagundam", "Haridwar", "Vijayanagaram", "Katihar", "Nagercoil", "Sri Ganganagar", "Karawal Nagar"
];

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
        location: '',
        niche: '',
        minFollowers: microFollowerRanges[0].min,
        maxFollowers: microFollowerRanges[0].max,
        minPricePerPost: 5000,
        maxPricePerPost: 25000,
        platforms: [] as string[],
        creatorType: '',
        campaignGoals: '',
        priceType: 'Per Collab',
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
    const [campaignWorkflow, setCampaignWorkflow] = useState<any>(null);
    const [autoCampaignId, setAutoCampaignId] = useState<string | null>(null);
    const [workflowWarning, setWorkflowWarning] = useState('');
    const [timer, setTimer] = useState(0);

    const [locationQuery, setLocationQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const progressPercentage = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    const selectedFollowerTier =
        followerTiers.find((tier) => onboardingData.minFollowers >= tier.min && onboardingData.maxFollowers <= tier.max)
        ?? followerTiers[0];
    const selectedFollowerRange =
        selectedFollowerTier.rangeOptions.find((range) => onboardingData.minFollowers === range.min && onboardingData.maxFollowers === range.max);
    const activePerCollabPriceTiers =
        perCollabPriceTiersByFollowerTier[selectedFollowerTier.label]
        ?? perCollabPriceTiersByFollowerTier.Micro;
    const selectedPerCollabPriceTier =
        activePerCollabPriceTiers.find((tier) => onboardingData.minPricePerPost === tier.min && onboardingData.maxPricePerPost === tier.max)
        ?? allPerCollabPriceTiers.find((tier) => onboardingData.minPricePerPost === tier.min && onboardingData.maxPricePerPost === tier.max);

    const formatSummaryDate = (value?: string | null) => {
        if (!value) return 'Not available yet';
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(value));
    };

    const getStatusClasses = (status: string) => {
        switch (String(status || '').toLowerCase()) {
            case 'accepted':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'expired':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'rejected':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

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
        else if (res.devOtpAvailable) {
            setOtpSent(true);
            setTimer(60);
            setError(`${res.error || "Email was not sent."} Use the OTP printed in the server console for local testing.`);
        }
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
        setIsSubmitting(true); setError(''); setWorkflowWarning('');

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
        fd.append('location', onboardingData.location);
        fd.append('niche', onboardingData.niche);
        fd.append('minFollowers', String(onboardingData.minFollowers));
        fd.append('maxFollowers', String(onboardingData.maxFollowers));
        fd.append('minPricePerPost', String(onboardingData.minPricePerPost));
        fd.append('maxPricePerPost', String(onboardingData.maxPricePerPost));
        fd.append('priceType', onboardingData.priceType);

        const res = await registerBrand(fd);
        if (res.success) {
            setCampaignWorkflow(res.workflowSummary ?? null);
            setAutoCampaignId(res.campaignId ?? null);
            setWorkflowWarning(res.workflowError || '');

            await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            setDirection(1);
            setCurrentStep(13);
        } else {
            setCampaignWorkflow(null);
            setAutoCampaignId(null);
            setWorkflowWarning('');
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
            case 7: return Number(onboardingData.budget) > 0;
            case 8: return !!onboardingData.location;
            case 9: return !!onboardingData.niche;
            case 10: return !!selectedFollowerRange;
            case 11: return onboardingData.platforms.length > 0;
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

    const ErrorDisplay = () => error ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-3 mb-6 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
            {error}
        </motion.div>
    ) : null;

    // Step-specific sidebar content
    const sidebarContent = (): { icon: React.ReactNode; tag: string; title: string; desc: string } => {
        if (currentStep === 1) return { icon: <Building2 className="w-8 h-8 text-white" />, tag: "Getting Started", title: "Scale your Impact", desc: "Start by introducing your brand. Our internal project managers handle the entire execution, from matching to delivery." };
        if (currentStep === 2) return { icon: <ArrowRight className="w-8 h-8 text-white" />, tag: "Account Security", title: "Join the Club", desc: "Enter your work email so we can verify you and grant access to our elite creator network." };
        if (currentStep === 3) return { icon: <Lock className="w-8 h-8 text-white" />, tag: "Account Setup", title: "Protect your Account", desc: "Create a secure password to keep your campaigns and data safe." };
        if (currentStep === 4) return { icon: <Sparkles className="w-8 h-8 text-white" />, tag: "Onboarding", title: "Perfect Start", desc: "Your basic account is ready. Let's fine-tune your platform to match your specific needs." };
        if (currentStep === 5) return { icon: <Building2 className="w-8 h-8 text-white" />, tag: "Profile", title: "Personal Branding", desc: "How should creators see you? Your public name is the first thing they'll notice." };
        if (currentStep === 6) return { icon: <Target className="w-8 h-8 text-white" />, tag: "Campaigns", title: "Strategy First", desc: "Different goals require different creators. Let's define what success looks like for you." };
        if (currentStep === 7) return { icon: <DollarSign className="w-8 h-8 text-white" />, tag: "Planning", title: "Smart Budgeting", desc: "We match you with creators who provide the best ROI within your target range." };
        if (currentStep === 8) return { icon: <Globe className="w-8 h-8 text-white" />, tag: "Location", title: "Target Market", desc: "Where should your creators be located?" };
        if (currentStep === 9) return { icon: <Target className="w-8 h-8 text-white" />, tag: "Niche", title: "Industry Focus", desc: "Help us understand your specific niche to match you perfectly." };
        if (currentStep === 10) return { icon: <Users className="w-8 h-8 text-white" />, tag: "Matchmaking", title: "Smart Reach", desc: "From high-engagement Micro creators to broad-reach Macro influencers, our team finds the right voice for you." };
        if (currentStep === 11) return { icon: <Instagram className="w-8 h-8 text-white" />, tag: "Reach", title: "Targeted Platforms", desc: "Reach your audience where they spend most of their time." };
        if (currentStep === 12) return { icon: <Zap className="w-8 h-8 text-white" />, tag: "Finalizing", title: "Mission Control", desc: "Any specific objectives in mind? These details help creators understand your vision better." };
        return { icon: <Rocket className="w-8 h-8 text-white" />, tag: "Success", title: "Blast Off!", desc: "Your brand is now part of the ecosystem. Get ready for explosive growth." };
    };
    const sidebar = sidebarContent();

    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden relative font-sans p-3 md:p-5"
            style={{ background: "radial-gradient(circle at top right, #f8fafc 0%, #f1f5f9 100%)" }}>

            {/* Animated background orbs - adjusted for premium light theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15],
                        x: [0, 50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-40 -left-20 w-[800px] h-[800px] rounded-full blur-[140px]"
                    style={{ background: "radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)" }} />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [0, -40, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-60 -right-20 w-[900px] h-[900px] rounded-full blur-[140px]"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.1, 0.05],
                        rotate: [0, 360]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[140px]"
                    style={{ background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)" }} />
            </div>
            {/* Split-panel card */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-xl md:max-w-[840px] relative z-10 rounded-[2rem] overflow-hidden flex shadow-[0_32px_80px_-16px_rgba(30,41,59,0.15)] border border-slate-200/60 ring-1 ring-slate-200/50 min-h-[520px]">

                {/* LEFT: Premium Sidebar (Visible on Desktop) */}
                <div className="hidden md:flex flex-col w-[35%] relative overflow-hidden overflow-y-auto"
                    style={{ background: "linear-gradient(165deg, #4f46e5 0%, #7c3aed 100%)" }}>

                    {/* Sidebar Background Accents */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-br from-indigo-400/30 to-transparent blur-3xl rotate-12" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[50%] bg-gradient-to-tl from-violet-400/30 to-transparent blur-3xl -rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full p-8 text-white">
                        {/* Logo/Brand Mark Area */}
                        <div className="mb-12 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                <Building2 size={22} className="text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight">Bookmyinfluencer</span>
                        </div>

                        {/* Dynamic Step Content */}
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

                        {/* Integration/Trust Footer */}
                        <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-9 h-9 rounded-full border-2 border-indigo-600 bg-slate-200 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-9 h-9 rounded-full border-2 border-indigo-600 bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">
                                    +10k
                                </div>
                            </div>
                            <p className="text-xs font-black text-white/50 uppercase tracking-[0.1em]">
                                Trusted by high-growth brands
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: White form panel */}
                <div className="flex-1 bg-white flex flex-col relative overflow-hidden min-h-0">
                    {/* In-panel progress bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 z-20">
                        <motion.div className="h-full relative" style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed, #db2777)" }}
                            initial={{ width: "0%" }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-sm" />
                        </motion.div>
                    </div>

                    {/* Back Button */}
                    {currentStep > 1 && currentStep < 11 && (
                        <button onClick={goBack} className="absolute top-5 left-5 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 z-20">
                            <ChevronLeft size={20} />
                        </button>
                    )}

                    {/* Step Counter */}
                    {currentStep < 11 && (
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full z-20 uppercase tracking-widest shadow-sm">
                            Step {currentStep} <span className="text-slate-200 mx-1">/</span> {TOTAL_STEPS - 1}
                        </div>
                    )}

                    {/* Scrollable form area */}
                    <div className="flex-1 flex flex-col justify-center px-5 pt-16 pb-8 md:px-8 md:py-8 overflow-y-auto">
                        <ErrorDisplay />
                        <AnimatePresence initial={false} custom={direction} mode="wait">

                            {/* ===== STEP 1: Brand Details ===== */}
                            {currentStep === 1 && (
                                <CardWrapper stepKey="step1" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center mb-2">
                                            <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">Enter Brand Details</h2>
                                            <p className="text-sm text-slate-400 mt-1">Tell us about your company to get started.</p>
                                        </div>

                                        {/* Company Name */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Company Name</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                                                <input name="companyName" type="text" value={formData.companyName} onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 py-3.5 text-sm border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-[6px] focus:ring-indigo-500/5 focus:outline-none transition-all bg-slate-50/30 focus:bg-white text-slate-800 placeholder-slate-300 font-medium"
                                                    placeholder="e.g. Acme Global" required />
                                            </div>
                                        </div>

                                        {/* Industry */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Industry Type</label>
                                            <div className="space-y-4">
                                                <div className="relative group">
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
                                                        className="w-full px-4 py-3.5 bg-slate-50/30 border border-slate-200 rounded-2xl text-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:ring-[6px] focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer font-medium"
                                                    >
                                                        <option value="" disabled>Select industry</option>
                                                        {['Technology', 'Fashion & Apparel', 'Beauty & Cosmetics', 'Health & Wellness', 'Food & Beverage', 'Finance', 'Education', 'Entertainment', 'Travel', 'Others'].map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
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
                                                                    className="flex-1 px-4 py-3 bg-slate-50/30 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-violet-500 focus:ring-[6px] focus:ring-violet-500/5 transition-all font-medium"
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
                                                                    className="px-6 py-3 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-violet-200" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
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
                                                                    className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-bold shadow-sm"
                                                                >
                                                                    <span>{ind}</span>
                                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, industries: prev.industries.filter(i => i !== ind) }))} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                                                                        <X size={14} strokeWidth={3} />
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
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Website URL</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                                                <input name="website" type="url" value={formData.website} onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 py-3.5 text-sm border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-[6px] focus:ring-indigo-500/5 focus:outline-none transition-all bg-slate-50/30 focus:bg-white text-slate-800 placeholder-slate-300 font-medium"
                                                    placeholder="https://www.yourbrand.com" />
                                            </div>
                                        </div>

                                        <NextButton label="Next" onClick={goNext} disabled={!canProceed()} />

                                        <p className="text-center text-sm text-slate-400 mt-4 font-medium">
                                            Member already?{' '}
                                            <Link href="/brand/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
                                        </p>
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 2: Email Verification  ===== */}
                            {currentStep === 2 && (
                                <CardWrapper stepKey="step2" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center mb-4">
                                            <h2 className="text-3xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">Verify company email</h2>
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
                                        <div className="text-center mb-4">
                                            <h2 className="text-3xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">Create secure password</h2>
                                            <p className="text-sm text-slate-400 mt-1">Finalize Account</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                                                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                                                    className="w-full pl-11 pr-11 py-3 text-base border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-[6px] focus:ring-indigo-500/5 focus:outline-none transition-all bg-[#f0f4ff]/50 focus:bg-white text-slate-800 placeholder-slate-400"
                                                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required />
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
                                                    className="w-full pl-11 pr-11 py-3 text-base border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-[6px] focus:ring-indigo-500/5 focus:outline-none transition-all bg-[#f0f4ff]/50 focus:bg-white text-slate-800 placeholder-slate-400"
                                                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {formData.password && formData.confirmPassword && (
                                            <div className={`text-sm font-medium flex items-center justify-center gap-1.5 px-1 text-center ${formData.password === formData.confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
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
                                        <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">Registration complete!</h1>
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
                                        <div className="text-center mb-4">
                                            <h2 className="text-3xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">What is your Brand Name?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Defining Identity</p>
                                        </div>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                                            <input type="text" value={onboardingData.brandName}
                                                onChange={(e) => updateOnboarding('brandName', e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && onboardingData.brandName) goNext(); }}
                                                className="w-full pl-11 pr-4 py-3 text-base border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-[6px] focus:ring-indigo-500/5 focus:outline-none transition-all bg-[#f0f4ff]/50 focus:bg-white text-slate-800 placeholder-slate-400"
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
                                        <div className="text-center mb-4">
                                            <h2 className="text-3xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">What type of campaign?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Campaign Strategy</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 pb-2">
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
                                        <div className="text-center mb-4">
                                            <h2 className="text-3xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">Total campaign budget?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Budget Planning</p>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-slate-600">Enter pricing budget</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">â‚¹</span>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    step={1000}
                                                    inputMode="numeric"
                                                    value={onboardingData.budget}
                                                    onChange={(e) => updateOnboarding('budget', e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' && Number(onboardingData.budget) > 0) goNext(); }}
                                                    placeholder="e.g. 50000"
                                                    className="w-full pl-9 pr-4 py-4 text-lg font-semibold border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white text-slate-800 placeholder:text-slate-400"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400">Add your total campaign budget manually.</p>
                                        </div>
                                        <NextButton label="Continue" onClick={goNext} disabled={!canProceed()} />
                                        <div className="flex justify-center pt-2">
                                            <button onClick={goNext} className="text-violet-500 font-semibold hover:underline text-sm">Skip this step</button>
                                        </div>
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 8: Location ===== */}
                            {currentStep === 8 && (
                                <CardWrapper stepKey="step8" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center mb-4">
                                            <h2 className="text-3xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">Where are creators based?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Select the target location.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pb-2 z-10 relative">
                                            {popularLocations.map((loc) => (
                                                <button key={loc}
                                                    onClick={() => { updateOnboarding('location', loc); setLocationQuery(""); goNext(); }}
                                                    className={`p-4 border-2 rounded-2xl flex items-center justify-between text-left transition-all group
                                        ${onboardingData.location === loc
                                                            ? 'border-violet-500 bg-violet-50'
                                                            : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/20'
                                                        }`}
                                                >
                                                    <span className={`font-semibold ${onboardingData.location === loc ? 'text-violet-700' : 'text-slate-700'}`}>{loc}</span>
                                                    {onboardingData.location === loc && <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 relative z-20">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 block ml-1">Or enter a specific state/city</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Globe className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={
                                                        popularLocations.includes(onboardingData.location) && locationQuery === ""
                                                            ? "" : locationQuery || onboardingData.location
                                                    }
                                                    onChange={(e) => {
                                                        setLocationQuery(e.target.value);
                                                        updateOnboarding('location', e.target.value);
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
                                                    className="w-full pl-11 pr-4 py-4 text-base font-medium border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 bg-white placeholder:text-slate-400 text-slate-800 transition-all"
                                                    placeholder="e.g. Haryana, Mumbai"
                                                />
                                            </div>
                                            {/* Dropdown UI */}
                                            {showSuggestions && locationQuery.length > 0 && (
                                                <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 max-h-56 overflow-y-auto custom-scrollbar">
                                                    {indiaLocations.filter(loc => loc.toLowerCase().includes(locationQuery.toLowerCase())).slice(0, 10).map((loc, idx) => (
                                                        <button key={idx}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                setLocationQuery("");
                                                                updateOnboarding('location', loc);
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="w-full text-left px-5 py-3.5 hover:bg-violet-50 text-slate-700 hover:text-violet-700 font-medium border-b border-slate-100/50 last:border-0 transition-colors flex justify-between items-center"
                                                        >
                                                            {loc}
                                                            {onboardingData.location === loc && <Check size={16} className="text-violet-600" />}
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
                                        <NextButton label="Continue" onClick={goNext} disabled={!onboardingData.location} />
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 9: Niche ===== */}
                            {currentStep === 9 && (
                                <CardWrapper stepKey="step9" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center mb-4">
                                            <h2 className="text-3xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">What is the campaign niche?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Select the main category for this campaign.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pb-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {SHARED_NICHE_LABELS.map((cat) => (
                                                <button key={cat}
                                                    onClick={() => { updateOnboarding('niche', cat); goNext(); }}
                                                    className={`p-3 border-2 rounded-xl flex items-center justify-between text-left transition-all group
                                        ${onboardingData.niche === cat
                                                            ? 'border-violet-500 bg-violet-50'
                                                            : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/20'
                                                        }`}
                                                >
                                                    <span className={`font-semibold text-sm ${onboardingData.niche === cat ? 'text-violet-700' : 'text-slate-700'}`}>{cat}</span>
                                                    {onboardingData.niche === cat && <div className="w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="pt-2 border-t border-slate-100">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 block ml-1">Or enter a custom niche</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Target className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={
                                                        SHARED_NICHE_LABELS.some((label) => label === onboardingData.niche)
                                                            ? "" : onboardingData.niche
                                                    }
                                                    onChange={(e) => updateOnboarding('niche', e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' && onboardingData.niche) goNext(); }}
                                                    className="w-full pl-11 pr-4 py-4 text-base font-medium border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 bg-white placeholder:text-slate-400 text-slate-800 transition-all"
                                                    placeholder="e.g. Sustainable Fashion"
                                                />
                                            </div>
                                        </div>
                                        <NextButton label="Continue" onClick={goNext} disabled={!onboardingData.niche} />
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 10: Target Followers ===== */}
                            {currentStep === 10 && (
                                <CardWrapper stepKey="step10" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center mb-4">
                                            <h2 className="text-3xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">Target creator size?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Pick a creator tier, then choose the exact follower slab.</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {followerTiers.map((tier) => {
                                                const isSelected = selectedFollowerTier.label === tier.label;
                                                return (
                                                    <button key={tier.label}
                                                        onClick={() => {
                                                            const defaultRange = tier.rangeOptions[0];
                                                            updateOnboarding('minFollowers', defaultRange.min);
                                                            updateOnboarding('maxFollowers', defaultRange.max);
                                                            updateOnboarding('priceType', 'Per Collab');

                                                            const defaultPriceTier = perCollabPriceTiersByFollowerTier[tier.label]?.[0];
                                                            if (defaultPriceTier) {
                                                                updateOnboarding('minPricePerPost', defaultPriceTier.min);
                                                                updateOnboarding('maxPricePerPost', defaultPriceTier.max);
                                                            }
                                                        }}
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
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    {selectedFollowerTier.label} ranges
                                                </p>
                                                {selectedFollowerRange ? (
                                                    <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-violet-100 text-violet-700 border border-violet-200">
                                                        Selected: {selectedFollowerRange.label}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {selectedFollowerTier.rangeOptions.map((range) => {
                                                    const isActive = selectedFollowerRange?.min === range.min && selectedFollowerRange?.max === range.max;
                                                    return (
                                                        <button
                                                            key={`${selectedFollowerTier.label}-${range.label}`}
                                                            onClick={() => {
                                                                updateOnboarding('minFollowers', range.min);
                                                                updateOnboarding('maxFollowers', range.max);
                                                            }}
                                                            className={`px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${isActive
                                                                ? 'border-violet-500 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:text-violet-700 hover:shadow-sm'
                                                                }`}
                                                        >
                                                            {range.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <NextButton label="Continue" onClick={goNext} disabled={!canProceed()} />
                                    </div>
                                </CardWrapper>
                            )}


                            {/* ===== STEP 11: Platforms ===== */}
                            {currentStep === 11 && (
                                <CardWrapper stepKey="step11" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Target Platforms?</h2>
                                            <p className="text-sm text-slate-400 mt-1">Select all that apply</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pb-2 max-w-[360px] mx-auto">
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

                            {/* ===== STEP 12: Campaign Goals ===== */}
                            {currentStep === 12 && (
                                <CardWrapper stepKey="step12" direction={direction}>
                                    <div className="space-y-6">
                                        <div className="text-center mb-4">
                                            <h2 className="text-2xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Campaign Goals</h2>
                                            <p className="text-sm text-slate-400 mt-1">Tell us a bit more about what you want to achieve.</p>
                                        </div>
                                        <textarea value={onboardingData.campaignGoals}
                                            onChange={(e) => updateOnboarding('campaignGoals', e.target.value)}
                                            placeholder="E.g., We want to increase brand awareness among Gen Z for our new line..."
                                            className="w-full h-40 p-5 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-[6px] focus:ring-blue-500/5 focus:outline-none transition-colors bg-gray-50 focus:bg-white resize-none text-base"
                                            autoFocus />
                                        <NextButton label="Finish Setup" onClick={handleFinalSubmit} disabled={isSubmitting || !onboardingData.campaignGoals} loading={isSubmitting} />
                                    </div>
                                </CardWrapper>
                            )}

                            {/* ===== STEP 13: Success ===== */}
                            {currentStep === 13 && (
                                <CardWrapper stepKey="step13" direction={direction}>
                                    <div className="w-full space-y-8 py-6 px-1">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="relative">
                                                <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                                                <motion.div
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                                                    className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 transform rotate-3 hover:rotate-0 transition-transform relative z-10"
                                                >
                                                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                                                </motion.div>
                                            </div>

                                            <div className="space-y-2 mt-2">
                                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campaign Queue Started</h1>
                                                <p className="text-slate-500 max-w-sm text-sm mx-auto font-medium">
                                                    Your brand profile is live. Our team will handle influencer matching and sequence execution.
                                                </p>
                                            </div>
                                        </div>

                                        {workflowWarning && (
                                            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-sm font-semibold text-amber-700 flex items-start gap-3">
                                                <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                <p>{workflowWarning}</p>
                                            </div>
                                        )}

                                        {campaignWorkflow ? (
                                            <div className="space-y-6">
                                                {/* Overview Cards Container */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    
                                                    {/* Campaign Summary Card */}
                                                    <div className="rounded-3xl border border-slate-200/60 bg-white/50 backdrop-blur-xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-violet-200 transition-all">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-violet-500/10 transition-colors" />
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                                                                <Target className="w-4 h-4 text-violet-600" />
                                                            </div>
                                                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Campaign Summary</div>
                                                        </div>
                                                        <h2 className="text-xl font-black text-slate-900 mb-1 leading-tight">{campaignWorkflow.campaign.title}</h2>
                                                        <p className="text-xs font-semibold text-slate-500 mb-5 line-clamp-2">{campaignWorkflow.campaign.summary || 'Initial collaboration system.'}</p>
                                                        
                                                        <div className="grid grid-cols-2 gap-2 text-sm relative z-10">
                                                            <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col justify-center">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Budget</div>
                                                                <div className="font-extrabold text-slate-900 truncate">{campaignWorkflow.campaign.totalBudgetLabel}</div>
                                                            </div>
                                                            <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col justify-center">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</div>
                                                                <div className="font-extrabold text-slate-900 capitalize truncate">{campaignWorkflow.campaign.categoryLabel}</div>
                                                            </div>
                                                            <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col justify-center">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reach</div>
                                                                <div className="font-extrabold text-slate-900 truncate">{campaignWorkflow.campaign.followerRangeLabel}</div>
                                                            </div>
                                                            <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col justify-center">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Match Date</div>
                                                                <div className="font-extrabold text-slate-900 truncate flex items-center">
                                                                    {formatSummaryDate(campaignWorkflow.campaign.matchingTriggeredAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Request Health Card */}
                                                    <div className="rounded-3xl border border-slate-200/60 bg-slate-50/50 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-2 mb-5">
                                                            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                                                                <Zap className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Request Health</div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                                            <div className="rounded-2xl bg-blue-50/80 p-3 border border-blue-100/50 shadow-sm relative overflow-hidden group">
                                                                <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-blue-500/10 rounded-full blur-md" />
                                                                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Pending</div>
                                                                <div className="text-3xl font-black text-blue-700 tracking-tight">{campaignWorkflow.counts.pending}</div>
                                                            </div>
                                                            <div className="rounded-2xl bg-emerald-50/80 p-3 border border-emerald-100/50 shadow-sm relative overflow-hidden group">
                                                                <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-emerald-500/10 rounded-full blur-md" />
                                                                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Accepted</div>
                                                                <div className="text-3xl font-black text-emerald-700 tracking-tight">{campaignWorkflow.counts.accepted}</div>
                                                            </div>
                                                            <div className="rounded-2xl bg-amber-50/80 p-3 border border-amber-100/50 shadow-sm relative overflow-hidden group">
                                                                <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-amber-500/10 rounded-full blur-md" />
                                                                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Expired</div>
                                                                <div className="text-3xl font-black text-amber-700 tracking-tight">{campaignWorkflow.counts.expired}</div>
                                                            </div>
                                                            <div className="rounded-2xl bg-violet-50/80 p-3 border border-violet-100/50 shadow-sm relative overflow-hidden group">
                                                                <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-violet-500/10 rounded-full blur-md" />
                                                                <div className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1">Available</div>
                                                                <div className="text-3xl font-black text-violet-700 tracking-tight">{campaignWorkflow.counts.remainingAcceptedSlots}</div>
                                                            </div>
                                                        </div>
                                                        <div className="rounded-2xl border border-slate-200/50 bg-white/60 px-4 py-3 text-xs font-semibold text-slate-500 shadow-sm">
                                                            <span className="text-indigo-600 font-bold">Auto-pilot:</span> Maintaining up to {campaignWorkflow.campaign.activeRequestLimit} pending requests.
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sent Requests Card */}
                                                <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                                                    <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50 flex-wrap gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                                                <Megaphone className="w-5 h-5 text-orange-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-black text-slate-900 leading-tight">Sent Requests</h3>
                                                                <p className="text-xs font-semibold text-slate-500">Live tracker for newest matches.</p>
                                                            </div>
                                                        </div>
                                                        <div className="rounded-full bg-slate-200/60 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-inner">
                                                            {campaignWorkflow.counts.sent} request{campaignWorkflow.counts.sent !== 1 ? 's' : ''}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 overflow-y-auto max-h-[300px] p-2 bg-white custom-scrollbar">
                                                        {campaignWorkflow.sentRequests.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {campaignWorkflow.sentRequests.map((request: any) => (
                                                                    <div key={request.id} className="rounded-2xl border border-transparent hover:border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                                                                {request.influencer.displayName.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-bold text-slate-900 text-sm">{request.influencer.displayName}</div>
                                                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-md">
                                                                                        {request.influencer.followersLabel}
                                                                                    </span>
                                                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                                                                                        {request.influencer.engagementRate.toFixed(1)}% ER
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-200/60">
                                                                            <span className={`inline-flex items-center justify-center rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-wider w-full sm:w-auto text-center ${getStatusClasses(request.status)}`}>
                                                                                {request.status}
                                                                            </span>
                                                                            <div className="text-[10px] font-semibold text-slate-400 capitalize whitespace-nowrap hidden sm:block">
                                                                                Exp {formatSummaryDate(request.expiresAt)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                                                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 rotate-3">
                                                                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-600">Matching in progress</p>
                                                                <p className="text-xs font-medium text-slate-400 mt-1 max-w-[200px] mx-auto">Requests will appear here once our system identifies perfect matches.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Accepted Influencers Module (Only show if > 0) */}
                                                {campaignWorkflow.acceptedInfluencers.length > 0 && (
                                                    <div className="rounded-3xl border border-emerald-200/50 bg-emerald-50/30 p-5 lg:p-6 text-left relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-emerald-400/20 transition-colors" />
                                                        <div className="flex items-center gap-2 mb-4 relative z-10">
                                                            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                                <Users className="w-4 h-4 text-emerald-600" />
                                                            </div>
                                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Hired Creators</h3>
                                                        </div>
                                                        
                                                        <div className="grid gap-3 sm:grid-cols-2 relative z-10">
                                                            {campaignWorkflow.acceptedInfluencers.map((influencer: any) => (
                                                                <div key={influencer.id} className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold shrink-0">
                                                                        {influencer.displayName.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-900 text-sm">{influencer.displayName}</div>
                                                                        <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                                                                            {influencer.followersLabel} â€¢ {influencer.engagementRate.toFixed(1)}% ER
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap justify-center gap-2 text-sm pt-4 pb-2">
                                                <span className="px-3.5 py-1.5 bg-indigo-50/80 backdrop-blur-sm text-indigo-700 rounded-xl font-bold border border-indigo-100/50 shadow-sm flex items-center gap-2">
                                                    <Users size={14} className="text-indigo-500" />
                                                    {selectedFollowerTier.label} · {selectedFollowerRange?.label ?? "Any"} creators
                                                </span>
                                                <span className="px-3.5 py-1.5 bg-emerald-50/80 backdrop-blur-sm text-emerald-700 rounded-xl font-bold border border-emerald-100/50 shadow-sm flex items-center gap-2">
                                                    <DollarSign size={14} className="text-emerald-500" />
                                                    {selectedPerCollabPriceTier?.label ?? "Any"} scope
                                                </span>
                                                {onboardingData.platforms.length > 0 && (
                                                    <span className="px-3.5 py-1.5 bg-pink-50/80 backdrop-blur-sm text-pink-700 rounded-xl font-bold border border-pink-100/50 shadow-sm flex items-center gap-2">
                                                        <TrendingUp size={14} className="text-pink-500" />
                                                        {onboardingData.platforms.slice(0, 2).join(", ")}{onboardingData.platforms.length > 2 ? ' +' + (onboardingData.platforms.length - 2) : ''}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-3 mt-6 pt-4 relative z-20">
                                            <button
                                                onClick={async () => {
                                                    const result = await signIn('credentials', { email: formData.email, password: formData.password, redirect: false });
                                                    if (result?.ok) { router.push(autoCampaignId ? `/brand/campaigns/${autoCampaignId}/match` : '/brand/campaigns/new'); }
                                                    else { router.push('/brand/login'); }
                                                }}
                                                className="w-full py-4.5 bg-slate-900 text-white text-base font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 flex items-center justify-center gap-2 group hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                <Sparkles size={18} className="text-amber-300 group-hover:scale-110 transition-transform" />
                                                Go to Dashboard
                                            </button>
                                            
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={async () => {
                                                        const result = await signIn('credentials', { email: formData.email, password: formData.password, redirect: false });
                                                        if (result?.ok) {
                                                            router.push('/brand/campaigns');
                                                        } else {
                                                            router.push('/brand/login');
                                                        }
                                                    }}
                                                    className="py-3 px-6 text-slate-500 text-sm font-black text-center rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all"
                                                >
                                                    Open Campaigns
                                                </button>
                                            </div>
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

