"use client"

import { useState } from "react"
import Link from "next/link"
import { Container } from "@/components/container"
import { motion } from "framer-motion"
import { ContactSalesModal } from "./ContactSalesModal"
import { ArrowRight, Star, Users, Zap, Globe } from "lucide-react"

export function CallToAction() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <section className="w-full py-12 md:py-16 bg-transparent relative overflow-hidden transition-colors duration-500">
            <Container>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="relative max-w-5xl mx-auto rounded-[3rem] overflow-hidden"
                >
                    {/* Deep layered gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-transparent to-purple-600/30" />

                    {/* Animated ambient orbs */}
                    <motion.div
                        className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-indigo-400/15 blur-[100px]"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-violet-500/20 blur-[100px]"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full bg-blue-500/10 blur-[120px]"
                        animate={{ scaleX: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    />

                    {/* Mesh grid overlay */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                            backgroundSize: "40px 40px"
                        }}
                    />

                    {/* Glass inner border */}
                    <div className="absolute inset-[1px] rounded-[calc(3rem-1px)] border border-white/10 pointer-events-none" />

                    {/* Top glow strip */}
                    <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 p-8 sm:p-10 lg:p-14 text-center text-white">

                        {/* Pulsing badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="flex justify-center mb-6"
                        >
                            <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-[0.18em] shadow-lg">
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]"
                                />
                                <span>Trusted by 25,000+ Brands</span>
                            </div>
                        </motion.div>

                        {/* Headline */}
                        <motion.h2
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] mb-5"
                        >
                            Ready to Scale Your
                            <br />
                            <span className="bg-gradient-to-r from-indigo-200 via-white to-violet-200 bg-clip-text text-transparent">
                                Global Reach?
                            </span>
                        </motion.h2>



                        {/* Inline stat pills */}
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.38, duration: 0.6 }}
                            className="flex flex-wrap justify-center gap-2.5 mb-8"
                        >
                            {[
                                { icon: Users, label: "850M+ Reach" },
                                { icon: Zap, label: "12K+ Campaigns" },
                                { icon: Globe, label: "6.2% Avg Eng." },
                            ].map(({ icon: Icon, label }, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.14] text-white/80 text-[11px] font-semibold backdrop-blur-sm">
                                    <Icon className="w-3 h-3 text-indigo-200" />
                                    {label}
                                </div>
                            ))}
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.45, duration: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            {/* Primary CTA */}
                            <motion.div 
                                whileHover={{ scale: 1.05, y: -2 }} 
                                whileTap={{ scale: 0.95 }}
                                className="relative group w-full sm:w-auto"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 rounded-[2rem] blur-md opacity-40 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                                <Link
                                    href="/login"
                                    className="relative flex items-center justify-center gap-2.5 h-12 sm:h-14 px-8 sm:px-10 rounded-[2rem] bg-white text-indigo-700 font-extrabold text-sm sm:text-base shadow-[0_8px_32px_rgba(0,0,0,0.18)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-indigo-50/80 to-transparent pointer-events-none" />
                                    <span className="relative z-10">Get Started Free</span>
                                    <ArrowRight className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                                </Link>
                            </motion.div>

                            {/* Secondary CTA */}
                            <motion.div 
                                whileHover={{ scale: 1.05, y: -2 }} 
                                whileTap={{ scale: 0.95 }}
                                className="relative group w-full sm:w-auto"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] blur-md opacity-0 group-hover:opacity-40 transition duration-500"></div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="relative flex items-center justify-center gap-2.5 w-full h-12 sm:h-14 px-8 sm:px-10 rounded-[2rem] bg-white/[0.05] backdrop-blur-xl border border-white/20 text-white font-bold text-sm sm:text-base hover:bg-white/[0.15] hover:border-white/40 transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    <div className="absolute inset-0 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 bg-gradient-to-t from-white/[0.15] to-transparent pointer-events-none" />
                                    <span className="relative z-10">Contact Sales</span>
                                    <motion.div
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <ArrowRight className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 text-indigo-200 opacity-70 group-hover:opacity-100 group-hover:text-white transition-all duration-300" />
                                    </motion.div>
                                </button>
                            </motion.div>
                        </motion.div>

                        {/* Fine print */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 text-white/35 text-[11px] font-medium"
                        >
                            No credit card required. Free plan available.
                        </motion.p>
                    </div>
                </motion.div>
            </Container>

            <ContactSalesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </section>
    )
}
