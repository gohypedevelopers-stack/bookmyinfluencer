"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Container } from "@/components/container"
import { motion } from "framer-motion"
import { ContactSalesModal } from "./ContactSalesModal"

export function CallToAction() {
    const [isModalOpen, setIsModalOpen] = useState(false)


    return (
        <section className="w-full py-20 sm:py-32 bg-transparent relative overflow-hidden transition-colors duration-500">
            <Container>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-indigo-600 rounded-[3rem] p-10 sm:p-16 lg:p-24 text-center text-white shadow-[0_40px_100px_-20px_rgba(79,70,229,0.3)] relative overflow-hidden mx-4 sm:mx-0 border border-indigo-500"
                >
                    {/* Premium Background Decorations - Refined for Light Mode Contrast */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                    <div className="absolute inset-0 border-[20px] border-white/5 rounded-[3rem] pointer-events-none" />

                    <div className="relative z-10 space-y-8">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight"
                        >
                            Ready to Scale Your <br />
                            <span className="text-indigo-100">Global Reach?</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-white/90 text-lg lg:text-2xl mb-12 max-w-3xl mx-auto font-medium"
                        >
                            Join the elite network of 25,000+ top-tier brands and creators making high-impact connections today.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center"
                        >
                            <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-50 font-black h-14 sm:h-16 px-8 sm:px-12 rounded-[2rem] text-base sm:text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10 tracking-widest uppercase text-xs" asChild>
                                <Link href="/login">
                                    Get Started Free
                                </Link>
                            </Button>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                size="lg"
                                variant="outline"
                                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-md h-14 sm:h-16 px-8 sm:px-12 rounded-[2rem] text-base sm:text-lg transition-all hover:scale-105 active:scale-95 font-black tracking-widest uppercase text-xs"
                            >
                                Contact Sales
                            </Button>
                        </motion.div>
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
