"use client"

import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { motion } from "framer-motion"
import { FileText, Users, CreditCard, Ban, Scale, RefreshCw, ArrowLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { Container } from "@/components/container"

const SECTIONS = [
    {
        icon: Users,
        title: "Eligibility & Account",
        gradient: "from-blue-500 to-indigo-600",
        tag: "Accounts",
        content: [
            "You must be at least 18 years of age to create an account and use our platform.",
            "By registering, you confirm that all information provided is accurate and up to date.",
            "One account per person or entity — multiple accounts for the same user are prohibited.",
            "You are responsible for maintaining the security of your login credentials.",
            "Bookmyinfluencer reserves the right to suspend accounts that violate these terms.",
        ]
    },
    {
        icon: CreditCard,
        title: "Payments & Escrow",
        gradient: "from-emerald-500 to-teal-600",
        tag: "Payments",
        content: [
            "All brand payments are held in secure escrow until campaign deliverables are approved.",
            "Platform service fees are non-refundable once a campaign has been activated.",
            "Creator payouts are processed manually within 7 business days after campaign completion.",
            "Disputed transactions are reviewed by our project management team within 48 hours.",
            "Chargebacks initiated outside the platform's dispute process may result in account suspension.",
        ]
    },
    {
        icon: FileText,
        title: "Content & Deliverables",
        gradient: "from-violet-500 to-purple-600",
        tag: "Content",
        content: [
            "Creators retain ownership of their original content but grant Bookmyinfluencer a license to showcase it on our platform.",
            "All campaign content must comply with applicable advertising standards and disclosure requirements.",
            "Brands may not use creator content beyond the scope agreed upon in the campaign brief.",
            "Content that is misleading, defamatory, or unlawful is strictly prohibited.",
            "Creators are responsible for disclosing paid partnerships in accordance with platform guidelines.",
        ]
    },
    {
        icon: Ban,
        title: "Prohibited Activities",
        gradient: "from-rose-500 to-pink-600",
        tag: "Prohibited",
        content: [
            "Circumventing the platform to conduct off-platform payments or communications is strictly forbidden.",
            "Creating fake reviews, inflating engagement metrics, or misrepresenting audience data.",
            "Sharing login credentials or allowing unauthorized access to your account.",
            "Uploading malicious code, spam, or attempting to disrupt platform infrastructure.",
            "Harassment, discrimination, or abusive behaviour towards other platform users or staff.",
        ]
    },
    {
        icon: Scale,
        title: "Dispute Resolution",
        gradient: "from-amber-500 to-orange-600",
        tag: "Disputes",
        content: [
            "All disputes between brands and creators must first be submitted through our in-platform resolution center.",
            "Our project management team will review and mediate within 5 business days.",
            "If unresolved, disputes may be escalated to binding arbitration under Indian Arbitration Law.",
            "Class action lawsuits against Bookmyinfluencer are expressly waived by all users.",
            "The governing law for all terms is the jurisdiction of India.",
        ]
    },
    {
        icon: RefreshCw,
        title: "Changes to Terms",
        gradient: "from-slate-500 to-slate-700",
        tag: "Updates",
        content: [
            "Bookmyinfluencer may update these Terms of Service at any time with reasonable notice.",
            "Continued use of the platform after changes constitutes acceptance of the updated terms.",
            "Material changes will be communicated via email or prominent platform notifications.",
            "Users may terminate their account if they do not agree with updated terms.",
            "The most current version of these terms supersedes all prior versions.",
        ]
    },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            <Navbar />
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-500 rounded-full blur-[120px]" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-indigo-500 rounded-full blur-[100px]" />
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                            <FileText className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-violet-300">Legal Document</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-tight">
                            Terms of{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                                Service
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                            By using Bookmyinfluencer, you agree to these terms. Please read them carefully — they govern your use of our platform, payments, and content.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8 text-xs text-slate-500 font-medium">
                            <span>Last updated: June 1, 2026</span>
                            <span>•</span>
                            <span>Effective: June 1, 2026</span>
                            <span>•</span>
                            <span>Version 3.0</span>
                        </div>
                    </motion.div>
                </Container>
            </div>

            {/* Important notice banner */}
            <div className="bg-amber-50 border-b border-amber-200">
                <Container className="py-3 flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">By creating an account or using Bookmyinfluencer, you acknowledge that you have read and agree to these Terms of Service.</p>
                </Container>
            </div>

            {/* Quick Nav */}
            <div className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
                <Container>
                    <div className="flex gap-6 overflow-x-auto py-4 scrollbar-hide">
                        {SECTIONS.map((s, i) => (
                            <a key={i} href={`#section-${i}`} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-violet-600 whitespace-nowrap transition-colors group">
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
                            <div className="relative bg-white border border-slate-100 group-hover:border-transparent rounded-[1.5rem] p-7 md:p-9 shadow-sm group-hover:shadow-xl transition-all duration-500 overflow-hidden">
                                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${section.gradient} opacity-60`} />
                                {/* Subtle bg wash on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-[0.025] transition-opacity duration-500`} />

                                <div className="relative flex items-start gap-5 mb-6">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${section.gradient} shadow-lg flex-shrink-0`}>
                                        <section.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>{section.tag}</span>
                                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">{section.title}</h2>
                                    </div>
                                </div>

                                <ul className="relative space-y-3">
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
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-12 bg-gradient-to-br from-violet-600 to-purple-700 rounded-[1.5rem] p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                    <Scale className="w-8 h-8 mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">Legal Questions?</h3>
                    <p className="text-violet-200 text-sm mb-5 max-w-md mx-auto">Reach out to our legal team for clarification on any of these terms.</p>
                    <a href="mailto:legal@bookmyinfluencer.in" className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-violet-50 transition-colors">
                        legal@bookmyinfluencer.in
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
                        <Link href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-violet-600">Terms</Link>
                        <Link href="/support" className="hover:text-indigo-600 transition-colors">Support</Link>
                    </div>
                </Container>
            </div>
        </div>
    )
}
