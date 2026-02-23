'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Layers, User, Phone, Instagram, Youtube, Mail, Lock, CheckCircle, ArrowRight, Loader2, Chrome, Github } from 'lucide-react';
import { registerUserAction } from './actions';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const router = useRouter();



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Reset verification if email changes
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

    const requestOtp = async () => {
        if (!formData.email) {
            setError("Please enter an email address first");
            return;
        }
        setOtpLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/request-otp", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await res.json();
            if (data.ok) {
                setOtpSent(true);
            } else {
                setError(data.message || data.error || "Failed to send OTP");
            }
        } catch (e) {
            setError("Failed to send OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setError("Please enter valid 6-digit OTP");
            return;
        }
        setOtpLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp }),
            });
            const data = await res.json();
            if (data.ok) {
                setEmailVerified(true);
                setOtpSent(false);
            } else {
                setError(data.message || data.error || "Invalid OTP");
            }
        } catch (e) {
            setError("Failed to verify OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!emailVerified) {
            setError('Please verify your email address before continuing');
            return;
        }

        if (!formData.agreeToTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        // Call server action to register user
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, value.toString());
        });

        try {
            await registerUserAction(formDataObj);
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
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

    return (
        <div className="min-h-screen w-full flex bg-slate-50">
            {/* Left Side - Visual branding (Gradient) - Same as Login */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 flex-col justify-between relative overflow-hidden shrink-0"
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
                        <span className="text-xl font-bold text-white tracking-wide">CREATOR HUB</span>
                    </motion.div>

                    <div className="space-y-6 max-w-sm">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-4xl font-bold text-white leading-[1.1]"
                        >
                            Turn your content <br />
                            into a <span className="text-blue-200">Career.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-white/80 leading-relaxed font-light"
                        >
                            Join 50,000+ creators landing deals with global brands daily. Everything you need to manage your business in one place.
                        </motion.p>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                    <div>
                        <h4 className="text-white font-semibold mb-1">Get Verified</h4>
                        <p className="text-xs text-blue-100/70">Boost credibility with our badge.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-1">Direct Deals</h4>
                        <p className="text-xs text-blue-100/70">No middlemen, just you & brands.</p>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Registration Form */}
            <div className="flex-1 w-full bg-slate-50 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none fixed" />

                <div className="min-h-full flex items-center justify-center p-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-full max-w-2xl bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 relative z-10"
                    >
                        {/* Mobile Header */}
                        <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Layers className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900">CREATOR HUB</span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>Already have an account?</span>
                                <Link href="/login" className="text-blue-600 font-bold hover:underline flex items-center gap-1 group">
                                    Log in <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Personal Info Section */}
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                                <User className="w-4.5 h-4.5" />
                                            </div>
                                            <input
                                                name="fullName"
                                                type="text"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile Number</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                                <Phone className="w-4.5 h-4.5" />
                                            </div>
                                            <input
                                                name="mobileNumber"
                                                type="tel"
                                                value={formData.mobileNumber}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                                placeholder="+1 (555) 000-0000"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Primary Platform</label>
                                    <div className="relative">
                                        <select
                                            name="primaryPlatform"
                                            value={formData.primaryPlatform}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            {platforms.map(platform => (
                                                <option key={platform.value} value={platform.value}>
                                                    {platform.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Instagram URL</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors pointer-events-none">
                                                <Instagram className="w-4.5 h-4.5" />
                                            </div>
                                            <input
                                                name="instagramUrl"
                                                type="url"
                                                value={formData.instagramUrl}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 focus:bg-white transition-all shadow-sm"
                                                placeholder="instagram.com/handle"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">YouTube URL</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors pointer-events-none">
                                                <Youtube className="w-4.5 h-4.5" />
                                            </div>
                                            <input
                                                name="youtubeUrl"
                                                type="url"
                                                value={formData.youtubeUrl}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all shadow-sm"
                                                placeholder="youtube.com/@channel"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Account Security Section */}
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                            <Mail className="w-4.5 h-4.5" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-10 py-3 border ${emailVerified ? 'bg-green-50/50 border-green-200 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-900'} rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm`}
                                            placeholder="name@example.com"
                                            required
                                            disabled={emailVerified}
                                        />
                                        {emailVerified && (
                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500 bg-white rounded-full p-0.5 shadow-sm">
                                                <CheckCircle className="w-4 h-4 fill-current" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dynamic OTP Section */}
                                <AnimatePresence mode="wait">
                                    {!emailVerified && formData.email && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 rounded-2xl">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Email Verification Required</span>
                                                        {otpSent && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setOtpSent(false)}
                                                                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                                                            >
                                                                Change Email
                                                            </button>
                                                        )}
                                                    </div>

                                                    {!otpSent ? (
                                                        <button
                                                            type="button"
                                                            onClick={requestOtp}
                                                            disabled={otpLoading || !formData.email}
                                                            className="w-full py-2.5 bg-white border border-blue-200 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm disabled:opacity-50"
                                                        >
                                                            {otpLoading ? (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Code...
                                                                </span>
                                                            ) : (
                                                                'Send Verification Code'
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="000000"
                                                                    value={otp}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                                        setOtp(val);
                                                                    }}
                                                                    className="flex-1 px-4 py-2.5 text-center text-lg tracking-[0.5em] font-mono border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white transition-all text-slate-800"
                                                                    maxLength={6}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={verifyOtp}
                                                                    disabled={otpLoading || otp.length !== 6}
                                                                    className="px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:scale-100 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                                                >
                                                                    {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-slate-500 text-center">
                                                                We sent a code to <span className="font-semibold text-slate-700">{formData.email}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                                <Lock className="w-4.5 h-4.5" />
                                            </div>
                                            <input
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
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

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                                <Lock className="w-4.5 h-4.5" />
                                            </div>
                                            <input
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex h-6 items-center">
                                    <input
                                        type="checkbox"
                                        id="agreeToTerms"
                                        name="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        onChange={handleInputChange}
                                        className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                    />
                                </div>
                                <label htmlFor="agreeToTerms" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                                    I agree to the {' '}
                                    <Link href="/terms" className="text-blue-600 font-bold hover:underline">
                                        Terms of Service
                                    </Link>{' '}
                                    and {' '}
                                    <Link href="/privacy" className="text-blue-600 font-bold hover:underline">
                                        Privacy Policy
                                    </Link>
                                    .
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    if (!emailVerified) {
                                        setError("Please verify your email first");
                                        return;
                                    }
                                    handleSubmit(e as any);
                                }}
                                disabled={loading || !emailVerified}
                                className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-base shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                                    </div>
                                ) : (
                                    <>
                                        Join as a Creator <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400 font-medium">Or continue with</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => signIn('google', { callbackUrl: '/' })}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                >
                                    <Chrome className="w-5 h-5 text-slate-900" /> Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => signIn('github', { callbackUrl: '/' })}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                >
                                    <Github className="w-5 h-5 text-slate-900" /> GitHub
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
