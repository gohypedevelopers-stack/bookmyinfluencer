'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ArrowLeft, Briefcase, Star, Shield, CheckCircle2, Mail, Phone, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [step, setStep] = useState<'phone' | 'otp' | 'role'>('phone');
    const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    // API Interaction State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [resendIn, setResendIn] = useState(0);

    // Resend Timer
    useEffect(() => {
        if (resendIn <= 0) return;
        const timer = setInterval(() => {
            setResendIn((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [resendIn]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    const handleGetOTP = async () => {
        setError(null);
        setMessage(null);

        if (loginMethod === 'phone') {
            // Phone logic not yet implemented on backend
            if (phone.length >= 10) {
                setStep('otp');
            }
            return;
        }

        if (loginMethod === 'email' && email.includes('@')) {
            setLoading(true);
            try {
                const res = await fetch("/api/auth/request-otp", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();

                if (!res.ok && !data.ok && data.error === "RATE_LIMITED") {
                    const duration = data.resendIn || 30;
                    setResendIn(duration);
                    setStep('otp'); // Allow proceeding to enter OTP even if rate limited
                    setMessage(`Rate limit active. Wait ${duration}s to resend.`);
                    return;
                }

                if (!data.ok) {
                    setError(data.message || "Failed to send OTP.");
                    return;
                }

                setResendIn(data.resendIn || 30);
                setMessage("Code sent successfully");
                setStep('otp');
            } catch (err) {
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResendOTP = async () => {
        if (loading || resendIn > 0) return;

        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            const endpoint = loginMethod === 'email' ? "/api/auth/request-otp" : null;
            if (!endpoint) {
                console.log("Resend not implemented for phone yet");
                setLoading(false);
                return;
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok && !data.ok && data.error === "RATE_LIMITED") {
                const duration = data.resendIn || 30;
                setResendIn(duration);
                setMessage(`Rate limit active. Wait ${duration}s to resend.`);
                return;
            }

            if (!data.ok) {
                setError(data.message || "Failed to resend OTP.");
                return;
            }

            setResendIn(data.resendIn || 30);
            setMessage("Code sent successfully");
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return;

        setLoading(true);
        setError(null);

        // Phone mock
        if (loginMethod === 'phone') {
            setStep('role');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email, otp: otpValue }),
            });
            const data = await res.json();

            if (!data.ok) {
                if (data.error === "expired") setError("Code expired. Please resend.");
                else if (data.error === "locked") setError("Too many attempts. Locked.");
                else setError("Invalid code. Please try again.");
                return;
            }

            // Success
            setStep('role');
        } catch (err) {
            setError("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Visual branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Bookmyinfluencer</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            Where creators and brands build together.
                        </h1>
                        <p className="text-xl text-teal-50">
                            Join 100+ creators active today
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex -space-x-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="w-14 h-14 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center"
                        />
                    ))}
                </div>
            </div>

            {/* Right Side - Forms */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Back button (only show on OTP and Role steps) */}
                    {step !== 'phone' && (
                        <button
                            onClick={() => setStep(step === 'otp' ? 'phone' : 'otp')}
                            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back to number</span>
                        </button>
                    )}

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-500 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                            Bookmyinfluencer
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Phone/Email Input Step */}
                        {step === 'phone' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
                                    <p className="text-gray-600">Choose your preferred login method</p>
                                </div>

                                {/* Login Method Toggle */}
                                <div className="flex p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => setLoginMethod('phone')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${loginMethod === 'phone'
                                            ? 'bg-white text-teal-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Phone className="w-4 h-4" />
                                        Phone
                                    </button>
                                    <button
                                        onClick={() => setLoginMethod('email')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${loginMethod === 'email'
                                            ? 'bg-white text-teal-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </button>
                                </div>

                                {loginMethod === 'phone' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Mobile Number
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="flex items-center px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 text-gray-700 font-medium whitespace-nowrap">
                                                IN +91
                                            </div>
                                            <input
                                                id="phone"
                                                type="tel"
                                                placeholder="Enter mobile number"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                {error && <p className="text-sm text-red-500">{error}</p>}

                                <button
                                    onClick={handleGetOTP}
                                    disabled={loading || (loginMethod === 'phone' ? phone.length < 10 : !email.includes('@'))}
                                    className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get OTP"}
                                    {!loading && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    )}
                                </button>

                                <p className="text-xs text-center text-gray-500">
                                    By continuing, you agree to our{' '}
                                    <Link href="/terms" className="text-teal-600 hover:underline">
                                        Terms
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-teal-600 hover:underline">
                                        Privacy Policy
                                    </Link>
                                </p>
                            </div>
                        )}

                        {/* OTP Verification Step */}
                        {step === 'otp' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your account</h2>
                                    <p className="text-gray-600">
                                        We sent a 6-digit code to <span className="font-semibold text-teal-600">
                                            {loginMethod === 'phone' ? `+91 ${phone}` : email}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Enter OTP Code
                                    </label>
                                    <div className="flex gap-2 justify-between">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                disabled={loading}
                                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={loading || otp.join('').length !== 6}
                                    className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                                </button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Didn&apos;t receive the code?{' '}
                                        <button
                                            onClick={handleResendOTP}
                                            disabled={loading || resendIn > 0}
                                            className="text-teal-600 font-semibold hover:underline disabled:opacity-50"
                                        >
                                            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend"}
                                        </button>
                                    </p>
                                    {message && !error && (
                                        <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>{message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Role Selection Step */}
                        {step === 'role' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">How will you use Bookmyinfluencer?</h2>
                                    <p className="text-gray-600">Select your role to customize your experience</p>
                                </div>

                                <div className="space-y-3">
                                    <Link
                                        href="/brand/discover"
                                        className="block p-6 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <Briefcase className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Join as a Brand</h3>
                                                <p className="text-sm text-gray-600">
                                                    I want to hire influencers, manage campaigns, and track ROI.
                                                </p>
                                                <div className="mt-2 text-xs text-teal-600 font-medium">
                                                    © 2026 Bookmyinfluencer Inc.
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/creator/onboarding"
                                        className="block p-6 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <Star className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Join as an Influencer</h3>
                                                <p className="text-sm text-gray-600">
                                                    I create content and want to monetize my audience through brand deals.
                                                </p>
                                                <div className="mt-2 text-xs text-teal-600 font-medium">
                                                    © 2026 Bookmyinfluencer Inc.
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/admin/kyc"
                                        className="block p-6 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <Shield className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Admin Access</h3>
                                                <p className="text-sm text-gray-600">
                                                    Platform management, user verification, and transaction oversight.
                                                </p>
                                                <div className="mt-2 text-xs text-red-600 font-medium">
                                                    Authorized personnel only
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Need help?{' '}
                        <Link href="/support" className="text-teal-600 font-medium hover:underline">
                            Contact Support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
