"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Users, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface JoinSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    onOpenLoginModal?: () => void
}

export function JoinSelectionModal({ isOpen, onClose, onOpenLoginModal }: JoinSelectionModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown)
            // Prevent body scroll
            document.body.style.overflow = 'hidden'
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center sm:justify-end p-4 sm:p-6 pt-16 sm:pt-6 sm:pr-12 pointer-events-none">
                    {/* Dark Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] pointer-events-auto"
                    />

                    {/* Modal Content */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: -20, x: 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20, x: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden pointer-events-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 text-slate-400 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        <div className="p-5 sm:p-6">
                            <div className="text-center mb-6">
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase italic underline decoration-emerald-500/30 underline-offset-4">Join Our Platform</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {/* Creator Card */}
                                <Link
                                    href="/register"
                                    onClick={onClose}
                                    className="group relative flex items-center p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl transition-all duration-300 hover:bg-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-100/50"
                                >
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4 text-left">
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Join as a Creator</h3>
                                        <p className="text-slate-500 text-[11px] font-medium leading-tight">Partnerships & Growth</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 ml-auto text-emerald-600 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                {/* Brand Card */}
                                <Link
                                    href="/brand/register"
                                    onClick={onClose}
                                    className="group relative flex items-center p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl transition-all duration-300 hover:bg-white hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-100/50"
                                >
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4 text-left">
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Join as a Brand</h3>
                                        <p className="text-slate-500 text-[11px] font-medium leading-tight">Campaigns & Strategy</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 ml-auto text-indigo-600 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
                                <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em]">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="text-slate-900 font-bold hover:text-indigo-600 transition-colors underline decoration-indigo-500/30 underline-offset-4"
                                >
                                    Log in here
                                </Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
