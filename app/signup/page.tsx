"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Container } from "@/components/container"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { GateReveal } from "@/components/GateReveal"
import { Building2, UserCircle, ArrowRight, Sparkles } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      
      <GateReveal>
        <div className="relative flex-1 flex flex-col">
          {/* Background Ambient Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-pink-400/10 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '7s' }} />
            
            {/* Subtle floating particles */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay" />
          </div>

          <Container className="pt-24 pb-32 relative z-10 flex-1 flex flex-col justify-center">
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-4xl mx-auto mb-16 md:mb-24"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm"
              >
                <Sparkles className="w-6 h-6 text-indigo-500" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 mb-8 tracking-tight pb-2">
                Join BookMyInfluencer
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                Welcome to the leading platform for book marketing. Choose your path below and start growing with our community today.
              </p>
            </motion.div>

            {/* Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto w-full">
              
              {/* Brand Card */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[3rem] opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-700"></div>
                <div className="relative h-full bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.1)] flex flex-col items-center text-center overflow-hidden transition-transform duration-500 group-hover:-translate-y-2">
                  
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                  <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center mb-8 shadow-inner border border-indigo-100 group-hover:scale-110 transition-transform duration-500">
                    <Building2 className="w-12 h-12 text-indigo-600" />
                  </div>
                  
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-4">I am a Brand</h2>
                  <p className="text-slate-600 mb-10 text-lg leading-relaxed flex-1">
                    Discover top book influencers, launch campaigns, track analytics, and manage secure escrow payments all in one place.
                  </p>
                  
                  <Link 
                    href="/brand/register"
                    className="w-full relative overflow-hidden px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-sm hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                  >
                    <div className="absolute inset-0 bg-indigo-600 translate-x-[-100%] group-hover/btn:translate-x-[0%] transition-transform duration-500 ease-out" />
                    <span className="relative z-10 flex items-center gap-2">
                      Register as a Brand
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Link>
                </div>
              </motion.div>

              {/* Creator Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[3rem] opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-700"></div>
                <div className="relative h-full bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.1)] flex flex-col items-center text-center overflow-hidden transition-transform duration-500 group-hover:-translate-y-2">
                  
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                  <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center mb-8 shadow-inner border border-emerald-100 group-hover:scale-110 transition-transform duration-500">
                    <UserCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                  
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-4">I am a Creator</h2>
                  <p className="text-slate-600 mb-10 text-lg leading-relaxed flex-1">
                    Connect with publishers, receive free books for review, apply to paid campaigns, and monetize your growing audience securely.
                  </p>
                  
                  <Link 
                    href="/register"
                    className="w-full relative overflow-hidden px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                  >
                    <div className="absolute inset-0 bg-emerald-600 translate-x-[-100%] group-hover/btn:translate-x-[0%] transition-transform duration-500 ease-out" />
                    <span className="relative z-10 flex items-center gap-2">
                      Register as a Creator
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Link>
                </div>
              </motion.div>

            </div>
          </Container>
        </div>
      </GateReveal>
      
      <Footer />
    </div>
  )
}
