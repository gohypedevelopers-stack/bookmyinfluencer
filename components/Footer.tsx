
import Link from "next/link"
import { Container } from "@/components/container"


export function Footer() {
    return (
        <footer className="bg-white py-16 border-t border-slate-100 transition-colors duration-500">
            <Container className="flex flex-col md:flex-row items-center justify-between gap-12">

                <div className="flex flex-col items-center md:items-start gap-3">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-tr-[10px] rounded-bl-[10px] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-100">
                            B
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tighter">Bookmyinfluencer</span>
                    </Link>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">(c) 2026 Bookmyinfluencer Inc. All rights reserved.</p>
                </div>

                <div className="flex gap-10 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                    <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
                    <Link href="#" className="hover:text-indigo-600 transition-colors">Support</Link>
                </div>
            </Container>
        </footer>
    )
}

