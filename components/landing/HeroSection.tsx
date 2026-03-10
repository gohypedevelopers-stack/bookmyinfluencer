"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BadgeCheck, Banknote, ChevronLeft, ChevronRight, TrendingUp, Users } from "lucide-react"
import { Container } from "@/components/container"
import { motion, AnimatePresence } from "framer-motion"

const HERO_VIDEOS = [
    "/videos/hero-video-1.mp4",
    "/videos/hero-video-2.mp4",
    "/videos/hero-video.mp4"
]

export function HeroSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_VIDEOS.length)
        }, 8000)
        return () => clearInterval(timer)
    }, [isHovered])

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % HERO_VIDEOS.length)
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + HERO_VIDEOS.length) % HERO_VIDEOS.length)

    return (
        <section className="w-full bg-transparent py-20 md:py-32 lg:py-40 relative overflow-hidden transition-colors duration-500">
            {/* Background Mesh Gradients - Softer for Light Mode */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[160px]" />
                <div className="absolute top-[20%] -right-[15%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[140px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[160px]" />
            </div>

            <Container className="relative">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-28 relative z-10">

                    {/* Text Content */}
                    <div className="flex-1 space-y-10 text-center sm:text-left lg:text-left lg:max-w-[620px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 backdrop-blur-md mb-2"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-xs font-black tracking-widest uppercase text-indigo-600">Premium Influencer Network</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]"
                        >
                            The Most Trusted <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 drop-shadow-sm">Bridge Between</span> <br />
                            Brands & Creators
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
                        >
                            Scale your impact with verified creators, secure escrow payments, and seamless collaborations. Join 100,000+ experts shaping the digital frontier.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4"
                        >
                            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-16 text-lg font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:scale-[1.05] active:scale-95 border-none uppercase tracking-widest" asChild>
                                <Link href="/brand/register">
                                    Hire an Influencer
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50 px-10 h-16 text-lg font-black rounded-2xl hover:scale-[1.05] active:scale-95 transition-all border-2 uppercase tracking-widest" asChild>
                                <Link href="/register">
                                    Join as a Creator
                                </Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="flex items-center justify-center lg:justify-start gap-4"
                        >
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-lg">
                                        <Image src={`/images/dummy/${i === 1 ? 'lifestyle' : i === 2 ? 'fashion' : i === 3 ? 'tech' : 'sarah'}.png`} alt="User" width={48} height={48} className="object-cover" />
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

                    {/* Video Slider & Floating Metrics */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 relative w-full max-w-xl lg:max-w-[640px]"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* 3D Looking Frame */}
                        <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-200 backdrop-blur-[100px] group bg-white/40 p-2 z-10 transition-transform duration-700 hover:rotate-1">
                            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-100">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, scale: 1.15 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1 }}
                                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-black/10 pointer-events-none" />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Slider Controls */}
                                <div className="absolute bottom-8 right-10 flex items-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                    <button
                                        onClick={prevSlide}
                                        className="p-4 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 shadow-xl text-slate-900 transition-all transform hover:scale-110 active:scale-90"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="p-4 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 shadow-xl text-slate-900 transition-all transform hover:scale-110 active:scale-90"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Progress Indicators */}
                                <div className="absolute bottom-12 left-10 flex items-center gap-3 z-20">
                                    {HERO_VIDEOS.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentIndex(i)}
                                            className={`h-2 rounded-full transition-all duration-700 ${i === currentIndex ? "bg-indigo-600 w-16 shadow-[0_0_25px_rgba(79,70,229,0.4)]" : "bg-black/10 w-4 hover:bg-black/20"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating Metric Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="hidden md:flex absolute -right-8 top-[10%] z-20 bg-white/90 border border-slate-200 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl items-center gap-4 ring-1 ring-black/5"
                        >
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-slate-900 font-black text-xl leading-none mb-1">8.4%</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg Engagement</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="hidden md:flex absolute -left-12 bottom-[15%] z-20 bg-white/90 border border-slate-200 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl items-center gap-4 ring-1 ring-black/5"
                        >
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-slate-900 font-black text-xl leading-none mb-1">1.2M+</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Followers</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 1 }}
                            className="hidden md:flex absolute right-12 -bottom-8 z-20 bg-white/90 border border-slate-200 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl items-center gap-4 ring-1 ring-black/5"
                        >
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-slate-900 font-black text-xl leading-none mb-1">500+</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Brand Deals</div>
                            </div>
                        </motion.div>

                        {/* Outer Glows - Softer for Light Mode */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-indigo-600/5 rounded-full blur-[100px] opacity-40 animate-pulse pointer-events-none" />
                        <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-[80px] blur-3xl opacity-20 pointer-events-none" />
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}
