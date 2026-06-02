"use client"

import Link from "next/link"
import { Container } from "@/components/container"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

const NAV_LINKS = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/support", label: "Support" },
]

export function Footer() {
    return (
        <footer className="relative bg-white border-t border-slate-100/80 transition-colors duration-500 overflow-hidden">
            {/* Subtle top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-200/60 to-transparent" />
            {/* Faint ambient orb */}
            <div className="absolute bottom-0 right-0 w-72 h-48 rounded-full bg-indigo-50/60 blur-[80px] pointer-events-none" />

            <Container className="py-10 md:py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* Brand identity */}
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center md:items-start gap-2.5"
                    >
                        <Link href="/" className="group flex items-center gap-2.5">
                            {/* Logo mark */}
                            <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-tr-[10px] rounded-bl-[10px] flex items-center justify-center text-white font-black text-sm shadow-[0_4px_14px_rgba(99,102,241,0.35)] group-hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] transition-shadow duration-300">
                                B
                                {/* Shine flare */}
                                <div className="absolute inset-0 rounded-tr-[10px] rounded-bl-[10px] bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <span className="font-black text-[18px] text-slate-900 tracking-tighter group-hover:text-indigo-700 transition-colors duration-300">
                                Bookmyinfluencer
                            </span>
                        </Link>

                        <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                            © 2026 Bookmyinfluencer Inc. All rights reserved.
                        </p>
                    </motion.div>

                    {/* Nav links */}
                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-1"
                    >
                        {NAV_LINKS.map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className="group relative flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] text-slate-500 font-bold uppercase tracking-[0.18em] hover:text-indigo-600 transition-colors duration-200"
                            >
                                {/* Hover pill background */}
                                <span className="absolute inset-0 rounded-xl bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                <span className="relative z-10">{link.label}</span>
                                <ArrowUpRight className="relative z-10 w-2.5 h-2.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                            </Link>
                        ))}
                    </motion.div>

                </div>
            </Container>
        </footer>
    )
}
