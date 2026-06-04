"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Container } from "@/components/container"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { GateReveal } from "@/components/GateReveal"
import { Sparkles, Plus, Minus, HelpCircle } from "lucide-react"

const FAQ_DATA = [
  {
    category: "For Creators",
    questions: [
      {
        q: "How do I get started as a book influencer?",
        a: "Getting started is easy! Click 'Sign Up Today' and select the Creator path. Fill out your profile, link your social accounts (like Instagram or TikTok), and you can start applying for active book campaigns immediately."
      },
      {
        q: "Are the campaigns paid or gifted?",
        a: "We offer a mix of both. Some campaigns provide free ARCs (Advance Reader Copies) or finished books in exchange for an honest review, while others offer monetary compensation on top of the book. You can filter and apply to the ones that fit your goals."
      },
      {
        q: "How do I get paid?",
        a: "Payments are processed securely through our platform. Once you complete your deliverables and the brand approves them, the funds held in escrow are released directly to your connected bank account or digital wallet."
      }
    ]
  },
  {
    category: "For Brands & Publishers",
    questions: [
      {
        q: "How does the secure escrow system work?",
        a: "To protect both parties, campaign funds are deposited into a secure escrow account when a collaboration begins. The funds are only released to the influencer once you have reviewed and approved the agreed-upon deliverables."
      },
      {
        q: "Can I filter influencers by specific genres?",
        a: "Absolutely. Our advanced Discovery tool allows you to filter creators by preferred genres (like YA, Thriller, Romance), platforms, follower count, and engagement rate to ensure the perfect match for your book."
      },
      {
        q: "What if an influencer doesn't post on time?",
        a: "Our manager-led channels include automated reminders and dedicated support. If a creator fails to meet the deadline without communication, the escrow funds will be returned to you."
      }
    ]
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>("For Creators-0")

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      
      <GateReveal>
        <div className="relative flex-1 flex flex-col pb-24">
          {/* Background Ambient Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '9s' }} />
            <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[60%] bg-violet-400/10 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '7s' }} />
            
            {/* Subtle floating particles */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] mix-blend-overlay" />
          </div>

          <Container className="pt-24 relative z-10 flex-1">
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm"
              >
                <HelpCircle className="w-6 h-6 text-indigo-500" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 mb-8 tracking-tight pb-2">
                Frequently Asked
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                Everything you need to know about BookMyInfluencer, campaigns, payments, and our community.
              </p>
            </motion.div>

            {/* FAQ Accordion Section */}
            <div className="max-w-4xl mx-auto">
              {FAQ_DATA.map((section, sectionIdx) => (
                <motion.div 
                  key={section.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: sectionIdx * 0.2 }}
                  className="mb-12"
                >
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    {section.category}
                  </h2>
                  
                  <div className="flex flex-col gap-4">
                    {section.questions.map((faq, qIdx) => {
                      const id = `${section.category}-${qIdx}`
                      const isOpen = openIndex === id

                      return (
                        <motion.div 
                          key={id}
                          layout
                          className="bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] group"
                        >
                          <button
                            onClick={() => toggleAccordion(id)}
                            className="w-full px-6 py-6 md:px-8 md:py-6 flex items-center justify-between gap-6 text-left transition-colors duration-300 hover:bg-white/40 focus:outline-none"
                          >
                            <span className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">
                              {faq.q}
                            </span>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 rotate-180' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                              {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </div>
                          </button>
                          
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                key="content"
                                initial="collapsed"
                                animate="open"
                                exit="collapsed"
                                variants={{
                                  open: { opacity: 1, height: "auto", marginBottom: 24 },
                                  collapsed: { opacity: 0, height: 0, marginBottom: 0 }
                                }}
                                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                              >
                                <div className="px-6 md:px-8 text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                                  {faq.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Still have questions CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-20 max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2.5rem] p-10 md:p-14 text-center text-white shadow-[0_20px_50px_-15px_rgba(79,70,229,0.5)] relative overflow-hidden"
            >
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              
              <div className="relative z-10 flex flex-col items-center">
                <h3 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Still have questions?</h3>
                <p className="text-indigo-100 text-lg mb-8 max-w-xl font-medium">
                  Can't find the answer you're looking for? Our dedicated support team is ready to help you out.
                </p>
                <a 
                  href="/contact"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Contact Support
                </a>
              </div>
            </motion.div>
          </Container>
        </div>
      </GateReveal>
      
      <Footer />
    </div>
  )
}
