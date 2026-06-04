"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Container } from "@/components/container"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { GateReveal } from "@/components/GateReveal"
import { Mail, MapPin, Phone, Send, Sparkles, MessageSquare } from "lucide-react"

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" })
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      
      <GateReveal>
        <div className="relative flex-1 flex flex-col">
          {/* Background Ambient Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
            <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '9s' }} />
            <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-rose-400/10 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>

          <Container className="pt-24 pb-24 relative z-10 flex-1">
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
                className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-violet-50 border border-violet-100 shadow-sm"
              >
                <MessageSquare className="w-6 h-6 text-violet-500" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-8 tracking-tight pb-2">
                Get in Touch
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                Whether you're a brand looking for the perfect campaign or an influencer ready to collaborate, our team is here to help you start your journey.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Contact Info Cards */}
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-5 flex flex-col gap-6"
              >
                <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.1)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-violet-500" />
                    Contact Information
                  </h3>

                  <div className="flex flex-col gap-8">
                    {/* Email Card */}
                    <motion.a 
                      href="mailto:contact@bookmyinfluencer.com"
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-start gap-5 group/item"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-300 shadow-sm">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Us</p>
                        <p className="text-lg font-bold text-slate-900 group-hover/item:text-indigo-600 transition-colors">contact@bookmyinfluencer.com</p>
                      </div>
                    </motion.a>

                    {/* Location Card */}
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-start gap-5 group/item cursor-default"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover/item:bg-violet-600 group-hover/item:text-white transition-all duration-300 shadow-sm">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Our Office</p>
                        <p className="text-lg font-bold text-slate-900">Amsterdam, Netherlands</p>
                        <p className="text-slate-500 text-sm mt-1">KVK 60509295</p>
                      </div>
                    </motion.div>

                    {/* Phone Card (Optional aesthetic addition) */}
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-start gap-5 group/item cursor-default"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover/item:bg-rose-600 group-hover/item:text-white transition-all duration-300 shadow-sm">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Call Us</p>
                        <p className="text-lg font-bold text-slate-900">+31 (0) 20 123 4567</p>
                        <p className="text-slate-500 text-sm mt-1">Mon-Fri, 9am-6pm CET</p>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Aesthetic mini card */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-600/20">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <h4 className="text-xl font-bold mb-2 relative z-10">Quick Support</h4>
                  <p className="text-indigo-100 font-medium relative z-10">
                    Already a member? Reach out directly via your dashboard manager chat for priority support.
                  </p>
                </div>
              </motion.div>

              {/* Right Column: Contact Form */}
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="lg:col-span-7"
              >
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] border border-slate-100 relative">
                  
                  <h3 className="text-3xl font-bold text-slate-900 mb-8">Send a Message</h3>
                  
                  <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                    {/* Name & Email Row */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Your Name</label>
                        <input 
                          type="text" 
                          placeholder="John Doe"
                          className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white focus:shadow-sm transition-all duration-300"
                        />
                      </div>
                      
                      <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="john@example.com"
                          className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white focus:shadow-sm transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="relative">
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Subject</label>
                      <input 
                        type="text" 
                        placeholder="How can we help?"
                        className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white focus:shadow-sm transition-all duration-300"
                      />
                    </div>

                    {/* Message */}
                    <div className="relative">
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Message</label>
                      <textarea 
                        rows={5}
                        placeholder="Tell us about your project or inquiry..."
                        className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white focus:shadow-sm transition-all duration-300 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      onMouseEnter={() => setIsHoveringSubmit(true)}
                      onMouseLeave={() => setIsHoveringSubmit(false)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="relative mt-4 w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg overflow-hidden flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Send Message
                        <motion.div
                          animate={isHoveringSubmit ? { x: 3, y: -3 } : { x: 0, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <Send className="w-5 h-5" />
                        </motion.div>
                      </span>
                    </motion.button>
                  </form>
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
