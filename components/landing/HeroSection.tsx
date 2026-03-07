"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BadgeCheck, Banknote, ChevronLeft, ChevronRight } from "lucide-react"
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
        <section className="w-full bg-white py-12 md:py-20 lg:py-32 overflow-hidden">
            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10">

                    {/* Text Content */}
                    <div className="flex-1 space-y-8 text-center sm:text-left lg:text-left lg:max-w-[520px]">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
                        >
                            The Most Trusted <br />
                            Bridge Between <br />
                            <span className="text-blue-600">Brands</span> & <span className="text-blue-600">Creators</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Secure connections, verified metrics, and escrow-protected payments for the modern creator economy. Stop guessing, start partnering.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <Button size="lg" className="bg-slate-800 hover:bg-slate-700 text-white px-8 h-12 text-base rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95" asChild>
                                <Link href="/discover">
                                    Hire an Influencer
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12 text-base rounded-full hover:scale-105 active:scale-95 transition-all" asChild>
                                <Link href="/login">
                                    Join as a Creator
                                </Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex items-center justify-center lg:justify-start gap-2 text-sm text-slate-500 font-medium"
                        >
                            <BadgeCheck className="w-5 h-5 text-green-500" />
                            <span>No credit card required for creators</span>
                        </motion.div>
                    </div>

                    {/* Video Slider */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="flex-1 relative w-full max-w-xl lg:max-w-[600px]"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-white/50 backdrop-blur-sm group bg-slate-900">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <video
                                        src={HERO_VIDEOS[currentIndex]}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="object-cover w-full h-full transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                </motion.div>
                            </AnimatePresence>

                            {/* Slider Controls */}
                            <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={prevSlide}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all transform hover:scale-110 active:scale-95"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all transform hover:scale-110 active:scale-95"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Progress Indicators */}
                            <div className="absolute bottom-6 left-8 flex items-center gap-2 z-20">
                                {HERO_VIDEOS.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-white/40 w-4 hover:bg-white/60"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50/50 rounded-full blur-3xl opacity-60" />
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}
