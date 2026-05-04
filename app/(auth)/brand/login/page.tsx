"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inspectBrandLoginEmail } from "@/app/brand/auth-actions"
import { CheckCircle2, Lock, ShieldCheck, Eye, EyeOff, Building2, Mail, LayoutDashboard, ArrowRight, Loader2, Zap, Sparkles, Layers, TrendingUp, Users, BarChart3, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function BrandLoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage("Brand account created successfully. Please sign in.")
        }
    }, [searchParams])

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const normalizedEmail = email.trim().toLowerCase()

        try {
            const res = await signIn("credentials", {
                email: normalizedEmail,
                password,
                redirect: false,
            })

            if (res?.error) {
                const diagnostic = await inspectBrandLoginEmail(normalizedEmail)
                setError(diagnostic.message || "Invalid email or password.")
                setIsLoading(false)
                return
            }

            const session = await getSession()
            if (session?.user?.role === "BRAND" || session?.user?.role === "ADMIN") {
                router.push("/brand")
                router.refresh()
                return
            }

            await signOut({ redirect: false })

            if (session?.user?.role === "INFLUENCER") {
                setError("This email is linked to an influencer account. Use creator sign in or a different business email for your brand.")
            } else if (session?.user?.role === "MANAGER") {
                setError("This email is linked to a manager account, not a brand account.")
            } else {
                setError("This login is not connected to a brand account.")
            }
            setIsLoading(false)
        } catch (err) {
            setError("Something went wrong while signing in.")
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {successMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="mb-5 rounded-xl bg-emerald-50/80 border border-emerald-200 p-3.5 flex items-start gap-3 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p>{successMessage}</p>
                    </motion.div>
                )}
                
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="mb-5 rounded-xl bg-rose-50/80 border border-rose-200 p-3.5 flex items-start gap-3 text-sm font-medium text-rose-800 shadow-sm backdrop-blur-sm">
                        <Zap className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.12em] ml-1">Business Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors w-[18px] h-[18px] z-10" />
                        <input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            className="w-full pl-11 pr-4 py-3 text-[14px] border border-slate-200/80 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none transition-all bg-white/60 hover:bg-white focus:bg-white text-slate-800 placeholder-slate-400 font-medium shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                        <label htmlFor="password" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.12em]">Password</label>
                        <Link href="/forgot-password" className="text-[11px] font-bold text-violet-500 hover:text-violet-600 hover:underline transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors w-[18px] h-[18px] z-10" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-11 py-3 text-[14px] border border-slate-200/80 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none transition-all bg-white/60 hover:bg-white focus:bg-white text-slate-800 placeholder-slate-400 font-medium shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        disabled={isLoading} 
                        className="w-full group relative flex items-center justify-center gap-2 h-[52px] text-white font-semibold text-[15px] rounded-2xl shadow-[0_8px_30px_-6px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.7)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%)" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                        ) : (
                            <>Sign in to Dashboard <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" /></>
                        )}
                    </button>
                </div>
            </form>
            
            <div className="mt-5 text-center space-y-2.5">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200/60"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white/80 text-slate-400 font-medium leading-none">New to Bookmyinfluencer?</span>
                    </div>
                </div>
                
                <p className="text-slate-500 text-sm">
                    Don't have a brand account?{" "}
                    <Link href="/brand/register" className="font-bold text-violet-600 hover:text-violet-700 hover:underline transition-all">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    )
}

// Floating stat cards for the left sidebar
const statCards = [
    { icon: TrendingUp, value: "340%", label: "Avg. ROI", color: "from-emerald-400 to-teal-500" },
    { icon: Users, value: "50K+", label: "Creators", color: "from-blue-400 to-indigo-500" },
    { icon: BarChart3, value: "98%", label: "Success Rate", color: "from-violet-400 to-purple-500" },
];

export default function BrandLoginPage() {
    return (
        <div className="min-h-screen w-full flex bg-[#0a0a1a] relative overflow-hidden font-sans">

            {/* Left Side — Immersive Visual Panel */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-[48%] relative overflow-hidden"
            >
                {/* Background Image with premium overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2874&auto=format&fit=crop"
                        alt="Brand Dashboard Background"
                        fill
                        className="object-cover scale-110"
                        priority
                        sizes="50vw"
                    />
                    {/* Multi-layer gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-950/95 via-indigo-950/90 to-slate-950/95" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                    {/* Mesh gradient accent */}
                    <div className="absolute inset-0 opacity-30"
                        style={{
                            background: "radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.2) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(168,85,247,0.15) 0%, transparent 50%)"
                        }}
                    />
                </div>

                {/* Animated grid pattern */}
                <div className="absolute inset-0 z-[1] opacity-[0.04]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                        backgroundSize: "60px 60px"
                    }}
                />

                {/* Animated floating orbs */}
                <motion.div
                    animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full z-[2]"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }}
                />
                <motion.div
                    animate={{ y: [0, 20, 0], x: [0, -20, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    className="absolute bottom-[20%] left-[5%] w-80 h-80 rounded-full z-[2]"
                    style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
                />

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
                                <Sparkles className="w-3.5 h-3.5" />
                                Brand Portal
                            </div>

                            <h1 className="text-[2.75rem] xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                                Scale your brand with{" "}
                                <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                                    data-driven creators.
                                </span>
                            </h1>

                            <p className="text-base text-slate-400 leading-relaxed max-w-md font-normal">
                                Manage, track, and optimize high-performing influencer campaigns from a single unified dashboard.
                            </p>
                        </motion.div>

                        {/* Floating stat cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="flex gap-3"
                        >
                            {statCards.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                                    className="flex-1 p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-all duration-300 group"
                                >
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <div className="text-xl font-extrabold text-white">{stat.value}</div>
                                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">{stat.label}</div>
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
                                        <img src={`https://i.pravatar.cc/80?img=${i + 15}`} alt="user" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    {[1,2,3,4,5].map(i => (
                                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Trusted by 10,000+ brands</p>
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
                        <Building2 size={20} className="text-white" />
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
                        <div className="mb-6 text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-300/40 transform rotate-3 hover:rotate-0 transition-transform duration-300"
                            >
                                <Lock className="w-6 h-6 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">Welcome Back</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Sign in to manage your brand campaigns.
                            </p>
                        </div>

                        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-7 h-7 text-violet-500 animate-spin" /></div>}>
                            <BrandLoginForm />
                        </Suspense>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
