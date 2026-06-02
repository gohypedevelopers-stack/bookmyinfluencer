"use client"

import { Container } from "@/components/container"
import { motion, useInView } from "framer-motion"
import { Star, TrendingUp, Users, Target } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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
            {/* Outer glow ring */}
            <div className={`absolute -inset-[2px] rounded-[2rem] bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm`} />

            <div className="relative bg-white border border-slate-100 rounded-[1.8rem] p-7 shadow-xl shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-slate-300/40 group-hover:-translate-y-2 transition-all duration-500 overflow-hidden text-center flex flex-col items-center gap-5">

                {/* Background gradient wash */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.035] transition-opacity duration-700`} />

                {/* Accent line — sweeps top → bottom on hover */}
                <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden rounded-[1.8rem]">
                    <div className={`absolute left-[10%] right-[10%] h-[2px] bg-gradient-to-r ${gradient} rounded-full opacity-60 -translate-y-full group-hover:translate-y-[calc(var(--card-h,320px))] transition-transform duration-700 ease-in-out`} />
                </div>

                {/* Icon with spinning ring */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                    {/* Rotating dashed ring */}
                    <div className={`absolute inset-0 rounded-full border-2 border-dashed ${ringColor} opacity-30 animate-spin-slow`} />
                    {/* Solid inner circle */}
                    <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Animated counter */}
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

                {/* Mini sparkline bars */}
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
        name: "Sarah Jenkins",
        role: "Head of Marketing",
        tag: "Brand",
        content: "Bookmyinfluencer transformed how we run creator campaigns. The escrow system gives us security, and the creator quality is unmatched.",
        metrics: { label: "Campaign ROI", value: "4.8x" },
        gradient: "from-blue-500 to-indigo-600",
        tagColor: "bg-blue-50 text-blue-600 border-blue-100",
        initial: "S",
    },
    {
        name: "Marco Rossi",
        role: "Tech Content Creator",
        tag: "Creator",
        content: "The process is so much cleaner now. Clear manager updates, easy submission, and I always know exactly where the project stands.",
        metrics: { label: "Brand Deals", value: "12/mo" },
        gradient: "from-violet-500 to-purple-600",
        tagColor: "bg-violet-50 text-violet-600 border-violet-100",
        initial: "M",
    },
    {
        name: "Aisha Patel",
        role: "Creative Director at Vibe",
        tag: "Agency",
        content: "Manager-led workflow is a game changer. Updates stay centralized, coordination stays disciplined, and campaigns close faster.",
        metrics: { label: "Reach Growth", value: "+125%" },
        gradient: "from-rose-500 to-pink-600",
        tagColor: "bg-rose-50 text-rose-600 border-rose-100",
        initial: "A",
    }
]

// ─── Section ──────────────────────────────────────────────────────────────────
export function TestimonialsSection() {
    return (
        <section className="w-full py-12 md:py-16 bg-slate-50 relative overflow-hidden transition-colors duration-500">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 sm:mb-20"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        Proven Results for <span className="text-indigo-600">Industry Leaders</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                        Join thousands of brands and creators who are scaling their impact with our platform.
                    </p>
                </motion.div>

                {/* Animated Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
                    {STATS.map((stat, i) => (
                        <StatCard key={i} {...stat} />
                    ))}
                </div>

                {/* Testimonials Grid — compact, imageless, modern */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -4, transition: { duration: 0.25 } }}
                            className="group relative"
                        >
                            {/* Glow border on hover */}
                            <div className={`absolute -inset-[1.5px] rounded-[1.5rem] bg-gradient-to-br ${t.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-[2px]`} />

                            <div className="relative bg-white border border-slate-100 group-hover:border-transparent rounded-[1.4rem] p-5 flex flex-col gap-4 shadow-md group-hover:shadow-xl transition-all duration-400 overflow-hidden h-full">

                                {/* Accent line — sweeps top → bottom on hover */}
                                <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden rounded-[1.4rem]">
                                    <div className={`absolute left-[8%] right-[8%] h-[2px] bg-gradient-to-r ${t.gradient} rounded-full opacity-50 -translate-y-full group-hover:translate-y-[280px] transition-transform duration-700 ease-in-out`} />
                                </div>

                                {/* Header: quote mark + tag */}
                                <div className="flex items-center justify-between">
                                    {/* Large decorative quote */}
                                    <span className={`text-4xl font-black leading-none bg-gradient-to-br ${t.gradient} bg-clip-text text-transparent select-none`}>&ldquo;</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${t.tagColor}`}>
                                        {t.tag}
                                    </span>
                                </div>

                                {/* Stars */}
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                {/* Quote text */}
                                <p className="text-sm text-slate-600 leading-relaxed font-medium flex-1">
                                    {t.content}
                                </p>

                                {/* Footer: avatar initial + name + metric */}
                                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                    {/* Initial avatar */}
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm`}>
                                        {t.initial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-slate-900 truncate">{t.name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium truncate">{t.role}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className={`text-sm font-black bg-gradient-to-br ${t.gradient} bg-clip-text text-transparent`}>{t.metrics.value}</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.metrics.label}</div>
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
