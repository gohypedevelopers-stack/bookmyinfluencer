
import Link from "next/link"
import { Container } from "@/components/container"

export function Footer() {
    return (
        <footer className="bg-white py-12 border-t border-slate-100">
            <Container className="flex flex-col md:flex-row items-center justify-between gap-8">

                <div className="flex flex-col items-center md:items-start gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#2b5d8f] rounded-tr-lg rounded-bl-lg flex items-center justify-center text-white font-bold text-xs">
                            B
                        </div>
                        <span className="font-bold text-lg text-slate-900">Bookmyinfluencer</span>
                    </Link>
                    <p className="text-sm text-slate-400">© 2026 Bookmyinfluencer Inc.</p>
                </div>

                <div className="flex gap-8 text-sm text-slate-500 font-medium">
                    <Link href="#" className="hover:text-slate-900 text-sm">Privacy Policy</Link>
                    <Link href="#" className="hover:text-slate-900 text-sm">Terms of Service</Link>
                    <Link href="#" className="hover:text-slate-900 text-sm">Support</Link>
                </div>
            </Container>
        </footer>
    )
}
