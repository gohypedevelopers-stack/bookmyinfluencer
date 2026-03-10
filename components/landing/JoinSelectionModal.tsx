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
                        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 text-slate-400 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8 sm:p-12">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Join Bookmyinfluencer</h2>
                                <p className="text-slate-600 font-medium text-lg">Choose how you want to continue your journey</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Creator Card */}
                                <Link
                                    href="/register"
                                    onClick={onClose}
                                    className="group relative flex flex-col p-8 bg-slate-50 border border-slate-200 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:bg-white hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <div className="mb-8 w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">Join as a Creator</h3>
                                    <p className="text-slate-600 font-medium leading-relaxed mb-10 flex-grow">
                                        Find brand deals, showcase your profile, and grow your collaborations with industry leaders.
                                    </p>
                                    <div className="flex items-center text-indigo-600 font-black uppercase tracking-widest text-sm">
                                        Continue as Creator
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </Link>

                                {/* Brand Card */}
                                <Link
                                    href="/brand/register"
                                    onClick={onClose}
                                    className="group relative flex flex-col p-8 bg-slate-50 border border-slate-200 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:bg-white hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="mb-8 w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">Join as a Brand</h3>
                                    <p className="text-slate-600 font-medium leading-relaxed mb-10 flex-grow">
                                        Discover verified creators, launch campaigns, and manage collaborations easily in one place.
                                    </p>
                                    <div className="flex items-center text-blue-600 font-black uppercase tracking-widest text-sm">
                                        Continue as Brand
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </Link>
                            </div>

                            <p className="text-center mt-12 text-slate-400 font-medium text-sm">
                                Already have an account? <Link href="/login" onClick={onClose} className="text-slate-900 font-black hover:underline underline-offset-4">Log in</Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
