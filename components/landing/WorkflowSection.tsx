"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Container } from "@/components/container"

// Define the content for both modes
const stepsData = {
    brand: [
        {
            step: "1",
            title: "Search & Filter",
            desc: "Use advanced filters to find the perfect creator match based on niche, engagement rate, and location.",
            icon: "search"
        },
        {
            step: "2",
            title: "Negotiate & Fund",
            desc: "Agree on terms directly via our chat. Deposit funds safely into escrow to start the project.",
            icon: "chat"
        },
        {
            step: "3",
            title: "Approve & Release",
            desc: "Review the content. Once satisfied, release the payment to the creator instantly.",
            icon: "check_circle"
        }
    ],
    creator: [
        {
            step: "1",
            title: "Create Profile",
            desc: "Build a stunning portfolio showcasing your best work, stats, and pricing packages to attract top brands.",
            icon: "person"
        },
        {
            step: "2",
            title: "Get Hired",
            desc: "Receive direct offers or apply to open campaigns. negotiate terms and secure the deal.",
            icon: "handshake"
        },
        {
            step: "3",
            title: "Create & Earn",
            desc: "Deliver high-quality content, get approval, and receive instant payment directly to your wallet.",
            icon: "attach_money"
        }
    ]
}

export function WorkflowSection() {
    const [activeTab, setActiveTab] = useState<'brand' | 'creator'>('brand')

    return (
        <section className="w-full py-24 bg-white text-center overflow-hidden">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-display tracking-tight">
                        Streamlined Workflow
                    </h2>
                    <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
                        Whether you're hiring or getting hired, we've made the process simple, secure, and fast.
                    </p>
                </motion.div>

                {/* Dynamic Toggle */}
                <div className="flex justify-center mb-16">
                    <div className="bg-slate-100 p-1.5 rounded-full inline-flex relative shadow-inner">
                        {/* Animated Background Pill */}
                        <motion.div
                            className="absolute inset-y-1.5 bg-white rounded-full shadow-sm z-0"
                            layoutId="activeTabBackground"
                            initial={false}
                            animate={{
                                left: activeTab === 'brand' ? '6px' : '50%',
                                width: 'calc(50% - 6px)',
                                x: activeTab === 'brand' ? 0 : 0 // Adjust if needed, but left/width is usually enough for simple toggle
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />

                        <button
                            onClick={() => setActiveTab('brand')}
                            className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${activeTab === 'brand' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            I'm a Brand
                        </button>
                        <button
                            onClick={() => setActiveTab('creator')}
                            className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${activeTab === 'creator' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            I'm a Creator
                        </button>
                    </div>
                </div>

                {/* Steps Grid */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10" />

                    <div className="grid md:grid-cols-3 gap-12">
                        <AnimatePresence mode="wait">
                            {stepsData[activeTab].map((item, i) => (
                                <motion.div
                                    key={`${activeTab}-${i}`}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="flex flex-col items-center group"
                                >
                                    <div className="relative mb-8">
                                        <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-50 z-10 
                      transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl ${activeTab === 'brand' ? 'text-blue-600' : 'text-purple-600'
                                            }`}
                                        >
                                            <span className="text-3xl font-bold">{item.step}</span>
                                        </div>
                                        {/* Decorative Ring */}
                                        <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 animate-ping ${activeTab === 'brand' ? 'bg-blue-400' : 'bg-purple-400'
                                            }`}
                                        />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-slate-700 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
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
