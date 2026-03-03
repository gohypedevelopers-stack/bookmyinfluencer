"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/container"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo placeholder - using text/icon */}
          <div className="w-8 h-8 bg-primary rounded-tr-xl rounded-bl-xl flex items-center justify-center text-primary-foreground font-bold text-lg min-w-[32px]">
            B
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">Bookmyinfluencer</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/discover" className="hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <Link href="/brand/login" className="hover:text-foreground transition-colors">
            For Brands
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            For Creators
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="font-medium" asChild>
            <Link href="/login">
              Log In
            </Link>
          </Button>
          <Button className="font-medium bg-slate-800 hover:bg-slate-700" asChild>
            <Link href="/register">
              Sign Up
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          {/* We show login briefly on small sizes maybe? No, let's keep it clean */}
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Toggle Menu">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </Container>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background absolute left-0 right-0 shadow-lg">
          <Container className="py-4 flex flex-col gap-4">
            <Link href="/discover" className="text-sm font-medium hover:text-primary p-2 transition-colors" onClick={toggleMobileMenu}>
              Marketplace
            </Link>
            <Link href="/brand/login" className="text-sm font-medium hover:text-primary p-2 transition-colors" onClick={toggleMobileMenu}>
              For Brands
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary p-2 transition-colors" onClick={toggleMobileMenu}>
              For Creators
            </Link>
            <div className="h-px bg-border my-2" />
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-center" onClick={toggleMobileMenu} asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button className="w-full justify-center bg-slate-800 hover:bg-slate-700" onClick={toggleMobileMenu} asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </nav>
  )
}
