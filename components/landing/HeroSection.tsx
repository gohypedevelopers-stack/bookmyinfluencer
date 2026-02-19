"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BadgeCheck, Banknote } from "lucide-react"
import { Container } from "@/components/container"
import { motion } from "framer-motion"

export function HeroSection() {
    return (
        <section className="w-full bg-white py-20 lg:py-32 overflow-hidden">
            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

                    {/* Text Content */}
                    <div className="flex-1 space-y-8 text-center sm:text-left lg:text-left lg:max-w-[520px]">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
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

                    {/* Image Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="flex-1 relative w-full max-w-xl lg:max-w-[600px]"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            {/* Main Image */}
                            <div className="aspect-[4/3] bg-slate-100 relative">
                                <Image
                                    src="/images/hero.svg"
                                    alt="Content Creator working"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Floating Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="absolute -bottom-6 left-4 bg-white p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-4 border border-slate-100 sm:left-6"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Banknote className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Payouts</p>
                                <p className="text-xl font-bold text-slate-900">₹12.4M+</p>
                            </div>
                        </motion.div>

                        {/* Background Decoration */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50/50 rounded-full blur-3xl" />
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}
