"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/container"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { JoinSelectionModal } from "./landing/JoinSelectionModal"
import { LoginSelectionModal } from "./landing/LoginSelectionModal"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (

    <nav className="border-b border-slate-200/50 sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <Container className="h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          {/* Logo placeholder - using text/icon */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-tr-[10px] rounded-bl-[10px] flex items-center justify-center text-white font-bold text-lg sm:text-xl min-w-[32px] sm:min-w-[36px] shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
            B
          </div>
          <span className="font-bold text-lg sm:text-2xl tracking-tighter text-slate-900">Bookmy<span className="text-indigo-600">influencer</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10 text-sm font-bold tracking-wide text-slate-600">
          <Link href="/discover" className="hover:text-indigo-600 transition-colors">
            Marketplace
          </Link>
          <Link href="/brand/login" className="hover:text-indigo-600 transition-colors">
            For Brands
          </Link>
          <Link href="/login" className="hover:text-indigo-600 transition-colors">
            For Creators
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/login"
            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors tracking-wide cursor-pointer bg-transparent border-0"
          >
            Log In
          </Link>
          <Button
            onClick={() => setIsJoinModalOpen(true)}
            className="font-bold bg-slate-900 text-white hover:bg-slate-800 px-8 h-12 rounded-xl text-sm tracking-wide transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
          >
            Join Now
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-slate-900 hover:bg-slate-100" aria-label="Toggle Menu">
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </Button>
        </div>
      </Container>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white absolute left-0 right-0 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
          <Container className="py-10 flex flex-col gap-8 shadow-inner bg-slate-50/50">
            <div className="flex flex-col gap-1">
              <Link href="/discover" className="text-lg font-bold text-slate-900 hover:text-indigo-600 p-3 rounded-xl hover:bg-white transition-all tracking-wide text-sm" onClick={toggleMobileMenu}>
                Marketplace
              </Link>
              <Link href="/brand/login" className="text-lg font-bold text-slate-900 hover:text-indigo-600 p-3 rounded-xl hover:bg-white transition-all tracking-wide text-sm" onClick={toggleMobileMenu}>
                For Brands
              </Link>
              <Link href="/login" className="text-lg font-bold text-slate-900 hover:text-indigo-600 p-3 rounded-xl hover:bg-white transition-all tracking-wide text-sm" onClick={toggleMobileMenu}>
                For Creators
              </Link>
            </div>
            <div className="h-px bg-slate-200/50 mx-3" />
            <div className="flex flex-col gap-4">
              <Link href="/login" className="w-full animate-none" onClick={toggleMobileMenu}>
                <Button 
                  variant="outline" 
                  className="w-full justify-center border-slate-200 text-slate-900 font-bold h-16 rounded-2xl text-sm tracking-wide shadow-sm" 
                >
                  Log In
                </Button>
              </Link>
              <Button
                className="w-full justify-center bg-indigo-600 text-white hover:bg-indigo-700 font-bold h-16 rounded-2xl text-sm tracking-wide shadow-xl shadow-indigo-100"
                onClick={() => {
                  toggleMobileMenu();
                  setIsJoinModalOpen(true);
                }}
              >
                Join Now
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Container>
        </div>
      )}
      <JoinSelectionModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </nav>
  )
}
