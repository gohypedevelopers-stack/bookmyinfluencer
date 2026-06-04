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
        <section className="w-full py-16 md:py-24 bg-slate-50 relative overflow-hidden transition-colors duration-500">
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
                    className="max-w-3xl mx-auto mt-16 mb-20 md:mb-28"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">Standardizing the <span className="text-indigo-600">Industry</span></h2>
                    <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-medium">We build the infrastructure for secure and professional creative collaborations.</p>
                </motion.div>

                <div className="relative mt-12 md:mt-16">
                    {/* Background decorative glowing neon blobs to shine through glassmorphism cards */}
                    <div className="absolute -top-16 left-1/12 w-80 h-80 rounded-full bg-blue-400/8 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
                    <div className="absolute top-24 right-1/12 w-88 h-88 rounded-full bg-purple-400/6 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-pink-400/5 blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
                    
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative z-10">
                        {[
                            {
                                icon: Shield,
                                title: "Verified Creators",
                                tag: "KYC Audited",
                                desc: "Every influencer undergoes strict identity checks and audience quality auditing to ensure real impact.",
                                glowGradient: "from-blue-400/20 via-indigo-400/8 to-violet-400/20",
                                glowShadow: "group-hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.04),0_0_25px_4px_rgba(99,102,241,0.06)]",
                                progressBarGradient: "from-slate-400/70 to-indigo-500/60",
                                tagColor: "bg-blue-50/60 backdrop-blur-md text-blue-800 border-blue-200/40",
                                iconBg: "bg-blue-50/60 backdrop-blur-md text-blue-600 border border-blue-100/40 shadow-sm",
                            },
                            {
                                icon: Lock,
                                title: "Secure Escrow",
                                tag: "Zero Risk",
                                desc: "Payments held in escrow until deliverables are approved. Your investment is always protected.",
                                glowGradient: "from-violet-400/20 via-purple-400/8 to-indigo-400/20",
                                glowShadow: "group-hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.04),0_0_25px_4px_rgba(139,92,246,0.06)]",
                                progressBarGradient: "from-slate-400/70 to-purple-500/60",
                                tagColor: "bg-violet-50/60 backdrop-blur-md text-violet-800 border-violet-200/40",
                                iconBg: "bg-violet-50/60 backdrop-blur-md text-violet-600 border border-violet-100/40 shadow-sm",
                            },
                            {
                                icon: MessageSquare,
                                title: "Manager-Led Channels",
                                tag: "End-to-End",
                                desc: "Two protected channels keep brands & creators separated while project managers coordinate delivery.",
                                glowGradient: "from-rose-350/20 via-pink-400/8 to-violet-300/20",
                                glowShadow: "group-hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.04),0_0_25px_4px_rgba(244,63,94,0.06)]",
                                progressBarGradient: "from-slate-400/70 to-rose-500/60",
                                tagColor: "bg-rose-50/60 backdrop-blur-md text-rose-800 border-rose-200/40",
                                iconBg: "bg-rose-50/60 backdrop-blur-md text-rose-600 border border-rose-100/40 shadow-sm",
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
                                className="group relative h-full"
                            >
                                {/* Continuous staggered ambient floating container */}
                                <motion.div
                                    animate={{
                                        y: [0, -8, 0],
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.6,
                                    }}
                                    className="relative h-full w-full"
                                >
                                    {/* Soft, futuristic off-color glowing border overlay that breathes on hover */}
                                    <motion.div
                                        className={`absolute -inset-[3px] rounded-[1.7rem] bg-gradient-to-r ${feature.glowGradient} opacity-0 group-hover:opacity-100 transition-all duration-500 blur-[8px] pointer-events-none`}
                                        animate={{
                                            scale: [0.98, 1.02, 0.98],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    />
                                    <div className="absolute -inset-[1px] rounded-[1.6rem] bg-gradient-to-br from-white/50 via-slate-200/10 to-white/30 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

                                    {/* Fully transparent premium glassmorphism card backdrop (bg-white/10) with sharp border and heavy blur */}
                                    <div className={`relative h-full bg-white/[0.12] backdrop-blur-2xl backdrop-saturate-200 rounded-[1.6rem] border border-white/[0.25] transition-all duration-500 group-hover:border-white/[0.45] group-hover:bg-white/[0.18] group-hover:-translate-y-3 flex flex-col items-start text-left overflow-hidden shadow-[0_8px_32px_0_rgba(15,23,42,0.02)] ${feature.glowShadow}`}>

                                        {/* Glass sheen sweep reflex */}
                                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                                        {/* Noise mesh overlay */}
                                        <div className="absolute inset-0 opacity-[0.012] pointer-events-none"
                                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

                                        <div className="p-6 flex flex-col gap-4 flex-1 w-full relative z-10">
                                            {/* Header row: icon + tag */}
                                            <div className="flex items-start justify-between w-full">
                                                {/* Upgraded soft-color Icon pill with rotate hover */}
                                                <div className={`p-3 rounded-2xl ${feature.iconBg} transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-md`}>
                                                    <feature.icon className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" style={{ fill: 'none' }} />
                                                </div>
                                                {/* Tag chip */}
                                                <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full border ${feature.tagColor} shadow-sm transition-colors duration-300 group-hover:bg-white/80`}>
                                                    {feature.tag}
                                                </span>
                                            </div>

                                            {/* Highly readable text-slate-900 font-extrabold Title */}
                                            <h3 className="text-xl font-extrabold text-slate-900 leading-snug transition-colors duration-300 tracking-tight">
                                                {feature.title}
                                            </h3>

                                            {/* High contrast text-slate-800 font-semibold Description */}
                                            <p className="text-sm text-slate-800 leading-relaxed font-semibold flex-1">
                                                {feature.desc}
                                            </p>

                                            {/* Bottom progress bar */}
                                            <div className="w-full pt-2">
                                                <div className={`h-[3px] w-8 bg-gradient-to-r ${feature.progressBarGradient} rounded-full origin-left scale-x-50 group-hover:scale-x-100 transition-transform duration-500`} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}
