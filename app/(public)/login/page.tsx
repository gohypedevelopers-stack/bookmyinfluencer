"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Layers, LogIn, Mail, Lock, ArrowRight, Chrome, Building2, TrendingUp, Users, BarChart3, Star, Loader2, Zap, CheckCircle2 } from 'lucide-react';
import { signIn, getSession, getProviders } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from 'next-auth';
import { signInWithRedirectClient, handleRedirectResult } from '@/lib/firebase-auth-client';

function getPostLoginPath(session: Session | null) {
    if (session?.user?.role === 'ADMIN') return '/admin';
    if (session?.user?.role === 'MANAGER') return '/manager';
    if (session?.user?.role === 'BRAND') return '/brand/campaigns';
    if (session?.user?.role === 'INFLUENCER') {
        return (session.user as any)?.onboardingComplete ? '/creator/dashboard' : '/creator/onboarding';
    }

    return '/';
}

const statCards = [
    { icon: TrendingUp, value: "125%", label: "Audience Growth", color: "from-emerald-400 to-teal-500" },
    { icon: Users, value: "2M+", label: "Total Reach", color: "from-blue-400 to-indigo-500" },
    { icon: BarChart3, value: "4.9/5", label: "Brand Rating", color: "from-violet-400 to-purple-500" },
];

const GoogleIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const [googleAvailable, setGoogleAvailable] = useState(false);
    const [providersLoaded, setProvidersLoaded] = useState(false);

    const router = useRouter();

    const redirectAfterLogin = useCallback((session: Session | null) => {
        const nextPath = getPostLoginPath(session);
        router.push(nextPath);
        router.refresh();
    }, [router]);

    useEffect(() => {
        let active = true;

        async function hydrateAuthState() {
            try {
                const firebaseUser = await handleRedirectResult();
                if (firebaseUser) {
                    setGoogleLoading(true);
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
                        setError(result.error || 'Google login failed');
                        setGoogleLoading(false);
                    } else {
                        const session = await getSession();
                        redirectAfterLogin(session);
                        return;
                    }
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
    }, [redirectAfterLogin]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setLoading(false);
            } else {
                const session = await getSession();
                redirectAfterLogin(session);
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred during login');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');

        try {
            await signInWithRedirectClient();
        } catch (error: any) {
            console.error(error);
            setError(error.message || 'Unable to start Google login');
            setGoogleLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen w-full flex bg-[#0a0a1a] relative overflow-hidden font-sans">
            {/* Left Side — Immersive Visual Panel */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-[48%] relative overflow-hidden"
            >
                {/* Premium Deep Gradient Background */}
                <div className="absolute inset-0 z-0 bg-[#0B051D]">
                    {/* Multi-layer gradient background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1e1045] via-[#0f0826] to-[#0a041a]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
                    
                    {/* Floating 3D-like glass shapes (simulating the reference design) */}
                    <motion.div
                        animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[10%] right-[15%] w-48 h-48 rounded-[3rem] bg-gradient-to-br from-violet-500/10 to-purple-600/5 backdrop-blur-3xl border border-white/5 rotate-12 shadow-[inset_0_0_40px_rgba(139,92,246,0.1)]"
                    />
                    <motion.div
                        animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-[30%] left-[-5%] w-64 h-64 rounded-[4rem] bg-gradient-to-tr from-indigo-500/10 to-blue-600/5 backdrop-blur-3xl border border-white/5 -rotate-12 shadow-[inset_0_0_50px_rgba(99,102,241,0.1)]"
                    />
                    <motion.div
                        animate={{ y: [0, -20, 0], x: [0, -20, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                        className="absolute top-[40%] right-[-10%] w-72 h-72 rounded-full bg-gradient-to-bl from-fuchsia-500/10 to-pink-600/5 backdrop-blur-3xl border border-white/5 shadow-[inset_0_0_60px_rgba(217,70,239,0.1)]"
                    />

                    {/* Animated floating orbs for extra glow */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] left-[20%] w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                        className="absolute bottom-[10%] right-[20%] w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[140px]"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between w-full p-10 xl:p-14">
                    {/* Top — Brand logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl flex items-center justify-center shadow-2xl">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white/90 tracking-wide">BOOKMYINFLUENCER</span>
                    </motion.div>

                    {/* Center — Hero text + stat cards */}
                    <div className="space-y-10 -mt-8">
                        <motion.div
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                            className="space-y-5"
                        >
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 text-[11px] font-semibold text-violet-300 uppercase tracking-widest">
                                <Star className="w-3.5 h-3.5" />
                                Creator Portal
                            </div>

                            <h1 className="text-[2.75rem] xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                                Log in to verify your{" "}
                                <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                                    Creative Impact.
                                </span>
                            </h1>

                            <p className="text-base text-slate-400 leading-relaxed max-w-md font-normal">
                                Access your dashboard, manage campaigns, and track your performance with our powerful analytics tools.
                            </p>
                        </motion.div>

                        {/* Floating stat cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="flex gap-4"
                        >
                            {statCards.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="flex-1 p-5 rounded-[1.5rem] bg-[#1a1333]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 group relative overflow-hidden"
                                >
                                    {/* Inner hover glow */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    <div className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                                    <div className="text-xs font-medium text-slate-400 mt-1">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Bottom — Trust footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900/80 overflow-hidden shadow-md">
                                        <img src={`https://i.pravatar.cc/80?img=${i + 20}`} alt="user" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    {[1,2,3,4,5].map(i => (
                                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Trusted by 50,000+ creators</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                            <span className="text-slate-700">·</span>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side — Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative z-10 bg-gradient-to-br from-slate-50 via-white to-violet-50/30 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* Subtle decorative accents on right side */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] bg-violet-100/40 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[80px]" />
                </div>

                {/* Mobile Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex lg:hidden items-center gap-3 mb-8"
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Layers size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">Bookmyinfluencer</span>
                </motion.div>

                {/* Login Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[400px] relative"
                >
                    {/* Glow behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-200/50 via-indigo-200/30 to-purple-200/50 rounded-[2.2rem] blur-xl opacity-60 pointer-events-none" />
                    
                    <div className="relative bg-white/90 backdrop-blur-2xl p-7 sm:p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/80 ring-1 ring-slate-200/50">
                        {/* Header */}
                        <div className="mb-5 text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-300/40 transform rotate-3 hover:rotate-0 transition-transform duration-300"
                            >
                                <LogIn className="w-6 h-6 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">Welcome Back</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Sign in to your creator dashboard.
                            </p>
                        </div>

                        {/* Google Sign-In — placed directly below subtitle */}
                        <div className="mb-5">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={!providersLoaded || googleLoading || loading}
                                title={!googleAvailable ? (process.env.NODE_ENV === 'development' ? 'Google login [Simulation Mode]' : 'Google login needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET') : 'Continue with Google'}
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
                        </div>

                        {/* Divider */}
                        <div className="relative mb-5">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/60"></div></div>
                            <div className="relative flex justify-center text-xs"><span className="bg-white/80 px-3 text-slate-400 font-medium leading-none">Or sign in with email</span></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="mb-2 rounded-xl bg-rose-50/80 border border-rose-200 p-3.5 flex items-start gap-3 text-sm font-medium text-rose-800 shadow-sm backdrop-blur-sm">
                                        <Zap className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.12em] ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors w-[18px] h-[18px] z-10" />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3 text-[14px] border border-slate-200/80 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none transition-all bg-white/60 hover:bg-white focus:bg-white text-slate-800 placeholder-slate-400 font-medium shadow-sm"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.12em]">Password</label>
                                    <Link href="/forgot-password" className="text-[11px] font-bold text-violet-500 hover:text-violet-600 hover:underline transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors w-[18px] h-[18px] z-10" />
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-11 py-3 text-[14px] border border-slate-200/80 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none transition-all bg-white/60 hover:bg-white focus:bg-white text-slate-800 placeholder-slate-400 font-medium shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || googleLoading}
                                    className="w-full group relative flex items-center justify-center gap-2 h-[52px] text-white font-semibold text-[15px] rounded-2xl shadow-[0_8px_30px_-6px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.7)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                                    style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%)" }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                                    ) : (
                                        <>Sign In <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" /></>
                                    )}
                                </button>
                            </div>


                        </form>

                        <div className="mt-6 text-center space-y-3">
                            <p className="text-sm text-slate-500">
                                Don't have an account?{' '}
                                <Link href="/register" className="font-bold text-violet-600 hover:text-violet-700 hover:underline transition-all">
                                    Sign up for free
                                </Link>
                            </p>
                            <div className="pt-2 border-t border-slate-100/80">
                                <Link href="/brand/login" className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline transition-colors uppercase tracking-wider">
                                    <Building2 className="w-3.5 h-3.5" />
                                    Log in as a Brand instead
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
