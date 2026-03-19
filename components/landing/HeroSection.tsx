"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BadgeCheck, Banknote, TrendingUp, Users } from "lucide-react"
import { Container } from "@/components/container"
import { motion } from "framer-motion"

const HERO_VIDEO_URL = "/videos/hero-video-1.mp4"

export function HeroSection() {
    return (
        <section className="w-full bg-transparent pt-4 md:pt-6 lg:pt-8 pb-8 md:pb-12 lg:pb-14 relative overflow-hidden transition-colors duration-500">
            {/* Background Mesh Gradients - Softer for Light Mode */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[160px]" />
                <div className="absolute top-[20%] -right-[15%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[140px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[160px]" />
            </div>

            <Container className="relative">
                <div className="flex flex-col items-center gap-6 md:gap-8 lg:gap-10 relative z-10">

                    {/* Text Content */}
                    <div className="order-2 w-full max-w-[1140px] space-y-5 md:space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/70 shadow-sm backdrop-blur-md mx-auto lg:mx-0"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-xs font-black tracking-widest uppercase text-indigo-600">Premium Influencer Network</span>
                        </motion.div>

                        <div className="grid lg:grid-cols-12 gap-5 md:gap-6 lg:gap-10 items-stretch">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="lg:col-span-7 lg:pt-2 space-y-4 md:space-y-5"
                            >
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] sm:leading-[1.08] text-center lg:text-left">
                                    The Most Trusted <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 drop-shadow-sm">Bridge Between</span> <br />
                                    Brands & Creators
                                </h1>
                                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium text-center lg:text-left">
                                    Scale your impact with verified creators, secure escrow payments, and seamless collaborations. Join 100,000+ experts shaping the digital frontier.
                                </p>
                            </motion.div>

                            <div className="lg:col-span-5">
                                <div className="h-full flex flex-col justify-between gap-4 rounded-3xl border border-white/70 bg-white/65 backdrop-blur-xl shadow-[0_24px_60px_-28px_rgba(79,70,229,0.35)] p-5 sm:p-6 md:p-7">

                                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                    <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide border border-indigo-100">Verified Creators</span>
                                    <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide border border-emerald-100">Escrow Secure</span>
                                    <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide border border-blue-100">Fast Matching</span>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3"
                                >
                                    <Button size="lg" className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-700 hover:via-blue-700 hover:to-violet-700 text-white px-4 sm:px-5 h-11 sm:h-12 text-xs sm:text-sm font-black rounded-xl shadow-[0_18px_30px_-12px_rgba(79,70,229,0.55)] transition-all hover:scale-[1.02] active:scale-95 border-none uppercase tracking-wide" asChild>
                                        <Link href="/brand/register">
                                            Hire an Influencer
                                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="w-full border-slate-300 bg-white/90 text-slate-900 hover:bg-white px-4 sm:px-5 h-11 sm:h-12 text-xs sm:text-sm font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all border-2 uppercase tracking-wide shadow-[0_10px_22px_-16px_rgba(15,23,42,0.5)]" asChild>
                                        <Link href="/register">
                                            Join as a Creator
                                        </Link>
                                    </Button>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="flex items-center justify-center lg:justify-start gap-3"
                                >
                                    <div className="flex -space-x-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-lg">
                                                <Image src={`/images/${i === 1 ? 'elena' : i === 2 ? 'julian' : i === 3 ? 'marco' : 'sarah'}.png`} alt="User" width={48} height={48} className="object-cover" />
                                            </div>
                                        ))}
                                        <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                                            5K+
                                        </div>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200" />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-widest">
                                            <BadgeCheck className="w-5 h-5 text-indigo-600" />
                                            100% Certified
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Verified Profiles</span>
                                    </div>
                                </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video Slider & Floating Metrics */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="order-1 relative w-full max-w-[980px]"
                    >
                        {/* 3D Looking Frame */}
                        <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/8] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-200/90 ring-1 ring-white/70 backdrop-blur-[100px] bg-white/40 p-2 z-10">
                            <div className="relative w-full h-full rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-slate-100">
                                <video
                                    src={HERO_VIDEO_URL}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-black/10 pointer-events-none" />
                            </div>
                        </div>

                        {/* Floating Metric Cards - Optimized for Mobile Grid */}
                        <div className="mt-6 lg:mt-0 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:block lg:gap-0">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8, duration: 1 }}
                                className="lg:absolute lg:-right-8 lg:top-[10%] z-20 bg-white/90 border border-slate-200 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl shadow-2xl flex items-center gap-4 ring-1 ring-black/5"
                            >
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-slate-900 font-black text-lg sm:text-xl leading-none mb-1">8.4%</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg Engagement</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1, duration: 1 }}
                                className="lg:absolute lg:-left-12 lg:bottom-[15%] z-20 bg-white/90 border border-slate-200 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl shadow-2xl flex items-center gap-4 ring-1 ring-black/5"
                            >
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-slate-900 font-black text-lg sm:text-xl leading-none mb-1">1.2M+</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Followers</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2, duration: 1 }}
                                className="lg:absolute lg:right-12 lg:-bottom-8 z-20 bg-white/90 border border-slate-200 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl shadow-2xl flex items-center gap-4 ring-1 ring-black/5"
                            >
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <Banknote className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-slate-900 font-black text-lg sm:text-xl leading-none mb-1">500+</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Brand Deals</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Outer Glows - Softer for Light Mode */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-indigo-600/5 rounded-full blur-[100px] opacity-40 animate-pulse pointer-events-none" />
                        <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-[80px] blur-3xl opacity-20 pointer-events-none" />
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}
