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
import { CheckCircle2, Lock, ShieldCheck, Eye, EyeOff, Building2, Mail, LayoutDashboard, ArrowRight, Loader2, Zap, Sparkles } from "lucide-react"
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
                        className="mb-6 rounded-xl bg-emerald-50/80 border border-emerald-200 p-4 flex items-start gap-3 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p>{successMessage}</p>
                    </motion.div>
                )}
                
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="mb-6 rounded-xl bg-rose-50/80 border border-rose-200 p-4 flex items-start gap-3 text-sm font-medium text-rose-800 shadow-sm backdrop-blur-sm">
                        <Zap className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Business Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors w-[18px] h-[18px] z-10" />
                        <input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            className="w-full pl-11 pr-4 py-3 text-[14px] border-2 border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 font-semibold shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                        <label htmlFor="password" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Password</label>
                        <Link href="/forgot-password" className="text-[12px] font-bold text-violet-600 hover:text-violet-700 hover:underline transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors w-[18px] h-[18px] z-10" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-11 py-3 text-[14px] border-2 border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 font-semibold shadow-sm "
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
                                <EyeOff className="w-4.5 h-4.5" />
                            ) : (
                                <Eye className="w-4.5 h-4.5" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        disabled={isLoading} 
                        className="w-full group relative flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_6px_20px_-4px_rgba(124,58,237,0.5)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_30px_-6px_rgba(124,58,237,0.7)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        {isLoading ? (
                            <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Authenticating...</>
                        ) : (
                            <>Sign In to Dashboard <ArrowRight className="w-4.5 h-4.5 ml-1 transition-transform group-hover:translate-x-1" /></>
                        )}
                    </button>
                </div>
            </form>
            
            <div className="mt-5 text-center space-y-3">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-slate-400 font-medium leading-none">New to Bookmyinfluencer?</span>
                    </div>
                </div>
                
                <p className="text-slate-600 text-sm">
                    Don't have a brand account?{" "}
                    <Link href="/brand/register" className="font-extrabold text-violet-600 hover:text-violet-700 hover:underline transition-all">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function BrandLoginPage() {
    return (
        <div className="min-h-screen w-full flex bg-slate-50/50 relative overflow-hidden font-sans">
            {/* Ambient Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-violet-200/40 rounded-full blur-[120px]" />
                <motion.div animate={{ y: [0, 20, 0], x: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-indigo-200/40 rounded-full blur-[100px]" />
            </div>

            {/* Left Side (Decorative) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900 border-r border-slate-800/50 z-10 shadow-2xl">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2874&auto=format&fit=crop"
                        alt="Background"
                        fill
                        className="object-cover opacity-30 mix-blend-luminosity scale-105"
                        priority
                        sizes="50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-violet-900/80 to-slate-900/90 mix-blend-multiply" />
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                        <Building2 size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight">Bookmyinfluencer</span>
                </div>

                <div className="relative z-10 max-w-md mt-auto mb-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 shadow-lg">
                            <Sparkles className="w-4 h-4 text-violet-300" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Brand Portal</span>
                        </div>
                        <h1 className="text-5xl font-black leading-[1.1] mb-6 text-white tracking-tight drop-shadow-md">
                            Scale your brand with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">data-driven</span> creators.
                        </h1>
                        <p className="text-slate-300 text-lg mb-10 leading-relaxed font-medium">
                            Manage, track, and optimize high-performing influencer campaigns from a single unified dashboard.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-5">
                        {[
                            { title: "Real-time Analytics", icon: LayoutDashboard },
                            { title: "Automated Escrow", icon: Lock },
                            { title: "AI-Powered Discovery", icon: Sparkles },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                                    <item.icon className="w-5 h-5 text-violet-300" />
                                </div>
                                <span className="font-bold text-slate-100">{item.title}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="relative z-10 mt-auto text-sm text-slate-400 font-medium">
                    &copy; 2024 Bookmyinfluencer. All rights reserved.
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="flex-1 flex flex-col pt-12 lg:pt-0 lg:justify-center items-center p-6 sm:p-12 relative z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* Mobile Logo */}
                <div className="flex lg:hidden items-center gap-3 mb-10 mt-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Building2 size={20} className="text-white" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">Bookmyinfluencer</span>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[440px] bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08),0_0_40px_rgba(124,58,237,0.03)] border border-white box-border"
                >
                    <div className="mb-7 text-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-violet-100/50 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <Lock className="w-6 h-6 text-violet-600" />
                        </div>
                        <h2 className="text-[1.75rem] leading-tight font-black text-slate-900 mb-1.5 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 text-sm font-medium px-2 leading-relaxed">
                            Sign in to your dashboard to manage your brand campaigns.
                        </p>
                    </div>

                    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>}>
                        <BrandLoginForm />
                    </Suspense>

                    <div className="flex gap-4 pt-6 mt-2">
                        <div className="flex-1 p-3 border border-slate-100 rounded-xl flex items-center gap-3 bg-slate-50/80 hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-emerald-100/80 flex items-center justify-center shrink-0 border border-emerald-200/50">
                                <Lock className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Secure</div>
                                <div className="text-xs font-bold text-slate-700 truncate">256-bit SSL</div>
                            </div>
                        </div>
                        <div className="flex-1 p-3 border border-slate-100 rounded-xl flex items-center gap-3 bg-slate-50/80 hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-violet-100/80 flex items-center justify-center shrink-0 border border-violet-200/50">
                                <ShieldCheck className="w-4 h-4 text-violet-600" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Privacy</div>
                                <div className="text-xs font-bold text-slate-700 truncate">Data Safe</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 pt-5 mt-1 uppercase tracking-wider">
                        <Link href="/privacy" className="hover:text-violet-600 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-violet-600 transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-violet-600 transition-colors">Support</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
