"use client"

import { Button } from "@/components/ui/button"
import { FileText, Mail, IndianRupee, CheckCircle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"

type ActivityType = 'DRAFT_SUBMITTED' | 'APPLICATION_RECEIVED' | 'PAYMENT_RELEASED' | 'CAMPAIGN_COMPLETED' | string

interface Activity {
    id: string
    type: string
    title: string
    subtitle: string
    time: string
    actionLabel?: string
    actionLink?: string
}

interface RecentActivityProps {
    activities: Activity[]
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function RecentActivity({ activities }: RecentActivityProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'DRAFT_SUBMITTED':
            case 'MESSAGE':
                return <FileText className="w-4 h-4 text-blue-600" />
            case 'APPLICATION_RECEIVED':
            case 'OFFER':
            case 'COLLAB_REQUEST':
                return <Mail className="w-4 h-4 text-emerald-600" />
            case 'PAYMENT_RELEASED':
            case 'ESCROW':
                return <IndianRupee className="w-4 h-4 text-amber-600" />
            case 'CAMPAIGN_COMPLETED':
                return <CheckCircle className="w-4 h-4 text-violet-600" />
            case 'SYSTEM':
            default:
                return <Clock className="w-4 h-4 text-slate-500" />
        }
    }

    const getBgColor = (type: string) => {
        switch (type) {
            case 'DRAFT_SUBMITTED':
            case 'MESSAGE': return 'bg-blue-50 border-blue-100 shadow-blue-100/50'
            case 'APPLICATION_RECEIVED':
            case 'OFFER':
            case 'COLLAB_REQUEST': return 'bg-emerald-50 border-emerald-100 shadow-emerald-100/50'
            case 'PAYMENT_RELEASED':
            case 'ESCROW': return 'bg-amber-50 border-amber-100 shadow-amber-100/50'
            case 'CAMPAIGN_COMPLETED': return 'bg-violet-50 border-violet-100 shadow-violet-100/50'
            case 'SYSTEM':
            default: return 'bg-slate-50 border-slate-100 shadow-slate-100/50'
        }
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 shadow-lg shadow-slate-200/30 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Recent Activity</h3>
                <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50 hover:text-indigo-700 rounded-xl px-4 group transition-colors">
                    View all 
                    <ArrowRight className="w-4 h-4 ml-1.5 opacity-70 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3 relative z-10"
            >
                {activities.map((activity) => (
                    <motion.div key={activity.id} variants={itemVariants} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white/50 border border-slate-100 hover:border-indigo-100 rounded-2xl hover:bg-indigo-50/30 transition-all duration-300 gap-4 shadow-sm hover:shadow-md hover:shadow-indigo-100/40">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm group-hover:scale-110 transition-transform duration-300 ${getBgColor(activity.type)}`}>
                                {getIcon(activity.type)}
                            </div>
                            <div>
                                <p className="text-slate-900 font-bold text-[15px] tracking-tight line-clamp-1">{activity.title}</p>
                                <p className="text-[13px] font-medium text-slate-500 mt-0.5">{activity.time} <span className="mx-1 text-slate-300">•</span> {activity.subtitle}</p>
                            </div>
                        </div>
                        {activity.actionLabel && activity.actionLink && activity.actionLink !== '#' ? (
                            <Link href={activity.actionLink}>
                                <Button variant="secondary" size="sm" className="bg-white border-slate-200 shadow-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 shrink-0 rounded-xl px-5 transition-colors">
                                    {activity.actionLabel}
                                </Button>
                            </Link>
                        ) : activity.actionLabel ? (
                            <Button variant="secondary" size="sm" disabled className="bg-slate-50 border border-slate-200 text-slate-400 shrink-0 opacity-50 cursor-not-allowed rounded-xl px-5 font-bold">
                                {activity.actionLabel}
                            </Button>
                        ) : null}
                    </motion.div>
                ))}

                {activities.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No recent activity.</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}
