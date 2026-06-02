"use client"

import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { motion } from "framer-motion"
import { Shield, Eye, Lock, Database, Bell, UserCheck, ArrowLeft, ChevronRight } from "lucide-react"
import { Container } from "@/components/container"

const SECTIONS = [
    {
        icon: Eye,
        title: "Information We Collect",
        gradient: "from-blue-500 to-indigo-600",
        tag: "Collection",
        content: [
            "Account information such as your name, email address, and profile details when you register.",
            "Usage data including pages visited, features used, and interactions on our platform.",
            "Payment and transaction data processed securely through our escrow infrastructure.",
            "Communications you send to project managers, brands, or creators through our platform.",
            "Device and technical data such as IP address, browser type, and operating system.",
        ]
    },
    {
        icon: Database,
        title: "How We Use Your Data",
        gradient: "from-violet-500 to-purple-600",
        tag: "Usage",
        content: [
            "To operate, improve, and personalize our influencer marketplace platform.",
            "To process payments, manage escrow transactions, and prevent fraud.",
            "To match brands with verified creators based on campaign requirements.",
            "To send platform notifications, campaign updates, and service announcements.",
            "To comply with legal obligations and enforce our Terms of Service.",
        ]
    },
    {
        icon: Lock,
        title: "Data Security",
        gradient: "from-emerald-500 to-teal-600",
        tag: "Security",
        content: [
            "All data is encrypted in transit using TLS 1.3 and at rest using AES-256.",
            "Escrow payment data is handled by PCI-DSS compliant payment processors.",
            "Access to personal data is restricted to authorized personnel on a need-to-know basis.",
            "We conduct regular security audits and vulnerability assessments.",
            "In the event of a breach, we will notify affected users within 72 hours.",
        ]
    },
    {
        icon: UserCheck,
        title: "Your Rights",
        gradient: "from-rose-500 to-pink-600",
        tag: "Rights",
        content: [
            "Right to access: Request a copy of the personal data we hold about you.",
            "Right to rectification: Correct inaccurate or incomplete personal information.",
            "Right to erasure: Request deletion of your personal data under certain circumstances.",
            "Right to portability: Receive your data in a structured, machine-readable format.",
            "Right to object: Opt out of certain processing activities, including marketing.",
        ]
    },
    {
        icon: Bell,
        title: "Cookies & Tracking",
        gradient: "from-amber-500 to-orange-600",
        tag: "Cookies",
        content: [
            "We use essential cookies to maintain your session and authenticate your account.",
            "Analytics cookies help us understand how users interact with our platform.",
            "You can control cookie preferences through your browser settings at any time.",
            "Third-party analytics tools we use are bound by their own privacy policies.",
            "We do not sell your personal data to third parties for advertising purposes.",
        ]
    },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
}

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            <Navbar />
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
                {/* Animated blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-violet-500 rounded-full blur-[100px]" />
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
                </div>

                <Container className="relative z-10 py-20 md:py-28">
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-10 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="max-w-3xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                            <Shield className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300">Legal Document</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-tight">
                            Privacy{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                                Policy
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                            We are committed to protecting your personal data. This policy explains how Bookmyinfluencer collects, uses, and safeguards your information.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8 text-xs text-slate-500 font-medium">
                            <span>Last updated: June 1, 2026</span>
                            <span>•</span>
                            <span>Effective: June 1, 2026</span>
                            <span>•</span>
                            <span>Version 2.1</span>
                        </div>
                    </motion.div>
                </Container>
            </div>

            {/* Quick Nav */}
            <div className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
                <Container>
                    <div className="flex gap-6 overflow-x-auto py-4 scrollbar-hide">
                        {SECTIONS.map((s, i) => (
                            <a key={i} href={`#section-${i}`} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 whitespace-nowrap transition-colors group">
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                {s.tag}
                            </a>
                        ))}
                    </div>
                </Container>
            </div>

            {/* Sections */}
            <Container className="py-16 md:py-24">
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8">
                    {SECTIONS.map((section, i) => (
                        <motion.div key={i} id={`section-${i}`} variants={itemVariants} className="group relative">
                            <div className="absolute -inset-[1.5px] rounded-[1.6rem] bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }} />
                            <div className="relative bg-white border border-slate-100 group-hover:border-transparent rounded-[1.5rem] p-7 md:p-9 shadow-sm group-hover:shadow-xl transition-all duration-500 overflow-hidden">
                                {/* Top accent */}
                                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${section.gradient} opacity-60`} />

                                <div className="flex items-start gap-5 mb-6">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${section.gradient} shadow-lg flex-shrink-0`}>
                                        <section.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>{section.tag}</span>
                                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">{section.title}</h2>
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    {section.content.map((point, j) => (
                                        <li key={j} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${section.gradient} flex-shrink-0`} />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Contact block */}
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[1.5rem] p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                    <Shield className="w-8 h-8 mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">Privacy Questions?</h3>
                    <p className="text-indigo-200 text-sm mb-5 max-w-md mx-auto">Contact our Data Protection Officer for any privacy-related inquiries.</p>
                    <a href="mailto:privacy@bookmyinfluencer.in" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
                        privacy@bookmyinfluencer.in
                    </a>
                </motion.div>
            </Container>

            {/* Footer strip */}
            <div className="border-t border-slate-100 bg-white py-6">
                <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-tr-[8px] rounded-bl-[8px] flex items-center justify-center text-white font-bold text-xs">B</div>
                        <span className="font-bold text-slate-900 tracking-tight">Bookmyinfluencer</span>
                    </Link>
                    <div className="flex gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <Link href="/privacy-policy" className="text-indigo-600">Privacy</Link>
                        <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
                        <Link href="/support" className="hover:text-indigo-600 transition-colors">Support</Link>
                    </div>
                </Container>
            </div>
        </div>
    )
}
