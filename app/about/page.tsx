"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Container } from "@/components/container"
import { Sparkles, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { GateReveal } from "@/components/GateReveal"

const teamMembers = [
  {
    role: "Community Manager",
    bio: (
      <>
        <strong>Paula</strong> (she/her) is the community manager and the go-to person for all participating book influencers. Paula loves YA books (Angie Thomas and Sarah J. Maas are two of her favorite authors), poetry and (Dutch) literature. She is active on TikTok and Instagram @paulasbook. Do you have a question? Just drop her a message at <a href="mailto:paula@bookmyinfluencer.com" className="text-indigo-600 hover:underline">paula@bookmyinfluencer.com</a>.
      </>
    ),
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Campaign Manager",
    bio: (
      <>
        <strong>Ona</strong> (she/her) is a campaign manager, she runs the TikTok via Book Tours and brand campaigns for us. Ona is a 'mood reader', reading different genres of books but her favorites are fantasy, contemporary romance and literary fiction. The author she loves most is Olivia Blake and her favorite book is Alone With You In The Ether. Ona has an Instagram and TikTok account called @mythicalreadings. You can contact Ona at <a href="mailto:ona@bookmyinfluencer.com" className="text-indigo-600 hover:underline">ona@bookmyinfluencer.com</a>.
      </>
    ),
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Campaign Manager",
    bio: (
      <>
        <strong>Maree</strong> (she/her) works as a campaign manager. She helps new clients set up their book tours, she runs a book account @Readwithmaree. Maree loves Jane Austen and romance novels. Her favorites are Pride and Prejudice as well as the Outlander series. Want to get in touch with her? Email <a href="mailto:maree@bookmyinfluencer.com" className="text-indigo-600 hover:underline">maree@bookmyinfluencer.com</a>.
      </>
    ),
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Founder/CEO & Campaign Manager",
    bio: (
      <>
        <strong>Saskia</strong> (she/her) is the Founder & CEO of BookMyInfluencer. She loves a well paced thriller. She started building the platform that she had in mind. After months of development and fine-tuning it launched early 2021. Saskia loves to be involved in the day-to-day operations and often works for campaigns as campaign manager. Saskia is full of brilliant and also dreadful book puns. Her TBR is so tall it’s threatening to attack! If you want to talk to her then just send a message to <a href="mailto:saskia@bookmyinfluencer.com" className="text-indigo-600 hover:underline">saskia@bookmyinfluencer.com</a>.
      </>
    ),
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Campaign Manager",
    bio: (
      <>
        <strong>Helen</strong> (she/her) works as a campaign manager for our German clients, she loves to read literary fiction, thrillers and feminist fiction. Her favorite books are The Last House on Needless Street by Catriona Ward, Tomorrow, and Tomorrow, and Tomorrow by Gabrielle Zevin and City of Girls by Elizabeth Gilbert. You can find her on social media as @bookishgabels. You can email Helen at <a href="mailto:helen@bookmyinfluencer.com" className="text-indigo-600 hover:underline">helen@bookmyinfluencer.com</a>.
      </>
    ),
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    role: "Editor",
    bio: (
      <>
        <strong>Jenny</strong> (she/her) makes sure all our newsletters and blogs are checked by her before they are published. She loves reading fantasy, romance and thrillers. Jenny's favorite books are the ACOTAR series by Sarah J. Maas, the Maple Hills series by Hannah Grace and the Thursday Murder Club series by Richard Osman. Find her as @jennysreads on Instagram, TikTok and YouTube. Would you like to speak to Jenny? Contact her at <a href="mailto:jenny@bookmyinfluencer.com" className="text-indigo-600 hover:underline">jenny@bookmyinfluencer.com</a>.
      </>
    ),
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=400&h=400",
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <GateReveal>
        <div className="relative">
          {/* Background Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-purple-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-pink-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
          </div>

      <Container className="pt-24 pb-16 relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm"
          >
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-500 mb-8 tracking-tight">
            About us
          </h1>
          <p className="text-lg md:text-xl text-slate-700 font-medium leading-relaxed mb-4">
            Thank you for visiting BookMyInfluencer.
          </p>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8">
            We are a team dedicated to brand campaigns with the international book community. We love working with publishers, book platforms and our creators.
          </p>
          <div className="inline-flex items-center text-lg font-bold text-indigo-600 bg-indigo-50 px-6 py-2 rounded-full border border-indigo-100 shadow-sm">
            Meet the team!
          </div>
        </motion.div>

        {/* Team Members Section */}
        <div className="flex flex-col gap-24 md:gap-32">
          {teamMembers.map((member, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 group`}
              >
                {/* Image Side */}
                <div className="w-full md:w-5/12 flex justify-center">
                  <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 group-hover:shadow-indigo-500/20 transition-all duration-700 group-hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                    <Image
                      src={member.image}
                      alt={member.role}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Text Side */}
                <div className="w-full md:w-7/12 flex flex-col justify-center">
                  <motion.h2 
                    className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#8b5cf6] mb-6 tracking-tight group-hover:text-indigo-600 transition-colors duration-500"
                  >
                    {member.role}
                  </motion.h2>
                  <p className="text-base md:text-lg text-slate-700 leading-relaxed font-medium bg-white/50 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 group-hover:shadow-md group-hover:bg-white/80 transition-all duration-500">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 relative rounded-[3rem] overflow-hidden p-10 md:p-16 lg:p-20 text-center shadow-2xl shadow-pink-500/20 group"
        >
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <p className="text-pink-100 font-bold uppercase tracking-widest text-sm mb-4">
              A successful book tour or Book Campaign starts here
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight drop-shadow-md">
              Work with the book community
            </h2>
            <p className="text-lg md:text-xl text-pink-50 leading-relaxed mb-10 max-w-3xl font-medium drop-shadow-sm">
              Are you a publisher? An indie author? A library? A bookstore? Do you have an e-reader or audiobook app? There are so many options for collaboration within the book community we could go on and on. Tell us about your company/product/story and we can discuss the options of a great campaign with our book influencers.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-rose-500 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Contact us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </Container>
      </div>
      </GateReveal>
      <Footer />
    </div>
  )
}
