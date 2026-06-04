"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"

interface Influencer {
    id: string
    name: string
    niche: string
    profileImage: string
    stats: {
        followers: string | number
        engagement: string | number
        match: number
    }
}

interface RecommendedInfluencersProps {
    influencers: Influencer[]
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
}

export function RecommendedInfluencers({ influencers }: RecommendedInfluencersProps) {
    const [startIndex, setStartIndex] = useState(0)
    const itemsPerPage = 3

    const canGoBack = startIndex > 0
    const canGoForward = startIndex + itemsPerPage < influencers.length

    const visibleInfluencers = influencers.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Micro Influencer Signals</h2>
                        <div className="absolute -top-3 -right-6 text-amber-400">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                    </div>
                    <span className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        AI Matches
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className={`h-9 w-9 rounded-full border-slate-200 shadow-sm transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 ${!canGoBack ? 'opacity-40 cursor-not-allowed' : ''}`} onClick={() => canGoBack && setStartIndex((prev) => Math.max(0, prev - itemsPerPage))} disabled={!canGoBack}>
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="outline" size="icon" className={`h-9 w-9 rounded-full border-slate-200 shadow-sm transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 ${!canGoForward ? 'opacity-40 cursor-not-allowed' : ''}`} onClick={() => canGoForward && setStartIndex((prev) => Math.min(influencers.length - itemsPerPage, prev + itemsPerPage))} disabled={!canGoForward}>
                        <ArrowRight className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {visibleInfluencers.map((influencer) => (
                        <motion.div key={influencer.id} variants={cardVariants} initial="hidden" animate="show" exit="exit" layoutId={influencer.id}>
                            <Card className="p-5 border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/30 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-indigo-100/50 hover:border-indigo-100 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-indigo-500/15" />
                                
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-3.5">
                                        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                                            <Image
                                                src={influencer.profileImage && influencer.profileImage.length > 0 ? influencer.profileImage : "/images/elena.png"}
                                                alt={influencer.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-black text-slate-900 text-sm tracking-tight">{influencer.name}</h3>
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500">{influencer.niche || "General"}</p>
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowRight className="w-4 h-4 text-indigo-500 -rotate-45" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2.5 text-center bg-slate-50/80 rounded-2xl p-3 border border-slate-100 relative z-10">
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Followers</p>
                                        <p className="font-black text-sm text-slate-800 tracking-tight">
                                            {typeof influencer.stats.followers === 'number' ? Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(influencer.stats.followers) : influencer.stats.followers}
                                        </p>
                                    </div>
                                    <div className="flex flex-col justify-center border-x border-slate-200/60 px-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Eng</p>
                                        <p className="font-black text-sm text-emerald-600 tracking-tight">{influencer.stats.engagement}%</p>
                                    </div>
                                    <div className="flex flex-col justify-center relative">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Match</p>
                                        <div className="flex items-center justify-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            <p className="font-black text-sm text-blue-600 tracking-tight">{influencer.stats.match}%</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {visibleInfluencers.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200 border-dashed">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2">No creators found</h3>
                        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">We're constantly expanding our network. Check back later or adjust your campaign parameters.</p>
                        <Link href="/brand/campaigns/new">
                            <Button className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:-translate-y-0.5 transition-all">
                                Create New Campaign
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}

