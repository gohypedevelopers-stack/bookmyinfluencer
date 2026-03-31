"use client"

import Image from "next/image"
import { Shield, Lock, MessageSquare } from "lucide-react"
import { Container } from "@/components/container"
import { motion } from "framer-motion"

export function FeaturesSection() {
    return (
        <section className="w-full py-24 md:py-32 bg-slate-50 relative overflow-hidden transition-colors duration-500">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]" />
            </div>

            <Container className="text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-32"
                >
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-12">Trusted by Industry Leaders</p>


                    {/* Infinite Animated Carousel Container - Two Rows */}
                    <div className="relative flex flex-col gap-12 overflow-hidden w-full group py-16 bg-sky-600 rounded-[3rem] border border-sky-500 shadow-2xl shadow-sky-300/50">
                        {/* Gradient masks */}
                        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-sky-600 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-sky-600 to-transparent z-10 pointer-events-none" />

                        {/* Top Row - Scrolls Left */}
                        <motion.div
                            className="flex items-center gap-12 md:gap-40 whitespace-nowrap animate-infinite-scroll hover:[animation-play-state:paused]"
                        >
                            {[1, 2, 3].map((setIndex) => (
                                <div key={`row1-${setIndex}`} className="flex items-center gap-12 md:gap-40">
                                    {[
                                        { name: "Fabhotels", src: "/images/logos/fabhotels.avif", width: 220, height: 100 },
                                        { name: "GDK", src: "/images/logos/gdk.avif", width: 180, height: 100 },
                                        { name: "Homify", src: "/images/logos/homify.avif", width: 180, height: 100 },
                                        { name: "IndianOil", src: "/images/logos/indianoil.avif", width: 180, height: 100 },
                                        { name: "Lazada", src: "/images/logos/lazada.avif", width: 200, height: 100 },
                                        { name: "Yatra", src: "/images/logos/yatra.png", width: 180, height: 100 },
                                    ].map((brand, i) => (
                                        <div
                                            key={`${setIndex}-r1-${brand.name}-${i}`}
                                            className="opacity-90 hover:opacity-100 transition-all duration-500 cursor-pointer hover:scale-110 px-4 group/logo"
                                        >
                                            <Image
                                                src={brand.src}
                                                alt={brand.name}
                                                width={brand.width * 1.5}
                                                height={brand.height * 1.5}
                                                className="h-16 md:h-24 lg:h-32 w-auto object-contain transition-all duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </motion.div>

                        {/* Bottom Row - Scrolls Right (Reverse) */}
                        <motion.div
                            className="flex items-center gap-12 md:gap-40 whitespace-nowrap animate-infinite-scroll-reverse hover:[animation-play-state:paused]"
                        >
                            {[1, 2, 3].map((setIndex) => (
                                <div key={`row2-${setIndex}`} className="flex items-center gap-12 md:gap-40">
                                    {[
                                        { name: "Mash", src: "/images/logos/mash.avif", width: 160, height: 60 },
                                        { name: "Neo", src: "/images/logos/neo.avif", width: 180, height: 60 },
                                        { name: "Pai", src: "/images/logos/pai.avif", width: 140, height: 60 },
                                        { name: "Rapid Repair", src: "/images/logos/rapidrepair.avif", width: 220, height: 60 },
                                        { name: "Taneja Group", src: "/images/logos/taneja group.avif", width: 280, height: 60 },
                                    ].map((brand, i) => (
                                        <div
                                            key={`${setIndex}-r2-${brand.name}-${i}`}
                                            className="opacity-90 hover:opacity-100 transition-all duration-500 cursor-pointer hover:scale-110 px-4"
                                        >
                                            <Image
                                                src={brand.src}
                                                alt={brand.name}
                                                width={brand.width * 1.5}
                                                height={brand.height * 1.5}
                                                className="h-14 md:h-20 lg:h-24 w-auto object-contain transition-all duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto mb-20"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">Standardizing the <span className="text-indigo-600">Industry</span></h2>
                    <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-medium">We build the infrastructure for secure and professional creative collaborations.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 md:gap-10">
                    {[
                        {
                            icon: Shield,
                            title: "Verified Creators",
                            desc: "Every influencer undergoes strict KYC identity checks and audience quality auditing to ensure real impact.",
                            gradient: "from-blue-600 to-indigo-600",
                            shadow: "shadow-blue-200",
                            iconBg: "bg-blue-50"
                        },
                        {
                            icon: Lock,
                            title: "Secure Escrow",
                            desc: "Safe-locked payments held in escrow until deliverables are approved. Your investment is always protected.",
                            gradient: "from-indigo-600 to-purple-600",
                            shadow: "shadow-indigo-200",
                            iconBg: "bg-indigo-50"
                        },
                        {
                            icon: MessageSquare,
                            title: "Manager-Led Channels",
                            desc: "Two protected channels keep brand and creator communication separated while project managers coordinate end-to-end delivery.",
                            gradient: "from-pink-600 to-rose-600",
                            shadow: "shadow-pink-200",
                            iconBg: "bg-pink-50"
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.7, ease: "easeOut" }}
                            className="group relative"
                        >
                            {/* Card Content with Glassmorphism */}
                            <div className="relative h-full bg-white p-10 rounded-[2.5rem] border border-slate-100 group-hover:border-slate-200 transition-all duration-500 group-hover:-translate-y-3 flex flex-col items-start text-left overflow-hidden shadow-xl shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-slate-300/50">

                                {/* Glow Effect on Hover */}
                                <div className={`absolute -inset-2 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] blur-2xl transition-opacity duration-700`} />

                                {/* Icon Container */}
                                <div className={`relative mb-6 sm:mb-10 p-4 sm:p-5 rounded-xl sm:rounded-2xl ${feature.iconBg} border border-white shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className={`w-8 h-8 text-transparent bg-clip-text bg-gradient-to-br ${feature.gradient}`} style={{ color: 'unset', fill: 'none', stroke: 'url(#feature-grad-' + i + ')' }} />
                                    <svg width="0" height="0">
                                        <linearGradient id={`feature-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" className="feature-stop-1" style={{ stopColor: feature.gradient.split(' ')[0].replace('from-', '') === 'blue-600' ? '#2563eb' : feature.gradient.split(' ')[0].replace('from-', '') === 'indigo-600' ? '#4f46e5' : '#db2777' }} />
                                            <stop offset="100%" className="feature-stop-2" style={{ stopColor: feature.gradient.split(' ')[1].replace('to-', '') === 'indigo-600' ? '#4f46e5' : feature.gradient.split(' ')[1].replace('to-', '') === 'purple-600' ? '#9333ea' : '#e11d48' }} />
                                        </linearGradient>
                                    </svg>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-5 group-hover:text-indigo-600 transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                                    {feature.desc}
                                </p>

                                {/* Bottom Indicator */}
                                <div className={`mt-auto pt-10 w-full`}>
                                    <div className={`h-1.5 w-12 bg-gradient-to-r ${feature.gradient} rounded-full transform origin-left scale-x-50 group-hover:scale-x-100 transition-transform duration-500 shadow-sm`} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
