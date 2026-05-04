"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, BadgeCheck, Banknote, TrendingUp, Users, Zap } from "lucide-react"
import { Container } from "@/components/container"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

const HERO_VIDEOS = [
    "/videos/hero-video-1.mp4",
    "/videos/hero-video-2.mp4",
    "/videos/hero-video.mp4"
]

export function HeroSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    const y2 = useTransform(scrollY, [0, 500], [0, -50]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
        }, 5000); // Switch video every 5 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="w-full bg-[#fdf8f7] pt-8 md:pt-16 lg:pt-20 pb-12 md:pb-20 lg:pb-28 relative overflow-hidden">
            {/* Background Aesthetic Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div style={{ y: y1 }} className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-pink-100/30 rounded-full blur-[120px]" />
                <motion.div style={{ y: y2 }} className="absolute top-[40%] -left-[10%] w-[30%] h-[30%] bg-orange-50/20 rounded-full blur-[100px]" />
                <motion.div style={{ y: y1 }} className="absolute bottom-[10%] right-[20%] w-[25%] h-[25%] bg-indigo-50/20 rounded-full blur-[80px]" />
            </div>

            <Container className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column: Content */}
                    <div className="flex flex-col space-y-8 md:space-y-10 relative">
                        {/* Decorative Blur for Left Side */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-200/20 rounded-full blur-[100px] -z-10" />
                        
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border border-indigo-100/50 backdrop-blur-md shadow-sm">
                                <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                                <span className="text-[9px] font-black tracking-[0.15em] uppercase text-indigo-600/80">Premium Influencer Network</span>
                            </div>

                            <h1 className="text-4xl sm:text-6xl lg:text-[4rem] font-black text-slate-900 tracking-tight leading-[1.05] text-left">
                                The Most <span className="text-indigo-600">Trusted</span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 drop-shadow-sm">Bridge Between</span> <br />
                                <span className="text-slate-800">Brands & Creators</span>
                            </h1>
                            
                            <p className="text-base text-slate-600/80 max-w-[480px] leading-relaxed font-semibold text-left">
                                Scale your impact with verified creators, secure escrow payments, and seamless collaborations. Join 100,000+ experts shaping the digital frontier.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-wrap items-center gap-5"
                        >
                            <Button size="lg" className="rounded-2xl bg-gradient-to-br from-[#ff4d8d] to-[#f43f5e] hover:from-[#f43f5e] hover:to-[#e11d48] text-white px-10 h-16 text-sm font-black shadow-xl shadow-rose-200/50 transition-all hover:-translate-y-1 hover:scale-[1.02] border-none uppercase tracking-widest" asChild>
                                <Link href="/brand/register">
                                    Hire Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="ghost" className="rounded-2xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 px-10 h-16 text-sm font-black transition-all uppercase tracking-widest border border-slate-200/60" asChild>
                                <Link href="/register">
                                    Join as Creator
                                </Link>
                            </Button>
                        </motion.div>

                        {/* Metric Blocks - Enhanced Premium Style */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-wrap gap-5 pt-8"
                        >
                            {[
                                { label: "Followers", value: "500K+", icon: Users, color: "from-blue-600 to-cyan-500", lightColor: "bg-blue-50/50", glow: "group-hover:shadow-blue-200/50" },
                                { label: "Engagement", value: "8.4%", icon: TrendingUp, color: "from-violet-600 to-purple-500", lightColor: "bg-violet-50/50", glow: "group-hover:shadow-violet-200/50" },
                                { label: "Brand Deals", value: "500+", icon: Banknote, color: "from-emerald-600 to-teal-500", lightColor: "bg-emerald-50/50", glow: "group-hover:shadow-emerald-200/50" }
                            ].map((stat, i) => (
                                <div key={i} className="group relative flex-1 min-w-[140px]">
                                    {/* Animated Shimmer Border */}
                                    <div className={`absolute -inset-[1px] bg-gradient-to-r ${stat.color} rounded-[2rem] opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-[1px]`} />
                                    
                                    <div className={`relative h-full px-7 py-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl ${stat.glow} flex flex-col items-start`}>
                                        
                                        {/* Icon Container with Mesh Background */}
                                        <div className={`relative w-12 h-12 rounded-2xl ${stat.lightColor} flex items-center justify-center mb-4 overflow-hidden`}>
                                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                                            <stat.icon className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`} style={{ color: 'unset', stroke: 'url(#metric-grad-' + i + ')' }} />
                                            
                                            {/* SVG Gradient Definition for Icon */}
                                            <svg width="0" height="0" className="absolute">
                                                <linearGradient id={`metric-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" style={{ stopColor: stat.color.split(' ')[0].replace('from-', '') === 'blue-600' ? '#2563eb' : stat.color.split(' ')[0].replace('from-', '') === 'violet-600' ? '#7c3aed' : '#059669' }} />
                                                    <stop offset="100%" style={{ stopColor: stat.color.split(' ')[1].replace('to-', '') === 'cyan-500' ? '#06b6d4' : stat.color.split(' ')[1].replace('to-', '') === 'purple-500' ? '#a855f7' : '#14b8a6' }} />
                                                </linearGradient>
                                            </svg>
                                        </div>

                                        <div className="space-y-0.5">
                                            <span className="text-2xl font-black text-slate-900 leading-none tracking-tight block">
                                                {stat.value}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-indigo-600 transition-colors duration-300">
                                                {stat.label}
                                            </span>
                                        </div>

                                        {/* Bottom Accent */}
                                        <div className={`absolute bottom-4 right-6 w-8 h-1 bg-gradient-to-r ${stat.color} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0`} />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right Column: Media Card with Auto-scrolling Video Carousel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Main Card */}
                        <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] border-[12px] border-white bg-white group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ scale: 1.15, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <video
                                        src={HERO_VIDEOS[currentIndex]}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="object-cover w-full h-full"
                                    />
                                </motion.div>
                            </AnimatePresence>
                            
                            {/* Floating Overlay Badge (Inside Card) */}
                            <div className="absolute top-6 left-6 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-lg flex items-center gap-2 z-20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Verified Expert</span>
                            </div>

                            {/* Bottom Overlay Info */}
                            <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-xl flex items-center gap-3 max-w-[200px] z-20">
                                <div className="p-2 rounded-xl bg-indigo-50">
                                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 leading-none">High Growth</span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Top 1% Creator</span>
                                </div>
                            </div>

                            {/* Progress Indicators */}
                            <div className="absolute bottom-6 left-6 flex gap-2 z-20">
                                {HERO_VIDEOS.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40"}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Outer Decorative Elements */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-pink-100/50 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-100/50 rounded-full blur-3xl -z-10" />
                    </motion.div>

                </div>
            </Container>
        </section>
    )
}
