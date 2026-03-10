"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Users, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface JoinSelectionModalProps {
    isOpen: boolean
    onClose: () => void
}

export function JoinSelectionModal({ isOpen, onClose }: JoinSelectionModalProps) {
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Dark Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-3xl bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 text-slate-400 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        <div className="p-4 sm:p-8">
                            <div className="text-center mb-6 sm:mb-8">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 tracking-tight uppercase italic underline decoration-indigo-600/30 underline-offset-8">Join Bookmy<span className="text-indigo-600">influencer</span></h2>
                                <p className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-3">Choose your path to excellence</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                {/* Creator Card */}
                                <Link
                                    href="/register"
                                    onClick={onClose}
                                    className="group relative flex flex-col p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:bg-white hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <div className="mb-4 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1 tracking-tight group-hover:text-indigo-600 transition-colors">Join as a Creator</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-4 text-xs sm:text-sm flex-grow">
                                        Find deals, showcase portfolio, and grow collaborations.
                                    </p>
                                    <div className="flex items-center text-indigo-600 font-extrabold tracking-widest text-[9px] sm:text-[10px] uppercase">
                                        Continue as Creator
                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>

                                {/* Brand Card */}
                                <Link
                                    href="/brand/register"
                                    onClick={onClose}
                                    className="group relative flex flex-col p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:bg-white hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="mb-4 w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1 tracking-tight group-hover:text-blue-600 transition-colors">Join as a Brand</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-4 text-xs sm:text-sm flex-grow">
                                        Launch campaigns and manage collaborations easily.
                                    </p>
                                    <div className="flex items-center text-blue-600 font-extrabold tracking-widest text-[9px] sm:text-[10px] uppercase">
                                        Continue as Brand
                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </div>

                            <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
                                <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em]">
                                    Already have an account? <Link href="/login" onClick={onClose} className="text-slate-900 font-black hover:text-indigo-600 transition-colors underline-offset-4">Log in here</Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
