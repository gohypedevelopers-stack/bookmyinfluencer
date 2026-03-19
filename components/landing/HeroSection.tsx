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
                    <div className="order-2 w-full max-w-[1140px] pt-4 lg:pt-8">

                        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="lg:col-span-7 space-y-6 md:space-y-8"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/70 border border-indigo-100/60 shadow-sm backdrop-blur-md"
                                >
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                                    <span className="text-[10px] sm:text-[11px] font-black tracking-[0.15em] uppercase text-indigo-600">Premium Influencer Network</span>
                                </motion.div>

                                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] sm:leading-[1.02] text-left">
                                    The Most Trusted <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 drop-shadow-sm">Bridge Between</span> <br />
                                    Brands & Creators
                                </h1>
                                <p className="text-base sm:text-lg text-slate-600 max-w-[540px] leading-relaxed font-medium text-left">
                                    Scale your impact with verified creators, secure escrow payments, and seamless collaborations. Join 100,000+ experts shaping the digital frontier.
                                </p>
                            </motion.div>

                            <div className="lg:col-span-5">
                                <div className="h-full flex flex-col justify-between gap-6 rounded-[2rem] border border-slate-100 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-6 sm:p-8">

                                <div className="flex flex-wrap justify-start gap-2.5">
                                    <span className="px-3.5 py-1.5 rounded-full bg-blue-50/80 text-blue-600 text-[10px] font-bold tracking-wide">Verified Creators</span>
                                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-50/80 text-emerald-600 text-[10px] font-bold tracking-wide">Escrow Secure</span>
                                    <span className="px-3.5 py-1.5 rounded-full bg-sky-50/80 text-sky-600 text-[10px] font-bold tracking-wide">Fast Matching</span>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <Button size="lg" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-2 h-11 sm:h-12 text-[10px] sm:text-[11px] font-black rounded-xl shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] transition-all hover:-translate-y-0.5 border-none uppercase tracking-wider" asChild>
                                        <Link href="/brand/register">
                                            Hire an Influencer
                                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="w-full border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 px-2 h-11 sm:h-12 text-[10px] sm:text-[11px] font-black rounded-xl hover:-translate-y-0.5 transition-all outline-none uppercase tracking-wider shadow-sm" asChild>
                                        <Link href="/register">
                                            Join as a Creator
                                        </Link>
                                    </Button>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="flex items-center justify-start gap-4 pt-1"
                                >
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm relative z-10">
                                                <Image src={`/images/${i === 1 ? 'elena' : i === 2 ? 'julian' : i === 3 ? 'marco' : 'sarah'}.png`} alt="User" width={40} height={40} className="object-cover" />
                                            </div>
                                        ))}
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[9px] font-black text-white shadow-sm relative z-20">
                                            5K+
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200" />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
                                            <BadgeCheck className="w-4 h-4 text-violet-600" />
                                            100% Certified
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Verified Profiles</span>
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
                        className="order-1 relative w-full mb-8 lg:mb-16 mt-4 lg:mt-0"
                    >
                        {/* 3D Looking Frame */}
                        <div className="relative aspect-[16/10] sm:aspect-[16/8] lg:aspect-[21/9] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 bg-white/60 p-2 sm:p-2.5 z-10 w-full max-w-[1240px] mx-auto">
                            <div className="relative w-full h-full rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-inner block">
                                <video
                                    src={HERO_VIDEO_URL}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="object-cover w-full h-full transform scale-[1.01]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </div>

                        {/* Floating Metric Cards */}
                        <div className="mt-6 lg:mt-0 grid grid-cols-3 gap-3 lg:block lg:gap-0">

                            {/* Top-right: 8.4% Engagement */}
                            <motion.div
                                initial={{ opacity: 0, y: -16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="relative lg:absolute lg:right-4 lg:top-4 z-20 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-white/60 ring-1 ring-black/[0.04] hover:-translate-y-0.5 transition-transform"
                            >
                                <div className="w-7 h-7 rounded-[8px] bg-[#EEF0FF] flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-3.5 h-3.5 text-[#4F46E5] stroke-[2.5]" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-black text-slate-900 leading-none">8.4%</div>
                                    <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5 whitespace-nowrap">Avg Engagement</div>
                                </div>
                            </motion.div>

                            {/* Bottom-left: 1.2M+ Followers */}
                            <motion.div
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1, duration: 0.8 }}
                                className="relative lg:absolute lg:left-4 lg:bottom-4 z-20 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-white/60 ring-1 ring-black/[0.04] hover:-translate-y-0.5 transition-transform"
                            >
                                <div className="w-7 h-7 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                                    <Users className="w-3.5 h-3.5 text-[#3B82F6] stroke-[2.5]" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-black text-slate-900 leading-none">1.2M+</div>
                                    <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5 whitespace-nowrap">Total Followers</div>
                                </div>
                            </motion.div>

                            {/* Bottom-right: 500+ Brand Deals */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2, duration: 0.8 }}
                                className="relative lg:absolute lg:right-4 lg:bottom-4 z-20 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-white/60 ring-1 ring-black/[0.04] hover:-translate-y-0.5 transition-transform"
                            >
                                <div className="w-7 h-7 rounded-[8px] bg-[#ECFDF5] flex items-center justify-center shrink-0">
                                    <Banknote className="w-3.5 h-3.5 text-[#10B981] stroke-[2.5]" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-black text-slate-900 leading-none">500+</div>
                                    <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5 whitespace-nowrap">Active Brand Deals</div>
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
