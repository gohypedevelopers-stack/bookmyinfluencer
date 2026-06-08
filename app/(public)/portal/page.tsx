"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getProviders, getSession, signIn } from "next-auth/react"
import type { Session } from "next-auth"
import { signInWithRedirectClient, handleRedirectResult } from "@/lib/firebase-auth-client"
import Link from "next/link"
import { CheckCircle2, Lock, Eye, EyeOff, Mail, ArrowRight, Loader2, Zap, Building2, User, Layers } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GateReveal } from "@/components/GateReveal"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

const GoogleIcon = ({ className = "" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
)

function getPostLoginPath(session: Session | null) {
    if (session?.user?.role === 'ADMIN') return '/admin'
    if (session?.user?.role === 'MANAGER') return '/manager'
    if (session?.user?.role === 'BRAND') return '/brand/dashboard'
    if (session?.user?.role === 'INFLUENCER') return '/creator/dashboard'
    return '/'
}

function UnifiedLoginForm() {
    const [mode, setMode] = useState<"creator" | "brand">("creator")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [googleAvailable, setGoogleAvailable] = useState(false)
    const [providersLoaded, setProvidersLoaded] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage("Account created successfully. Please sign in.")
        }
        let active = true
        async function hydrateAuthState() {
            try {
                const firebaseUser = await handleRedirectResult();
                if (firebaseUser) {
                    setGoogleLoading(true);
                    // Restore the portal mode that was active before the Google redirect
                    const savedMode = sessionStorage.getItem('portalGoogleMode') || 'creator'
                    sessionStorage.removeItem('portalGoogleMode')
                    const result = await signIn("credentials", {
                        redirect: false,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || (savedMode === "brand" ? "Brand" : "Creator"),
                        image: firebaseUser.photoURL || null,
                        isGoogleLogin: "true",
                        role: savedMode === "brand" ? "BRAND" : "INFLUENCER",
                        password: "bypass",
                    })

                    if (result?.error) {
                        setError(result.error || "Google login failed")
                        setGoogleLoading(false)
                    } else {
                        const session = await getSession()
                        if (session?.user) {
                            router.push(getPostLoginPath(session))
                            router.refresh()
                        } else {
                            setGoogleLoading(false)
                        }
                        return
                    }
                }
            } catch (err: any) {
                console.error("Redirect auth error:", err)
                setError(err.message || "Failed to complete Google authentication")
            }

            const [providers, session] = await Promise.all([
                getProviders(),
                getSession(),
            ])
            if (!active) return
            setGoogleAvailable(true)
            setProvidersLoaded(true)
            if (session?.user) {
                router.push(getPostLoginPath(session))
                router.refresh()
            }
        }
        hydrateAuthState().catch((err) => {
            console.error(err)
            if (!active) return
            setGoogleAvailable(true)
            setProvidersLoaded(true)
        })
        return () => { active = false }
    }, [searchParams, router])

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
                setError("Invalid email or password.")
                setIsLoading(false)
                return
            }

            const session = await getSession()
            if (session?.user) {
                const nextPath = getPostLoginPath(session)
                router.push(nextPath)
                router.refresh()
            } else {
                setIsLoading(false)
            }
        } catch (err) {
            setError("Something went wrong while signing in.")
            setIsLoading(false)
        }
    }

    async function handleGoogleLogin() {
        setGoogleLoading(true)
        setError("")
        setSuccessMessage("")

        try {
            // Persist current mode before redirect so we can restore it after
            sessionStorage.setItem('portalGoogleMode', mode)
            await signInWithRedirectClient()
        } catch (error: any) {
            console.error(error)
            setError(error.message || "Unable to start Google login")
            setGoogleLoading(false)
        }
    }

    return (
        <div className="w-full">
            {/* Mode Toggle */}
            <div className="mb-8 flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-inner">
                <button
                    type="button"
                    onClick={() => setMode("creator")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === "creator" ? "bg-white text-indigo-600 shadow-[0_4px_20px_rgba(0,0,0,0.05)] scale-[1.02]" : "text-slate-500 hover:text-slate-700"}`}
                >
                    <User className="w-4 h-4" /> Creator
                </button>
                <button
                    type="button"
                    onClick={() => setMode("brand")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === "brand" ? "bg-white text-violet-600 shadow-[0_4px_20px_rgba(0,0,0,0.05)] scale-[1.02]" : "text-slate-500 hover:text-slate-700"}`}
                >
                    <Building2 className="w-4 h-4" /> Brand
                </button>
            </div>

            <AnimatePresence mode="wait">
                {successMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-3 text-sm font-medium text-emerald-800 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p>{successMessage}</p>
                    </motion.div>
                )}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3 text-sm font-medium text-rose-800 shadow-sm">
                        <Zap className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[11px] font-black text-slate-500 uppercase tracking-[0.12em] ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-[18px] h-[18px] z-10" />
                        <input
                            id="email"
                            type="email"
                            placeholder={mode === "brand" ? "name@company.com" : "hello@creator.com"}
                            className="w-full pl-11 pr-4 py-3.5 text-[15px] border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all bg-white hover:bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 font-medium shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                        <label htmlFor="password" className="text-[11px] font-black text-slate-500 uppercase tracking-[0.12em]">Password</label>
                        <Link href="/forgot-password" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-[18px] h-[18px] z-10" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-11 py-3.5 text-[15px] border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all bg-white hover:bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 font-medium shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        disabled={isLoading || googleLoading} 
                        className="w-full group relative flex items-center justify-center gap-2 h-[56px] text-white font-extrabold text-[16px] rounded-2xl shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(79,70,229,0.7)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden bg-gradient-to-r from-indigo-500 via-violet-600 to-indigo-500 bg-[length:200%_auto] hover:bg-[position:right_center]"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                        ) : (
                            <>Sign In <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" /></>
                        )}
                    </button>
                </div>
            </form>

            <div className="relative my-7">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-slate-400 font-bold uppercase tracking-wider leading-none">Or continue with</span></div>
            </div>

            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={!providersLoaded || googleLoading || isLoading}
                className="relative w-full overflow-hidden flex items-center justify-center gap-2 h-[56px] bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-[15px] transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 group"
            >
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full">
                        {googleLoading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
                                <GoogleIcon className="w-full h-full" />
                            </motion.div>
                        ) : (
                            <GoogleIcon className="w-full h-full transition-transform duration-300" />
                        )}
                    </div>
                    <span>{googleLoading ? "Connecting..." : "Google"}</span>
                </div>
            </button>
            
            <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                    New to BookMyInfluencer?{" "}
                    <Link href={mode === "brand" ? "/brand/register" : "/register"} className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function PortalPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />
            
            <GateReveal>
                <div className="relative flex-1 flex flex-col items-center pt-8 pb-20">
                    
                    {/* Light Theme Background Orbs */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
                        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-purple-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
                        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-pink-400/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
                    </div>

                    {/* Login Card */}
                    <div className="relative z-10 w-full max-w-[440px] px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative"
                        >
                            <div className="relative bg-white/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-100">
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
                                        className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm transform -rotate-6 hover:rotate-0 transition-transform duration-500"
                                    >
                                        <Layers className="w-8 h-8 text-indigo-500" />
                                    </motion.div>
                                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
                                    <p className="text-slate-500 text-sm font-medium">Access your portal and amplify your reach.</p>
                                </div>

                                <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>}>
                                    <UnifiedLoginForm />
                                </Suspense>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </GateReveal>
            
            <Footer />
        </div>
    )
}
