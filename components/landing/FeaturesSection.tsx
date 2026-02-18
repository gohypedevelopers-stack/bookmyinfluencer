"use client"

import { Shield, Lock, MessageSquare } from "lucide-react"
import { Container } from "@/components/container"
import { motion } from "framer-motion"

export function FeaturesSection() {
    return (
        <section className="w-full py-24 bg-white">
            <Container className="text-center">
                {/* Trusted By */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-24"
                >
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">As Featured In</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
                        {["VOGUE", "TechCrunch", "WIRED", "Forbes", "ADWEEK"].map((brand, i) => (
                            <motion.h3
                                key={brand}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`text-2xl font-serif font-bold text-slate-700 ${brand === "Forbes" ? "italic" : ""} ${brand === "WIRED" ? "tracking-tight" : ""}`}
                            >
                                {brand}
                            </motion.h3>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Leaders Choose Us</h2>
                    <p className="text-lg text-slate-600">We provide the safety infrastructure for professional partnerships.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Shield,
                            title: "Verified Creators",
                            desc: "Every influencer undergoes strict KYC identity checks and audience quality auditing.",
                            color: "bg-blue-50 text-blue-600"
                        },
                        {
                            icon: Lock,
                            title: "Secure Escrow",
                            desc: "Funds are held safely in escrow until deliverables are approved by the brand.",
                            color: "bg-purple-50 text-purple-600"
                        },
                        {
                            icon: MessageSquare,
                            title: "Trio-Chat System",
                            desc: "Direct negotiation channels with admin moderation available for dispute resolution.",
                            color: "bg-pink-50 text-pink-600"
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.5 }}
                            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
