"use client"

import Link from "next/link"
import { Container } from "@/components/container"
import { Instagram, Youtube, Mail } from "lucide-react"

const ABOUT_LINKS = [
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact us" },
]

const BRAND_LINKS = [
    { href: "/signup", label: "Sign up today" },
    { href: "/faq", label: "FAQ" },
    { href: "/portal", label: "Login" },
]

const CREATOR_LINKS = [
    { href: "/creator/profile", label: "Profile" },
    { href: "/faq", label: "FAQ" },
    { href: "/signup", label: "Sign up today" },
    { href: "/portal", label: "Login" },
]

const BOTTOM_LINKS = [
    { href: "/terms", label: "General terms and conditions" },
    { href: "/terms/creators", label: "Terms and conditions for book influencers" },
    { href: "/terms", label: "Terms of use" },
    { href: "/privacy-policy", label: "Privacy policy" },
]

const SOCIAL_LINKS = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
]

export function Footer() {
    return (
        <footer className="relative bg-white text-slate-600 overflow-hidden pt-10 md:pt-16 mt-10 border-t border-slate-200">
            {/* Soft Ambient Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/60 rounded-full blur-[120px] opacity-80 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-50/80 rounded-full blur-[100px] opacity-70" style={{ animation: "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            <div className="relative z-10 pt-2 pb-10">
                {/* Main Footer Content */}
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-6">
                        
                        {/* Brand Info */}
                        <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
                            <Link href="/" className="group flex items-center gap-3 mb-6 inline-flex">
                                <div className="relative w-12 h-12 bg-indigo-600 rounded-tr-[12px] rounded-bl-[12px] flex items-center justify-center text-white font-black text-xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] group-hover:shadow-[0_15px_25px_rgba(79,70,229,0.4)] group-hover:scale-105 transition-all duration-300">
                                    B
                                </div>
                                <span className="font-bold text-3xl tracking-tighter text-slate-900 transition-all duration-300">
                                    Book<span className="text-indigo-600">my</span><span className="text-[#27ae60]">influencer</span>
                                </span>
                            </Link>
                            <p className="text-slate-500 mb-8 max-w-xs leading-relaxed text-base">
                                Connecting brilliant authors and publishers with passionate book influencers to create impactful campaigns.
                            </p>
                            <div className="flex items-center gap-4">
                                {SOCIAL_LINKS.map((social, idx) => {
                                    const Icon = social.icon
                                    return (
                                        <a 
                                            key={idx} 
                                            href={social.href} 
                                            aria-label={social.label}
                                            className="group relative w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(79,70,229,0.3)]"
                                        >
                                            <Icon className="w-5 h-5 relative z-10" />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Navigation Columns */}
                        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <h4 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-wider">About</h4>
                                <ul className="space-y-4">
                                    {ABOUT_LINKS.map((link, idx) => (
                                        <li key={idx}>
                                            <Link href={link.href} className="group flex items-center text-slate-500 text-sm md:text-base hover:text-indigo-600 transition-colors duration-300">
                                                <span className="relative overflow-hidden font-medium">
                                                    {link.label}
                                                    <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-indigo-600 group-hover:w-full transition-all duration-300 rounded-full" />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-wider">For Brands</h4>
                                <ul className="space-y-4">
                                    {BRAND_LINKS.map((link, idx) => (
                                        <li key={idx}>
                                            <Link href={link.href} className="group flex items-center text-slate-500 text-sm md:text-base hover:text-indigo-600 transition-colors duration-300">
                                                <span className="relative overflow-hidden font-medium">
                                                    {link.label}
                                                    <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-indigo-600 group-hover:w-full transition-all duration-300 rounded-full" />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-wider">For Influencers</h4>
                                <ul className="space-y-4">
                                    {CREATOR_LINKS.map((link, idx) => (
                                        <li key={idx}>
                                            <Link href={link.href} className="group flex items-center text-slate-500 text-sm md:text-base hover:text-indigo-600 transition-colors duration-300">
                                                <span className="relative overflow-hidden font-medium">
                                                    {link.label}
                                                    <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-indigo-600 group-hover:w-full transition-all duration-300 rounded-full" />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-wider">Contact</h4>
                                <a href="mailto:support@bookmyinfluencer.in" className="group inline-flex flex-col items-start gap-4">
                                    <div className="flex items-center gap-3 text-slate-500 text-sm md:text-base hover:text-indigo-600 transition-colors duration-300">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all duration-300 shrink-0 group-hover:shadow-[0_10px_20px_rgba(79,70,229,0.3)]">
                                            <Mail className="w-4 h-4 group-hover:animate-pulse" />
                                        </div>
                                        <span className="relative font-bold tracking-wide">
                                            support@bookmyinfluencer.in
                                        </span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Bottom Bar - Off-White */}
            <div className="relative z-10 border-t border-slate-200 bg-slate-50 shadow-[0_-5px_30px_rgba(0,0,0,0.02)]">
                <Container>
                    <div className="py-6 flex flex-col items-center justify-center">
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs md:text-sm font-medium text-slate-500">
                            {BOTTOM_LINKS.map((link, idx) => (
                                <Link 
                                    key={idx} 
                                    href={link.href}
                                    className="hover:text-indigo-600 transition-colors duration-300 relative group py-1"
                                >
                                    {link.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-600 group-hover:w-full transition-all duration-300 rounded-full opacity-80" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </Container>
            </div>
        </footer>
    )
}
