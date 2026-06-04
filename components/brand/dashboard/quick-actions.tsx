"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Briefcase, PlusCircle, Users, ArrowRight } from "lucide-react"
import { motion, type Variants } from "framer-motion"

interface QuickActionsProps {
    unreadMessageCount?: number
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function QuickActions({ unreadMessageCount = 0 }: QuickActionsProps) {
    void unreadMessageCount
    const actions = [
        {
            name: "Create Campaign",
            href: "/brand/campaigns/new",
            icon: PlusCircle,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-100",
            hoverBg: "hover:bg-blue-100/50 hover:border-blue-200"
        },
        {
            name: "Open Campaigns",
            href: "/brand/campaigns",
            icon: Briefcase,
            color: "text-indigo-600",
            bg: "bg-indigo-50 border-indigo-100",
            hoverBg: "hover:bg-indigo-100/50 hover:border-indigo-200"
        },
        {
            name: "Selection Queue",
            href: "/brand/campaigns",
            icon: Users,
            color: "text-violet-600",
            bg: "bg-violet-50 border-violet-100",
            hoverBg: "hover:bg-violet-100/50 hover:border-violet-200"
        },
    ]

    return (
        <Card className="p-6 rounded-3xl border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-200/30 h-fit relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-indigo-500/10" />
            
            <h3 className="font-black text-slate-800 mb-5 uppercase text-[11px] tracking-widest relative z-10">Quick Actions</h3>
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3 relative z-10"
            >
                {actions.map((action, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <Link href={action.href} className={`flex items-center justify-between p-3 rounded-2xl border border-transparent transition-all duration-300 group/item hover:shadow-sm ${action.hoverBg}`}>
                            <div className="flex items-center gap-3.5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${action.bg} ${action.color} group-hover/item:scale-110 group-hover/item:rotate-3 transition-transform duration-300 shadow-sm`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-slate-600 group-hover/item:text-slate-900 transition-colors">{action.name}</span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </Card>
    )
}

