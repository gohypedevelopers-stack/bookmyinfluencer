'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Layers, LogIn, Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import { signIn, getSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

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
                // Successful login - Redirect based on role
                const session = await getSession();

                if (session?.user?.role === 'ADMIN') {
                    router.push('/admin');
                } else if (session?.user?.role === 'INFLUENCER') {
                    // Check if creator has completed onboarding
                    const onboardingComplete = (session?.user as any)?.onboardingComplete;
                    if (onboardingComplete) {
                        router.push('/creator/dashboard');
                    } else {
                        router.push('/creator/onboarding');
                    }
                } else if (session?.user?.role === 'BRAND') {
                    router.push('/brand/discover');
                } else if (session?.user?.role === 'MANAGER') {
                    router.push('/manager');
                } else {
                    router.push('/');
                }

                router.refresh(); // Refresh to update session state
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred during login');
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-white">
            {/* Left Side - Visual branding (Gradient) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 flex-col justify-between relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center gap-3 mb-16"
                    >
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-wide">BOOKMYINFLUENCER</span>
                    </motion.div>

                    <div className="space-y-8 max-w-lg">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-5xl font-bold text-white leading-[1.1]"
                        >
                            Log in to verify your <br />
                            <span className="text-blue-200">Creative Impact.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-lg text-blue-100/80 leading-relaxed font-light"
                        >
                            Access your dashboard, manage campaigns, and track your performance with our powerful analytics tools.
                        </motion.p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm text-blue-200/60 font-medium">
                    <p>© 2026 BookMyInfluencer</p>
                    <div className="h-1 w-1 rounded-full bg-blue-200/40" />
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full max-w-[440px] bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 relative z-10"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-5 shadow-sm shadow-blue-100">
                            <LogIn className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                        <p className="text-slate-500">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Email</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="flex items-center justify-between mb-1.5 ml-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                    <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span></div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={() => signIn('google', { callbackUrl: '/' })}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                                <Chrome className="w-5 h-5 text-slate-900" /> Google
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-blue-600 font-bold hover:underline decoration-2 underline-offset-2">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
