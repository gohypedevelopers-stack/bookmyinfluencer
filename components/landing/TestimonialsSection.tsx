"use client"

import { Container } from "@/components/container"
import { motion, useInView } from "framer-motion"
import { TrendingUp, Users, Target } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"

// ─── Count-up Hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, decimals = 0) {
    const [count, setCount] = useState(0)
    const ref = useRef<ReturnType<typeof setInterval> | null>(null)

    const start = () => {
        const startTime = performance.now()
        ref.current = setInterval(() => {
            const elapsed = performance.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(parseFloat((eased * target).toFixed(decimals)))
            if (progress >= 1) {
                clearInterval(ref.current!)
                setCount(target)
            }
        }, 16)
    }

    useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])

    return { count, start }
}

// ─── Animated Stat Card ───────────────────────────────────────────────────────
interface StatCardProps {
    label: string
    numericValue: number
    decimals: number
    prefix: string
    suffix: string
    icon: React.ElementType
    gradient: string
    ringColor: string
    delay: number
    barHeights: number[]
}

function StatCard({ label, numericValue, decimals, prefix, suffix, icon: Icon, gradient, ringColor, delay, barHeights }: StatCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(cardRef, { once: true, margin: "-60px" })
    const { count, start } = useCountUp(numericValue, 2200, decimals)
    const [started, setStarted] = useState(false)

    useEffect(() => {
        if (isInView && !started) {
            setStarted(true)
            setTimeout(start, delay)
        }
    }, [isInView, started, start, delay])

    const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: delay / 1000, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="group relative"
        >
            <div className={`absolute -inset-[2px] rounded-[2rem] bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm`} />
            <div className="relative bg-white border border-slate-100 rounded-[1.8rem] p-7 shadow-xl shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-slate-300/40 group-hover:-translate-y-2 transition-all duration-500 overflow-hidden text-center flex flex-col items-center gap-5">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.035] transition-opacity duration-700`} />
                <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden rounded-[1.8rem]">
                    <div className={`absolute left-[10%] right-[10%] h-[2px] bg-gradient-to-r ${gradient} rounded-full opacity-60 -translate-y-full group-hover:translate-y-[calc(var(--card-h,320px))] transition-transform duration-700 ease-in-out`} />
                </div>
                <div className="relative w-14 h-14 flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full border-2 border-dashed ${ringColor} opacity-30 animate-spin-slow`} />
                    <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight tabular-nums leading-none">
                            {prefix}{displayValue}
                        </span>
                        <span className={`text-2xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent leading-none`}>
                            {suffix}
                        </span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-500 transition-colors duration-300">
                        {label}
                    </div>
                </div>
                <div className="flex items-end gap-[3px] h-8 w-full justify-center">
                    {barHeights.map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: delay / 1000 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                            style={{ height: `${h}%`, originY: 1 }}
                            className={`w-[6px] rounded-full bg-gradient-to-t ${gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-500`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS: StatCardProps[] = [
    {
        label: "Total Reach",
        numericValue: 850,
        decimals: 0,
        prefix: "",
        suffix: "M+",
        icon: Users,
        gradient: "from-blue-500 to-indigo-600",
        ringColor: "border-blue-400",
        delay: 0,
        barHeights: [30, 45, 38, 60, 52, 75, 65, 90, 80, 100, 88, 95]
    },
    {
        label: "Avg Engagement",
        numericValue: 6.2,
        decimals: 1,
        prefix: "",
        suffix: "%",
        icon: TrendingUp,
        gradient: "from-violet-500 to-purple-600",
        ringColor: "border-violet-400",
        delay: 150,
        barHeights: [50, 60, 45, 70, 65, 80, 72, 88, 78, 95, 85, 100]
    },
    {
        label: "Successful Campaigns",
        numericValue: 12,
        decimals: 0,
        prefix: "",
        suffix: "K+",
        icon: Target,
        gradient: "from-rose-500 to-pink-600",
        ringColor: "border-rose-400",
        delay: 300,
        barHeights: [40, 55, 48, 65, 58, 72, 68, 82, 76, 90, 85, 100]
    },
]

const TESTIMONIALS = [
    {
        name: "Aditya Mehta",
        role: "President & Co-founder",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
        content: "BookMyInfluencer transformed our marketing campaigns. We scaled our reach across tier-2 and tier-3 cities in India seamlessly, finding high-quality local creators in minutes.",
    },
    {
        name: "Priya Sharma",
        role: "Co-founder",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
        content: "The platform's deep analytics and automated payouts saved us hours of manual collaboration tracking. It is by far the most reliable influencer marketing tool in India.",
    },
    {
        name: "Ananya Iyer",
        role: "Operations Manager",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
        content: "Collaborating with regional creators used to be an operational nightmare. With BookMyInfluencer, onboarding, KYC verification, and payouts are completely streamlined.",
    },
    {
        name: "Rohan Malhotra",
        role: "Sales Manager",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
        content: "Our campaign ROI increased by 40% after switching to BookMyInfluencer. Filtering creators by niche, engagement, and city helped us target the right customer base.",
    },
    {
        name: "Kabir Verma",
        role: "Web Developer",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80",
        content: "Integrating campaign flows via their dashboard is incredibly smooth. Real-time updates and notifications keep our developers and brand managers in perfect sync.",
    },
    {
        name: "Ishaan Goel",
        role: "Graphic Designer",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80",
        content: "The dynamic media kit feature is state-of-the-art. It makes presenting creative portfolios and real-time social metrics to prospective brands look highly premium.",
    }
]

// ─── Section ──────────────────────────────────────────────────────────────────
export function TestimonialsSection() {
    return (
        <section id="testimonials-section" className="w-full relative overflow-x-hidden transition-colors duration-500 bg-slate-50">
            {/* Stats Container */}
            <div className="py-16 md:py-24">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <h2 className="text-3xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                            Proven Results for <span className="text-indigo-600">Industry Leaders</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                            Join thousands of brands and creators who are scaling their impact with our platform.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-4">
                        {STATS.map((stat, i) => (
                            <StatCard key={i} {...stat} />
                        ))}
                    </div>
                </Container>
            </div>

            {/* Matching Image Design - Testimonials Container */}
            <div className="py-16 md:py-24 bg-slate-50 overflow-visible">
                <Container>
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24 md:mb-32"
                    >
                        <h2 className="text-3xl md:text-6xl font-bold text-slate-900 mb-6 uppercase tracking-wider">
                            Customer <span className="text-indigo-600">Testimonials</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium mt-4">
                            See how brands and creators are achieving outstanding success and growth through our platform.
                        </p>
                    </motion.div>

                    {/* Cards Grid with Perspective for 3D effect */}
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.2,
                                    delayChildren: 0.1
                                }
                            }
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-24 max-w-4xl mx-auto [perspective:1200px] overflow-visible"
                    >
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div 
                                key={i} 
                                variants={{
                                    hidden: { 
                                        opacity: 0, 
                                        rotateX: -45, 
                                        y: 50, 
                                        z: -100,
                                        scale: 0.95 
                                    },
                                    visible: { 
                                        opacity: 1, 
                                        rotateX: 0, 
                                        y: 0, 
                                        z: 0,
                                        scale: 1,
                                        transition: { 
                                            type: "spring", 
                                            stiffness: 80, 
                                            damping: 15,
                                            mass: 1.2
                                        } 
                                    }
                                }}
                                className="relative pt-14 origin-top overflow-visible"
                            >
                                {/* Avatar */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96px] h-[96px] rounded-full border-[4px] border-white overflow-hidden z-30 shadow-[0_8px_20px_rgba(0,0,0,0.18)] bg-slate-200 transition-all duration-500 ease-out hover:scale-[1.25] hover:rotate-6 hover:border-indigo-500 hover:shadow-[0_15px_30px_rgba(99,102,241,0.4)] cursor-pointer group/avatar">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={t.image} alt={t.name} width={96} height={96} className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover/avatar:scale-110" />
                                </div>

                                {/* Card Body */}
                                <div className="bg-white rounded-[20px] pt-14 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] text-center overflow-hidden flex flex-col h-full hover:-translate-y-3 transition-all duration-500 border border-slate-100 group relative z-10">
                                    <div className="px-5 pb-8 flex-1">
                                        <h3 className="text-lg font-black text-slate-900 uppercase mb-1 tracking-wide">{t.name}</h3>
                                        <p className="text-[9px] font-bold text-[#27ae60] uppercase tracking-[0.1em] mb-4">{t.role}</p>
                                        <p className="text-[12px] text-slate-600 leading-relaxed font-medium px-2">
                                            {t.content}
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="bg-[#27ae60] py-3 flex items-center justify-center gap-2.5">
                                        <a href="#" aria-label="LinkedIn" className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#27ae60] hover:scale-110 transition-transform font-bold text-[12px]">
                                            in
                                        </a>
                                        <a href="#" aria-label="Facebook" className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#27ae60] hover:scale-110 transition-transform font-bold text-[12px] font-serif italic">
                                            f
                                        </a>
                                        <a href="#" aria-label="Twitter" className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#27ae60] hover:scale-110 transition-transform font-bold text-[12px]">
                                            t
                                        </a>
                                        <a href="#" aria-label="Behance" className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#27ae60] hover:scale-110 transition-transform font-bold text-[11px]">
                                            Bē
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </Container>
            </div>
        </section>
    )
}
