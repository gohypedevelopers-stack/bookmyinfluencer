"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Container } from "@/components/container"

// Define the content for both modes
const stepsData = {
    brand: [
        {
            step: "1",
            title: "Setup Campaign",
            desc: "Enter campaign brief, filters, and total budget. The system auto-matches verified micro creators.",
            icon: "search"
        },
        {
            step: "2",
            title: "Pay & Activate",
            desc: "Confirm upfront payment to lock selected creators and activate manager-led execution.",
            icon: "chat"
        },
        {
            step: "3",
            title: "Manager Delivery",
            desc: "Project manager handles all communication, reviews creator submissions, and sends final updates to your team.",
            icon: "check_circle"
        }
    ],
    creator: [
        {
            step: "1",
            title: "Receive Invitation",
            desc: "Get paid campaign invitations matched to your niche, location, and engagement quality.",
            icon: "person"
        },
        {
            step: "2",
            title: "Work with Manager",
            desc: "Accept invitation and coordinate only with your assigned project manager for instructions and updates.",
            icon: "handshake"
        },
        {
            step: "3",
            title: "Submit & Get Paid",
            desc: "Submit deliverable link for review. After completion, payout is manually processed by the platform team.",
            icon: "attach_money"
        }
    ]
}

export function WorkflowSection() {
    const [activeTab, setActiveTab] = useState<'brand' | 'creator'>('brand')


    return (
        <section className="w-full py-16 md:py-24 bg-transparent text-center overflow-hidden transition-colors duration-500">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                        Streamlined <span className="text-indigo-600">Workflow</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 mb-12 md:mb-16 max-w-2xl mx-auto font-medium">
                        Clear, manager-led operations for brands and creators with controlled communication and predictable outcomes.
                    </p>
                </motion.div>

                {/* Dynamic Toggle - Refined Light Mode */}
                <div className="flex justify-center mb-16">
                    <div className="bg-slate-100 border border-slate-200 p-2 rounded-[2rem] inline-flex relative shadow-inner">
                        {/* Animated Background Pill */}
                        <motion.div
                            className="absolute inset-y-2 bg-indigo-600 rounded-[1.5rem] shadow-lg shadow-indigo-200 z-0"
                            layoutId="activeTabBackground"
                            initial={false}
                            animate={{
                                left: activeTab === 'brand' ? '8px' : '50%',
                                width: 'calc(50% - 8px)',
                                x: 0
                            }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />

                        <button
                            onClick={() => setActiveTab('brand')}
                            className={`relative z-10 px-6 sm:px-14 py-4 rounded-[1.5rem] text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-500 ${activeTab === 'brand' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            I'm a Brand
                        </button>
                        <button
                            onClick={() => setActiveTab('creator')}
                            className={`relative z-10 px-6 sm:px-14 py-4 rounded-[1.5rem] text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-500 ${activeTab === 'creator' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            I'm a Creator
                        </button>
                    </div>
                </div>

                {/* Steps Grid */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Connecting Line (Desktop) - Softer for Light Mode */}
                    <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10" />

                    <div className="grid md:grid-cols-3 gap-16 md:gap-8">
                        <AnimatePresence initial={false}>
                            {stepsData[activeTab].map((item, i) => (
                                <motion.div
                                    key={`${activeTab}-${i}`}
                                    initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex flex-col items-center group relative px-4"
                                >
                                    <div className="relative mb-8 sm:mb-10 w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
                                        {/* Outer Rotating Ring */}
                                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-200 animate-spin-slow group-hover:border-indigo-600/30 transition-colors" />

                                        {/* Main Step Circle */}
                                        <div className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-100 z-10 
                      transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg] group-hover:border-indigo-600 group-hover:shadow-indigo-100 ${activeTab === 'brand' ? 'text-indigo-600' : 'text-blue-600'
                                            }`}
                                        >
                                            <span className="text-3xl sm:text-4xl font-bold italic tracking-tighter text-slate-900">{item.step}</span>
                                        </div>

                                        {/* Premium Glow */}
                                        <div className={`absolute inset-4 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${activeTab === 'brand' ? 'bg-indigo-600' : 'bg-blue-600'
                                            }`}
                                        />
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 mb-5 tracking-tight group-hover:text-indigo-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 max-w-xs mx-auto leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </Container>
        </section>
    )
}
