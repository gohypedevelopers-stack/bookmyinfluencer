"use client"

import { Container } from "@/components/container"
import { motion } from "framer-motion"
import Image from "next/image"
import { Star, TrendingUp, Users, Target } from "lucide-react"

const TESTIMONIALS = [
    {
        name: "Sarah Jenkins",
        role: "Head of Marketing at Gloam",
        content: "Bookmyinfluencer has completely transformed how we handle our creator campaigns. The escrow system gives us the security we need, and the quality of creators is unmatched.",
        image: "/images/sarah.png",
        metrics: { label: "Campaign ROI", value: "4.8x" }
    },
    {
        name: "Marco Rossi",
        role: "Tech Content Creator",
        content: "As a creator, I love the transparency. I get clear briefs, direct communication with brands, and most importantly, I get paid the moment my content is approved.",
        image: "/images/marco.png",
        metrics: { label: "Brand Deals", value: "12/mo" }
    },
    {
        name: "Aisha Patel",
        role: "Creative Director at Vibe",
        content: "The Tri-Chat system is a game changer. Having our account manager in the loop ensures everything runs smoothly without any miscommunications.",
        image: "/images/lady.png",
        metrics: { label: "Reach Growth", value: "+125%" }
    }
]

const STATS = [
    { label: "Total Reach", value: "850M+", icon: Users },
    { label: "Avg Engagement", value: "6.2%", icon: TrendingUp },
    { label: "Successful Campaigns", value: "12K+", icon: Target },
]

export function TestimonialsSection() {
    return (
        <section className="w-full py-24 md:py-32 bg-slate-50 relative overflow-hidden transition-colors duration-500">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 sm:mb-20"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Proven Results for <span className="text-indigo-600">Industry Leaders</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                        Join thousands of brands and creators who are scaling their impact with our platform.
                    </p>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-20 sm:mb-24">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/50 text-center group hover:bg-slate-50 transition-all duration-500"
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</div>
                            <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="relative group h-full"
                        >
                            <div className="h-full bg-slate-100 border border-slate-200 p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col hover:border-indigo-200 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50">
                                <div className="flex gap-1 mb-8">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                                    ))}
                                </div>

                                <blockquote className="text-lg text-slate-700 font-medium leading-relaxed mb-10 flex-grow italic">
                                    "{t.content}"
                                </blockquote>

                                <div className="flex items-center gap-4 pt-8 border-t border-slate-200">
                                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                                        <Image src={t.image} alt={t.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-lg leading-none mb-1">{t.name}</div>
                                        <div className="text-slate-500 text-sm font-medium">{t.role}</div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-indigo-600 font-black text-lg leading-none mb-1">{t.metrics.value}</div>
                                        <div className="text-slate-700 text-[10px] font-black uppercase tracking-widest">{t.metrics.label}</div>
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
