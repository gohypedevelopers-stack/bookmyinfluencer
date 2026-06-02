"use client"

import Image from "next/image"
import { Shield, Lock, MessageSquare } from "lucide-react"
import { Container } from "@/components/container"
import { motion, useScroll, useTransform } from "framer-motion"

export function FeaturesSection() {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

    return (
        <section className="w-full pt-12 pb-20 md:pt-16 md:pb-28 bg-slate-50 relative overflow-hidden transition-colors duration-500">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <motion.div style={{ y: y1 }} className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
                <motion.div style={{ y: y2 }} className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]" />
            </div>

            <Container className="text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-32"
                >
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.3em] mb-12">Trusted by Industry Leaders</p>


                    {/* Infinite Animated Carousel Container - Two Rows */}
                    <div className="relative flex flex-col gap-12 overflow-hidden w-full group py-16 bg-gradient-to-br from-white via-indigo-50 to-sky-100 rounded-[3rem] border border-white shadow-2xl shadow-slate-200/80">
                        {/* Gradient masks */}
                        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-sky-100 to-transparent z-10 pointer-events-none" />

                        {/* Top Row - Scrolls Left */}
                        <motion.div
                            className="flex items-center gap-12 md:gap-40 whitespace-nowrap animate-infinite-scroll hover:[animation-play-state:paused]"
                        >
                            {[1, 2, 3].map((setIndex) => (
                                <div key={`row1-${setIndex}`} className="flex items-center gap-12 md:gap-40">
                                    {[
                                        { name: "Fabhotels", src: "/images/logos/fabhotels.avif", width: 220, height: 100 },
                                        { name: "GDK", src: "/images/logos/gdk.avif", width: 180, height: 100, filter: "brightness-0 scale-125" },
                                        { name: "Homify", src: "/images/logos/homify.avif", width: 180, height: 100, filter: "brightness-0 scale-125" },
                                        { name: "IndianOil", src: "/images/logos/indianoil.avif", width: 180, height: 100, filter: "scale-75" },
                                        { name: "Lazada", src: "/images/logos/lazada.avif", width: 200, height: 100, filter: "brightness-0" },
                                        { name: "Yatra", src: "/images/logos/yatra.png", width: 180, height: 100 },
                                    ].map((brand, i) => (
                                        <div
                                            key={`${setIndex}-r1-${brand.name}-${i}`}
                                            className="opacity-90 hover:opacity-100 transition-all duration-500 cursor-pointer hover:scale-110 px-4 group/logo flex items-center justify-center w-32 md:w-48 lg:w-64 h-24 md:h-32 lg:h-40"
                                        >
                                            <Image
                                                src={brand.src}
                                                alt={brand.name}
                                                width={brand.width * 2}
                                                height={brand.height * 2}
                                                className={`w-full h-full object-contain contrast-110 drop-shadow-[0_3px_10px_rgba(15,23,42,0.24)] transition-all duration-300 ${brand.filter ?? ""}`}
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
                                        { name: "Mash", src: "/images/logos/mash.avif", width: 160, height: 60, filter: "scale-125" },
                                        { name: "Neo", src: "/images/logos/neo.avif", width: 180, height: 60, filter: "scale-125" },
                                        { name: "Pai", src: "/images/logos/pai.avif", width: 140, height: 60, filter: "brightness-0 scale-110" },
                                        { name: "Rapid Repair", src: "/images/logos/rapidrepair.avif", width: 220, height: 60, filter: "brightness-0 scale-125" },
                                        { name: "Taneja Group", src: "/images/logos/taneja group.avif", width: 280, height: 60 },
                                    ].map((brand, i) => (
                                        <div
                                            key={`${setIndex}-r2-${brand.name}-${i}`}
                                            className="opacity-90 hover:opacity-100 transition-all duration-500 cursor-pointer hover:scale-110 px-4 flex items-center justify-center w-32 md:w-48 lg:w-64 h-24 md:h-32 lg:h-40"
                                        >
                                            <Image
                                                src={brand.src}
                                                alt={brand.name}
                                                width={brand.width * 2}
                                                height={brand.height * 2}
                                                className={`w-full h-full object-contain contrast-110 drop-shadow-[0_3px_10px_rgba(15,23,42,0.24)] transition-all duration-300 ${brand.filter ?? ""}`}
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
                    className="max-w-3xl mx-auto mt-50 mb-24"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">Standardizing the <span className="text-indigo-600">Industry</span></h2>
                    <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-medium">We build the infrastructure for secure and professional creative collaborations.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-5 md:gap-6">
                    {[
                        {
                            icon: Shield,
                            title: "Verified Creators",
                            tag: "KYC Audited",
                            desc: "Every influencer undergoes strict identity checks and audience quality auditing to ensure real impact.",
                            gradient: "from-blue-500 to-indigo-600",
                            tagColor: "bg-blue-50 text-blue-600 border-blue-100",
                            stopA: "#3b82f6", stopB: "#4f46e5",
                            glowColor: "group-hover:shadow-blue-100/80",
                        },
                        {
                            icon: Lock,
                            title: "Secure Escrow",
                            tag: "Zero Risk",
                            desc: "Payments held in escrow until deliverables are approved. Your investment is always protected.",
                            gradient: "from-violet-500 to-purple-600",
                            tagColor: "bg-violet-50 text-violet-600 border-violet-100",
                            stopA: "#8b5cf6", stopB: "#9333ea",
                            glowColor: "group-hover:shadow-violet-100/80",
                        },
                        {
                            icon: MessageSquare,
                            title: "Manager-Led Channels",
                            tag: "End-to-End",
                            desc: "Two protected channels keep brands & creators separated while project managers coordinate delivery.",
                            gradient: "from-rose-500 to-pink-600",
                            tagColor: "bg-rose-50 text-rose-600 border-rose-100",
                            stopA: "#f43f5e", stopB: "#db2777",
                            glowColor: "group-hover:shadow-rose-100/80",
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
                            className="group relative"
                        >
                            {/* Subtle gradient border glow on hover */}
                            <div className={`absolute -inset-[1.5px] rounded-[1.6rem] bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-[2px]`} />

                            <div className={`relative h-full bg-white/90 backdrop-blur-sm rounded-[1.5rem] border border-slate-100 group-hover:border-transparent transition-all duration-500 group-hover:-translate-y-2 flex flex-col items-start text-left overflow-hidden shadow-lg ${feature.glowColor} group-hover:shadow-xl`}>

                                {/* Top gradient accent strip */}
                                <div className={`w-full h-1 bg-gradient-to-r ${feature.gradient} rounded-t-[1.5rem]`} />

                                {/* Noise mesh overlay */}
                                <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

                                <div className="p-6 flex flex-col gap-4 flex-1">
                                    {/* Header row: icon + tag */}
                                    <div className="flex items-start justify-between w-full">
                                        {/* Icon pill */}
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-md`}>
                                            <feature.icon className="w-5 h-5 text-white" style={{ fill: 'none' }} />
                                        </div>
                                        {/* Tag chip */}
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${feature.tagColor}`}>
                                            {feature.tag}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors duration-300">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium flex-1">
                                        {feature.desc}
                                    </p>

                                    {/* Bottom progress bar */}
                                    <div className="w-full pt-2">
                                        <div className={`h-[3px] w-8 bg-gradient-to-r ${feature.gradient} rounded-full origin-left scale-x-50 group-hover:scale-x-100 transition-transform duration-500`} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
