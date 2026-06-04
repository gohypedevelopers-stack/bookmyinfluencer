"use client"

import { Card } from "@/components/ui/card"
import { motion, type Variants } from "framer-motion"

interface BrandStatsProps {
    stats: {
        totalSpent: number
        activeEscrow: number
        completedCampaigns: number
    }
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function BrandStats({ stats }: BrandStatsProps) {
    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
            <motion.div variants={itemVariants}>
                <Card className="relative overflow-hidden rounded-3xl border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-lg shadow-indigo-100/40 p-6 transition-all hover:shadow-xl hover:-translate-y-1 hover:shadow-indigo-200/50 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-indigo-500/15" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-widest">Total Budget Spent</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                                ₹{stats.totalSpent.toLocaleString()}
                            </h3>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                            +12.4%
                        </div>
                    </div>
                    <div className="w-full bg-slate-100/80 rounded-full h-1.5 mt-2 relative overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" 
                        />
                    </div>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="relative overflow-hidden rounded-3xl border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-lg shadow-blue-100/40 p-6 transition-all hover:shadow-xl hover:-translate-y-1 hover:shadow-blue-200/50 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-blue-500/15" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-widest">Active Escrows</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                                ₹{stats.activeEscrow.toLocaleString()}
                            </h3>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                            Stable
                        </div>
                    </div>
                    <div className="flex gap-1.5 mt-4 relative z-10">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div 
                                key={i} 
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.4, delay: 0.1 * i }}
                                className={`h-8 flex-1 rounded-md origin-bottom ${i > 3 ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-md shadow-blue-200' : 'bg-blue-50'}`}
                            />
                        ))}
                    </div>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="relative overflow-hidden rounded-3xl border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-lg shadow-purple-100/40 p-6 transition-all hover:shadow-xl hover:-translate-y-1 hover:shadow-purple-200/50 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-purple-500/15" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-widest">Completed Campaigns</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                                {stats.completedCampaigns}
                            </h3>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                            -2%
                        </div>
                    </div>
                    <div className="flex gap-1.5 mt-4 items-end h-8 relative z-10">
                        {[40, 70, 45, 90, 65, 100].map((height, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.5, delay: 0.1 * i, type: "spring" }}
                                className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-sm shadow-sm" 
                            />
                        ))}
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    )
}
