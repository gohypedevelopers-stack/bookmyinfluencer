"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, ArrowRight, Loader2 } from "lucide-react"

interface ContactSalesModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ContactSalesModal({ isOpen, onClose }: ContactSalesModalProps) {
    const [step, setStep] = useState<"form" | "success">("form")
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        message: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsLoading(false)
        setStep("success")
    }

    const resetForm = () => {
        setFormData({ name: "", email: "", company: "", message: "" })
        setStep("form")
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />


                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto relative"
                        >
                            {/* Premium Decorative Elements - Refined for Light Mode */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                            {/* Header */}
                            <div className="relative px-10 pt-10 pb-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {step === "form" ? "Contact Sales" : "Message Sent!"}
                                    </h2>
                                    <p className="text-slate-600 font-medium">
                                        {step === "form"
                                            ? "Expert guidance for your brand's growth."
                                            : "We'll be in touch with you shortly."}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="relative px-10 pb-10">
                                <AnimatePresence mode="wait">
                                    {step === "form" ? (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                            onSubmit={handleSubmit}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-5">
                                                <div className="grid grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-medium"
                                                            placeholder="John Doe"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Company</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={formData.company}
                                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                            className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-medium"
                                                            placeholder="Acme Inc."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Work Email</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-medium"
                                                        placeholder="john@example.com"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Message</label>
                                                    <textarea
                                                        required
                                                        rows={3}
                                                        value={formData.message}
                                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-medium resize-none"
                                                        placeholder="How can we help you achieve your goals?"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group uppercase tracking-widest text-xs"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Consult Now
                                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.form>
                                    ) : (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                            className="py-10 text-center"
                                        >
                                            <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-xl shadow-indigo-50">
                                                <CheckCircle className="w-12 h-12" />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Request Received</h3>
                                            <p className="text-slate-600 mb-10 max-w-[320px] mx-auto font-medium text-lg leading-relaxed">
                                                Our executive team will analyze your requirements and reach out within 24 hours.
                                            </p>
                                            <button
                                                onClick={resetForm}
                                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all border border-slate-200"
                                            >
                                                Return to Site
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
