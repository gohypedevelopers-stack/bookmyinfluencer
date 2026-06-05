"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Container } from "@/components/container"
import { Star, ArrowRight, CheckCircle2, Target, Eye, Flag, Users, Briefcase, Award, Zap, TrendingUp, Globe, MapPin, Mail, Phone } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { GateReveal } from "@/components/GateReveal"

// Keep the existing team members but we'll adapt them to the new layout
const teamMembers = [
  {
    role: "Community Manager",
    name: "Paula",
    bio: "Paula is the go-to person for all participating book influencers. She makes sure the creator side of our network is thriving and completely supported.",
    email: "paula@bookmyinfluencer.com",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Campaign Manager",
    name: "Ona",
    bio: "Ona runs TikTok book tours and brand campaigns. A master of contemporary romance and fantasy, she knows exactly how to make campaigns viral.",
    email: "ona@bookmyinfluencer.com",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Campaign Manager",
    name: "Maree",
    bio: "Maree helps new clients set up their book tours flawlessly. With deep industry knowledge, she ensures that every campaign reaches its peak potential.",
    email: "maree@bookmyinfluencer.com",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Founder & CEO",
    name: "Saskia",
    bio: "Saskia loves a well-paced thriller and started building this platform in 2021. She is deeply involved in day-to-day operations and strategic growth.",
    email: "saskia@bookmyinfluencer.com",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Campaign Manager",
    name: "Helen",
    bio: "Working with our top international clients, Helen ensures our campaigns transcend borders and resonate deeply with diverse global audiences.",
    email: "helen@bookmyinfluencer.com",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Editor",
    name: "Jenny",
    bio: "Jenny ensures all communications, newsletters, and blogs are perfectly polished before they are published. A vital part of our brand voice.",
    email: "jenny@bookmyinfluencer.com",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=400&h=400",
  }
]

const stats = [
    { icon: Users, value: "50K+", label: "Verified Creators" },
    { icon: Briefcase, value: "12K+", label: "Completed Campaigns" },
    { icon: Globe, value: "850M+", label: "Audience Reach" },
    { icon: Award, value: "99%", label: "Satisfaction Rate" }
];

const missionTabs = [
    {
        id: "mission",
        label: "OUR MISSION",
        icon: Target,
        title: "Empowering creators and brands to build authentic connections",
        content: "Our mission is to bridge the gap between visionary brands and influential creators. We believe that authentic storytelling is the most powerful marketing tool, and we provide the platform, security, and tools needed to make these collaborations seamless, scalable, and successful."
    },
    {
        id: "vision",
        label: "OUR VISION",
        icon: Eye,
        title: "To be the global standard for influencer marketing",
        content: "We envision a world where every brand, from indie publishers to global enterprises, can effortlessly discover and collaborate with the perfect creators. We are building an ecosystem where creativity is valued, payments are secure, and performance is fully transparent."
    },
    {
        id: "goal",
        label: "OUR GOAL",
        icon: Flag,
        title: "Unlocking unprecedented growth for our users",
        content: "Our primary goal is to drive tangible results. We strive to help brands achieve their highest ROI while enabling creators to monetize their passion sustainably. We measure our success entirely by the success and satisfaction of our vibrant community."
    }
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState(missionTabs[0].id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      <Navbar />
      
      <GateReveal>
        <main className="flex-1 w-full flex flex-col">
          
          {/* Section 1: Hero Banner */}
          <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2850" 
                    alt="About Us Background" 
                    fill 
                    className="object-cover object-center scale-105"
                    priority
                />
                {/* Dark Indigo Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-violet-900/80 to-slate-900/90 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent opacity-100 h-full" />
            </div>

            <Container className="relative z-10 text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex items-center gap-2 text-indigo-200 font-medium text-sm tracking-widest uppercase mb-4 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20"
                >
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-white font-bold">About Us</span>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl"
                >
                    About Us
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="text-lg md:text-xl text-indigo-100 mt-6 max-w-2xl font-medium drop-shadow-md"
                >
                    BookMyInfluencer &gt; About Us
                </motion.p>
            </Container>
          </section>

          {/* Section 2: Overlapping Image & Intro */}
          <section className="py-20 md:py-32 relative bg-slate-50">
            <Container>
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
                    
                    {/* Left: Overlapping Images */}
                    <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="absolute top-0 left-0 w-[70%] h-[75%] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white z-10"
                        >
                            <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1000" alt="Team meeting" fill className="object-cover" />
                            <div className="absolute inset-0 bg-indigo-600/10 mix-blend-overlay" />
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="absolute bottom-0 right-0 w-[65%] h-[65%] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white z-20"
                        >
                            <Image src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1000" alt="Creator working" fill className="object-cover" />
                        </motion.div>

                        {/* Floating Badge */}
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                            className="absolute top-[15%] -right-4 md:-right-8 z-30 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 md:p-8 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] text-white border border-indigo-400/30 backdrop-blur-xl"
                        >
                            <div className="text-4xl md:text-5xl font-black mb-1">10K+</div>
                            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-indigo-200">
                                Successful<br/>Campaigns
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">
                            <span className="w-8 h-0.5 bg-indigo-600 rounded-full" />
                            COMPANY ABOUT
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            One of the fastest ways to gain <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 italic font-serif pr-2">business success</span>
                        </h2>

                        <p className="text-slate-600 text-lg leading-relaxed font-medium">
                            BookMyInfluencer caters to businesses of all sizes, from indie authors and startups to large publishing enterprises. Our objective is to help clients leverage the power of authentic creator voices to reach their target audience effectively.
                        </p>

                        <div className="space-y-4 pt-4">
                            <h3 className="font-bold text-slate-900 tracking-wide text-sm uppercase">Our Special Services:</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    "Verified Creator Network",
                                    "Secure Escrow Payments",
                                    "Dedicated Campaign Managers",
                                    "Real-time Analytics"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-slate-700 font-semibold text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8">
                            <Link 
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                GET A QUOTE
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </Container>
          </section>

          {/* Section 3: Floating Stats Banner */}
          <section className="w-full relative z-20 -mt-8 mb-16">
              <Container>
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 rounded-[2rem] shadow-2xl overflow-hidden relative"
                    style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)" }} // Using Indigo/Violet theme instead of teal
                  >
                      {/* Decorative elements */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px]" />
                      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />

                      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 relative z-10">
                          {stats.map((stat, i) => (
                              <div key={i} className="flex flex-col items-center justify-center p-8 md:p-12 text-center group">
                                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                                      <stat.icon className="w-6 h-6 text-indigo-200" />
                                  </div>
                                  <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
                                  <div className="text-xs md:text-sm font-bold text-indigo-200 uppercase tracking-widest">{stat.label}</div>
                              </div>
                          ))}
                      </div>
                  </motion.div>
              </Container>
          </section>

          {/* Section 4: Mission / Vision / Goal */}
          <section className="py-20 md:py-32 bg-white relative overflow-hidden">
              <Container>
                  <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                      
                      {/* Left: Content & Tabs */}
                      <motion.div 
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                      >
                          <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">
                              <span className="w-8 h-0.5 bg-indigo-600 rounded-full" />
                              ABOUT MISSION
                          </div>
                          
                          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-10">
                              Our Main Goal to Satisfied <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 italic font-serif">local & Global Clients</span>
                          </h2>

                          {/* Tabs */}
                          <div className="flex flex-wrap gap-3 mb-8">
                              {missionTabs.map((tab) => (
                                  <button
                                      key={tab.id}
                                      onClick={() => setActiveTab(tab.id)}
                                      className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                                          activeTab === tab.id 
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                                      }`}
                                  >
                                      {tab.label}
                                  </button>
                              ))}
                          </div>

                          {/* Tab Content */}
                          <div className="min-h-[200px] relative">
                              <AnimatePresence mode="wait">
                                  {missionTabs.map((tab) => (
                                      tab.id === activeTab && (
                                          <motion.div
                                              key={tab.id}
                                              initial={{ opacity: 0, rotateX: -40, y: 30, transformOrigin: "top" }}
                                              animate={{ opacity: 1, rotateX: 0, y: 0 }}
                                              exit={{ opacity: 0, rotateX: 40, y: -30 }}
                                              transition={{ type: "spring", stiffness: 80, damping: 15 }}
                                              className="absolute inset-0 [perspective:1000px]"
                                          >
                                              <h3 className="text-2xl font-bold text-slate-900 mb-4">{tab.title}</h3>
                                              <p className="text-slate-600 leading-relaxed font-medium text-lg">
                                                  {tab.content}
                                              </p>
                                          </motion.div>
                                      )
                                  ))}
                              </AnimatePresence>
                          </div>
                      </motion.div>

                      {/* Right: Image */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group"
                      >
                          <Image 
                              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200" 
                              alt="Mission Image" 
                              fill 
                              className="object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-indigo-900/10 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500" />
                      </motion.div>
                  </div>
              </Container>
          </section>

          {/* Section 5: Team Members (Styled like Testimonials/Trusted By) */}
          <section className="py-20 md:py-32 bg-slate-50 relative">
              {/* Background gradient fade */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-100 to-slate-50 opacity-50 pointer-events-none" />
              
              <Container className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">
                      OUR EXPERIENCES
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-16">
                      Meet the Team Behind <span className="font-serif italic text-indigo-600">The Magic</span>
                  </h2>

                  <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.15,
                                    delayChildren: 0.1
                                }
                            }
                        }}
                      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-left [perspective:1200px]"
                  >
                      {teamMembers.map((member, i) => (
                          <motion.div
                              key={i}
                              variants={{
                                  hidden: { 
                                      opacity: 0, 
                                      rotateX: -45, 
                                      y: 50, 
                                      z: -100,
                                      scale: 0.95 
                                  },
                                  visible: { 
                                      opacity: 1, 
                                      rotateX: 0, 
                                      y: 0, 
                                      z: 0,
                                      scale: 1,
                                      transition: { 
                                          type: "spring", 
                                          stiffness: 80, 
                                          damping: 15,
                                          mass: 1.2
                                      } 
                                  }
                              }}
                              className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-300 border border-slate-100 group flex flex-col origin-top"
                          >
                              <div className="mb-8 flex-1">
                                  <p className="text-slate-600 leading-relaxed font-medium text-[15px]">
                                      "{member.bio}"
                                  </p>
                              </div>
                              
                              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-full overflow-hidden relative shadow-md">
                                          <Image src={member.image} alt={member.name} fill className="object-cover" />
                                      </div>
                                      <div>
                                          <h4 className="text-lg font-bold text-slate-900 leading-none mb-1">{member.name}</h4>
                                          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{member.role}</p>
                                      </div>
                                  </div>
                                  
                                  {/* Star Rating */}
                                  <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                          <Star key={star} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                      ))}
                                  </div>
                              </div>
                          </motion.div>
                      ))}
                    </motion.div>
                </Container>
          </section>

        </main>
      </GateReveal>
      
      <Footer />
    </div>
  )
}
