'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubmitted(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[380px] bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-slate-100 relative z-10"
            >
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>

                {!submitted ? (
                    <>
                        <div className="mb-8">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Mail className="w-7 h-7" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
                            <p className="text-slate-500">No worries, we'll send you reset instructions.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                                    placeholder="Enter your registered email"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? "Sending..." : "Reset Password"}
                            </button>
                        </form>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                    >
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Check your email</h2>
                        <p className="text-slate-500 mb-8">
                            We've sent password reset instructions to <br />
                            <span className="font-semibold text-slate-900">{email}</span>
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Didn't receive the email? Click to retry
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
