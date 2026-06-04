"use client"

import Image from "next/image"
import { Container } from "@/components/container"
import { motion } from "framer-motion"

export function TrustedBySection() {
    return (
        <section className="w-full py-16 md:py-24 bg-slate-50 relative overflow-hidden transition-colors duration-500">
            <Container className="text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 md:mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                        Trusted by <span className="text-indigo-600">Industry Leaders</span>
                    </h2>
                </motion.div>
            </Container>

            {/* Infinite Animated Carousel Container - Full Width */}
            <div className="relative flex flex-col gap-12 overflow-hidden w-full group py-8">
                {/* Gradient masks - matches section bg */}
                <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 lg:w-64 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 lg:w-64 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

                {/* Top Row - Scrolls Left */}
                <motion.div
                    className="flex items-center gap-12 md:gap-40 whitespace-nowrap animate-infinite-scroll hover:[animation-play-state:paused]"
                >
                    {[1, 2, 3].map((setIndex) => (
                        <div key={`row1-${setIndex}`} className="flex items-center gap-12 md:gap-40">
                            {[
                                { name: "Fabhotels", src: "/images/logos/fabhotels.avif", width: 220, height: 100 },
                                { name: "GDK", src: "/images/logos/gdk.avif", width: 180, height: 100, filter: "brightness-0 scale-125" },
                                { name: "Homify", src: "/images/logos/homify.avif", width: 180, height: 100, filter: "brightness-0 scale-125" },
                                { name: "IndianOil", src: "/images/logos/indianoil.avif", width: 180, height: 100, filter: "scale-75" },
                                { name: "Lazada", src: "/images/logos/lazada.avif", width: 200, height: 100, filter: "brightness-0" },
                                { name: "Yatra", src: "/images/logos/yatra.png", width: 180, height: 100 },
                            ].map((brand, i) => (
                                <div
                                    key={`${setIndex}-r1-${brand.name}-${i}`}
                                    className="opacity-80 hover:opacity-100 transition-all duration-500 cursor-pointer hover:scale-110 px-4 group/logo flex items-center justify-center w-32 md:w-48 lg:w-64 h-24 md:h-32 lg:h-40"
                                >
                                    <Image
                                        src={brand.src}
                                        alt={brand.name}
                                        width={brand.width * 2}
                                        height={brand.height * 2}
                                        className={`w-full h-full object-contain drop-shadow-sm transition-all duration-300 ${brand.filter ?? ""}`}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </motion.div>

                {/* Bottom Row - Scrolls Right (Reverse) */}
                <motion.div
                    className="flex items-center gap-12 md:gap-40 whitespace-nowrap animate-infinite-scroll-reverse hover:[animation-play-state:paused]"
                >
                    {[1, 2, 3].map((setIndex) => (
                        <div key={`row2-${setIndex}`} className="flex items-center gap-12 md:gap-40">
                            {[
                                { name: "Mash", src: "/images/logos/mash.avif", width: 160, height: 60, filter: "scale-125" },
                                { name: "Neo", src: "/images/logos/neo.avif", width: 180, height: 60, filter: "scale-125" },
                                { name: "Pai", src: "/images/logos/pai.avif", width: 140, height: 60, filter: "brightness-0 scale-110" },
                                { name: "Rapid Repair", src: "/images/logos/rapidrepair.avif", width: 220, height: 60, filter: "brightness-0 scale-125" },
                                { name: "Taneja Group", src: "/images/logos/taneja group.avif", width: 280, height: 60 },
                            ].map((brand, i) => (
                                <div
                                    key={`${setIndex}-r2-${brand.name}-${i}`}
                                    className="opacity-80 hover:opacity-100 transition-all duration-500 cursor-pointer hover:scale-110 px-4 flex items-center justify-center w-32 md:w-48 lg:w-64 h-24 md:h-32 lg:h-40"
                                >
                                    <Image
                                        src={brand.src}
                                        alt={brand.name}
                                        width={brand.width * 2}
                                        height={brand.height * 2}
                                        className={`w-full h-full object-contain drop-shadow-sm transition-all duration-300 ${brand.filter ?? ""}`}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
