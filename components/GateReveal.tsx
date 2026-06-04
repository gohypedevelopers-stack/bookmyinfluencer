"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const GATE_DURATION = 1.1
const GATE_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1] // cubic-bezier for luxury feel

export function GateReveal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Tiny delay so the gate is visible before animating out
    const timer = setTimeout(() => setIsOpen(true), 180)
    return () => clearTimeout(timer)
  }, [])

  if (!isMounted) return null

  return (
    <div className="relative w-full">
      {/* Gate Overlay */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] pointer-events-none flex"
            exit={{ opacity: 1 }}
          >
            {/* ── Left Panel ── */}
            <motion.div
              className="relative w-1/2 h-full bg-indigo-950 overflow-hidden flex items-center justify-end"
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: GATE_DURATION, ease: GATE_EASE }}
            >
              {/* Glow streak on the inner edge */}
              <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-400 to-transparent opacity-80 blur-[1px]" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-indigo-500/30 to-transparent blur-xl" />

              {/* Animated ambient blobs */}
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-violet-600/15 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '4s' }} />

              {/* Noise texture */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />

              {/* Logo / Brand mark centered on the panel */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-tr-[12px] rounded-bl-[12px] flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_rgba(79,70,229,0.8)]">
                    B
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Right Panel ── */}
            <motion.div
              className="relative w-1/2 h-full bg-indigo-950 overflow-hidden flex items-center justify-start"
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: GATE_DURATION, ease: GATE_EASE }}
            >
              {/* Glow streak on the inner edge */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-400 to-transparent opacity-80 blur-[1px]" />
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-indigo-500/30 to-transparent blur-xl" />

              {/* Animated ambient blobs */}
              <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '3.5s' }} />
              <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-blue-600/15 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '4.5s' }} />

              {/* Noise texture */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />

              {/* Brand name on the right panel */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-bold text-2xl tracking-tighter text-white">
                  Bookmy<span className="text-indigo-400">influencer</span>
                </span>
              </motion.div>
            </motion.div>

            {/* ── Center glow burst at the seam ── */}
            <motion.div
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-indigo-400/60 blur-sm"
              exit={{ scaleX: 20, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Content — blurs in after gate opens ── */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(12px)", scale: 1.02 }}
        animate={isOpen
          ? { opacity: 1, filter: "blur(0px)", scale: 1 }
          : { opacity: 0, filter: "blur(12px)", scale: 1.02 }
        }
        transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  )
}
