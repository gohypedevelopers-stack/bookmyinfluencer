
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Container } from "@/components/container"

export function CallToAction() {
    return (
        <section className="w-full py-12 bg-white">
            <Container>
                <div className="bg-[#2b5d8f] rounded-3xl p-12 lg:p-20 text-center text-white shadow-2xl relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <h2 className="text-3xl lg:text-5xl font-bold mb-6 relative z-10">Ready to scale your influence?</h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                        Join 15,000+ brands and creators making meaningful connections today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <Link href="/login">
                            <Button size="lg" className="bg-white text-[#2b5d8f] hover:bg-blue-50 font-bold h-14 px-8 rounded-full text-base">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="#">
                            <Button size="lg" variant="outline" className="border-blue-400 bg-transparent text-white hover:bg-white/10 hover:text-white h-14 px-8 rounded-full text-base">
                                Contact Sales
                            </Button>
                        </Link>
                    </div>
                </div>
            </Container>
        </section>
    )
}
