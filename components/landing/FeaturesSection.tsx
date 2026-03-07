"use client"

import Image from "next/image"
import { Shield, Lock, MessageSquare } from "lucide-react"
import { Container } from "@/components/container"
import { motion } from "framer-motion"

export function FeaturesSection() {
    return (
        <section className="w-full py-24 md:py-32 bg-[#fafafa] relative overflow-hidden">
            {/* Subtle background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-40">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]" />
            </div>

            <Container className="text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-24"
                >
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-12">As Featured In</p>

                    {/* Infinite Animated Carousel Container - Two Rows */}
                    <div className="relative flex flex-col gap-12 overflow-hidden w-full group py-12 bg-transparent">
                        {/* Gradient masks for smooth fading at the edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none" />

                        {/* Top Row - Scrolls Left */}
                        <motion.div
                            className="flex items-center gap-20 md:gap-32 whitespace-nowrap animate-infinite-scroll hover:[animation-play-state:paused]"
                        >
                            {[1, 2, 3].map((setIndex) => (
                                <div key={`row1-${setIndex}`} className="flex items-center gap-20 md:gap-32">
                                    {[
                                        { name: "Fabhotels", src: "/images/logos/fabhotels.avif", width: 220, height: 60 },
                                        { name: "GDK", src: "/images/logos/gdk.avif", width: 180, height: 60 },
                                        { name: "Homify", src: "/images/logos/homify.avif", width: 180, height: 60 },
                                        { name: "IndianOil", src: "/images/logos/indianoil.avif", width: 180, height: 60 },
                                        { name: "Lazada", src: "/images/logos/lazada.avif", width: 200, height: 60 },
                                        { name: "Yatra", src: "/images/logos/yatra.png", width: 180, height: 60 },
                                    ].map((brand, i) => (
                                        <div
                                            key={`${setIndex}-r1-${brand.name}-${i}`}
                                            className="opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110 px-8 grayscale-transition"
                                        >
                                            <Image
                                                src={brand.src}
                                                alt={brand.name}
                                                width={brand.width}
                                                height={brand.height}
                                                className="h-14 md:h-16 w-auto object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </motion.div>

                        {/* Bottom Row - Scrolls Right (Reverse) */}
                        <motion.div
                            className="flex items-center gap-20 md:gap-32 whitespace-nowrap animate-infinite-scroll-reverse hover:[animation-play-state:paused]"
                        >
                            {[1, 2, 3].map((setIndex) => (
                                <div key={`row2-${setIndex}`} className="flex items-center gap-20 md:gap-32">
                                    {[
                                        { name: "Mash", src: "/images/logos/mash.avif", width: 160, height: 60 },
                                        { name: "Neo", src: "/images/logos/neo.avif", width: 180, height: 60 },
                                        { name: "Pai", src: "/images/logos/pai.avif", width: 140, height: 60 },
                                        { name: "Rapid Repair", src: "/images/logos/rapidrepair.avif", width: 220, height: 60 },
                                        { name: "Taneja Group", src: "/images/logos/taneja group.avif", width: 280, height: 60 },
                                    ].map((brand, i) => (
                                        <div
                                            key={`${setIndex}-r2-${brand.name}-${i}`}
                                            className="opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110 px-8 grayscale-transition"
                                        >
                                            <Image
                                                src={brand.src}
                                                alt={brand.name}
                                                width={brand.width}
                                                height={brand.height}
                                                className="h-16 md:h-20 w-auto object-contain"
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
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Why Leaders Choose Us</h2>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium">We provide the safety infrastructure for professional partnerships.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 md:gap-10">
                    {[
                        {
                            icon: Shield,
                            title: "Verified Creators",
                            desc: "Every influencer undergoes strict KYC identity checks and audience quality auditing.",
                            gradient: "from-blue-500 to-cyan-400",
                            shadow: "shadow-blue-200",
                            bgLight: "bg-blue-50"
                        },
                        {
                            icon: Lock,
                            title: "Secure Escrow",
                            desc: "Funds are held safely in escrow until deliverables are approved by the brand.",
                            gradient: "from-purple-500 to-indigo-400",
                            shadow: "shadow-purple-200",
                            bgLight: "bg-purple-50"
                        },
                        {
                            icon: MessageSquare,
                            title: "Trio-Chat System",
                            desc: "Direct negotiation channels with admin moderation available for dispute resolution.",
                            gradient: "from-pink-500 to-rose-400",
                            shadow: "shadow-pink-200",
                            bgLight: "bg-pink-50"
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
                            {/* Animated Background Glow */}
                            <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition duration-500`} />

                            {/* Card Content */}
                            <div className="relative h-full bg-white/[0.8] backdrop-blur-xl p-10 rounded-3xl border border-white shadow-xl shadow-slate-200/50 group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 flex flex-col items-start text-left overflow-hidden">
                                {/* Decorative Pattern */}
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full" />

                                {/* Icon Container */}
                                <div className={`relative mb-8 p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.shadow} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                    {/* Inner Glow */}
                                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-slate-500 leading-relaxed text-lg">
                                    {feature.desc}
                                </p>

                                {/* Bottom Indicator */}
                                <div className={`mt-8 w-12 h-1 bg-gradient-to-r ${feature.gradient} rounded-full transform origin-left scale-x-50 group-hover:scale-x-100 transition-transform duration-500`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
