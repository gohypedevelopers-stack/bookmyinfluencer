"use client"

import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { motion } from "framer-motion"
import { MessageCircle, Zap, BookOpen, AlertCircle, ArrowLeft, Mail, Phone, Clock, CheckCircle2, ChevronDown } from "lucide-react"
import { Container } from "@/components/container"
import { useState } from "react"

const FAQS = [
    {
        q: "How do I post a campaign as a brand?",
        a: "After registering and completing brand verification, navigate to your Brand Dashboard and click 'Create Campaign'. Fill in the campaign brief, set your budget, and our system will auto-match verified creators to your requirements."
    },
    {
        q: "How do creators get paid?",
        a: "Once a campaign is completed and the brand approves deliverables, our project management team manually processes creator payouts within 7 business days to the bank account registered in your creator profile."
    },
    {
        q: "What is escrow and how does it protect me?",
        a: "Escrow holds your brand's payment securely until all campaign deliverables are reviewed and approved. Funds are never released to creators until your project manager confirms completion, protecting your investment at every stage."
    },
    {
        q: "Can I dispute a campaign outcome?",
        a: "Yes. Submit a dispute through your campaign dashboard within 7 days of the completion notice. Our project managers will review all submitted content and communications and provide a resolution within 5 business days."
    },
    {
        q: "How do I get my creator account verified (KYC)?",
        a: "After signing up as a creator, go to Profile → Verification and submit your government-issued ID, PAN card, and bank details. Our team will review your application within 3–5 business days and notify you by email."
    },
    {
        q: "What niches and platforms are supported?",
        a: "We support creators across Instagram, YouTube, LinkedIn, X (Twitter), and emerging platforms. Niches range from lifestyle, tech, and gaming to finance, food, fashion, and B2B thought leadership."
    },
]

const CONTACT_METHODS = [
    {
        icon: Mail,
        title: "Email Support",
        subtitle: "For non-urgent queries",
        value: "support@bookmyinfluencer.in",
        cta: "Send an email",
        href: "mailto:support@bookmyinfluencer.in",
        gradient: "from-blue-500 to-indigo-600",
        response: "< 24 hours"
    },
    {
        icon: MessageCircle,
        title: "Live Chat",
        subtitle: "Talk to our team now",
        value: "Available in your dashboard",
        cta: "Open chat",
        href: "/brand/register",
        gradient: "from-emerald-500 to-teal-600",
        response: "< 5 minutes"
    },
    {
        icon: Phone,
        title: "Phone Support",
        subtitle: "Mon – Sat, 10am – 7pm IST",
        value: "+91 98765 43210",
        cta: "Call us",
        href: "tel:+919876543210",
        gradient: "from-violet-500 to-purple-600",
        response: "Immediate"
    },
]

const TOPICS = [
    { icon: BookOpen, title: "Getting Started", desc: "Brand & creator onboarding, campaign setup, profile verification.", gradient: "from-blue-500 to-indigo-600" },
    { icon: Zap, title: "Platform Features", desc: "Escrow, manager workflow, campaign matching, and analytics.", gradient: "from-violet-500 to-purple-600" },
    { icon: AlertCircle, title: "Billing & Payments", desc: "Invoices, payouts, refund policy, and payment methods.", gradient: "from-emerald-500 to-teal-600" },
    { icon: CheckCircle2, title: "Account & Security", desc: "KYC, password resets, two-factor auth, and account issues.", gradient: "from-rose-500 to-pink-600" },
]

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false)
    return (
        <motion.div layout className="group border border-slate-100 bg-white rounded-[1.2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-sm font-semibold text-slate-800 leading-snug">{q}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} className="flex-shrink-0">
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </motion.div>
            </button>
            <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-3">{a}</p>
            </motion.div>
        </motion.div>
    )
}

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            <Navbar />
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-teal-500 rounded-full blur-[100px]" />
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
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-300">Help Center</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-tight">
                            We're here to{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                                Help
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                            Get answers to your questions, reach our support team, or browse common topics. Our team is ready to help brands and creators succeed.
                        </p>

                        {/* Response time badges */}
                        <div className="flex flex-wrap gap-3 mt-8">
                            {[
                                { icon: Clock, label: "Avg. Response: 2hrs" },
                                { icon: CheckCircle2, label: "98% Satisfaction Rate" },
                                { icon: Zap, label: "Live Chat Available" },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-slate-300 font-medium">
                                    <badge.icon className="w-3.5 h-3.5 text-emerald-400" />
                                    {badge.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </Container>
            </div>

            <Container className="py-16 md:py-24 space-y-20">

                {/* Contact methods */}
                <div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-600 mb-2">Contact</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Get in Touch</h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {CONTACT_METHODS.map((method, i) => (
                            <motion.a
                                key={i}
                                href={method.href}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -4 }}
                                className="group relative block"
                            >
                                <div className={`absolute -inset-[1.5px] rounded-[1.5rem] bg-gradient-to-br ${method.gradient} opacity-0 group-hover:opacity-25 transition-opacity duration-500 blur-sm`} />
                                <div className="relative bg-white border border-slate-100 group-hover:border-transparent rounded-[1.4rem] p-6 shadow-sm group-hover:shadow-xl transition-all duration-400 overflow-hidden h-full">
                                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${method.gradient}`} />
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center shadow-md mb-5`}>
                                        <method.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900">{method.title}</h3>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">{method.response}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">{method.subtitle}</p>
                                    <p className="text-sm font-semibold text-slate-700">{method.value}</p>
                                    <div className={`mt-4 text-xs font-bold bg-gradient-to-r ${method.gradient} bg-clip-text text-transparent group-hover:translate-x-1 transition-transform duration-300 inline-block`}>
                                        {method.cta} →
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Topics */}
                <div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-600 mb-2">Browse</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Support Topics</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {TOPICS.map((topic, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                                whileHover={{ y: -3 }}
                                className="group bg-white border border-slate-100 rounded-[1.2rem] p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow-md mb-4`}>
                                    <topic.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-indigo-600 transition-colors">{topic.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{topic.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FAQs */}
                <div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-600 mb-2">FAQ</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <FAQItem key={i} q={faq.q} a={faq.a} />
                        ))}
                    </motion.div>
                </div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[1.5rem] p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize: "25px 25px" }} />
                    <MessageCircle className="w-8 h-8 mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                    <p className="text-emerald-200 text-sm mb-5 max-w-md mx-auto">Our support team is available Monday to Saturday, 10am–7pm IST. We typically respond within 2 hours.</p>
                    <a href="mailto:support@bookmyinfluencer.in" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors">
                        <Mail className="w-4 h-4" />
                        support@bookmyinfluencer.in
                    </a>
                </motion.div>
            </Container>

            {/* Footer strip */}
            <div className="border-t border-slate-100 bg-white py-6">
                <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-tr-[8px] rounded-bl-[8px] flex items-center justify-center text-white font-bold text-xs">B</div>
                        <span className="font-bold text-slate-900 tracking-tight">Book<span className="text-indigo-600">my</span><span className="text-[#27ae60]">influencer</span></span>
                    </Link>
                    <div className="flex gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <Link href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
                        <Link href="/support" className="text-emerald-600">Support</Link>
                    </div>
                </Container>
            </div>
        </div>
    )
}
