
import Image from "next/image"
import { BadgeCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Container } from "@/components/container"

const talents = [
    {
        name: "Rishav",
        handle: "@official_rishav06",
        niche: "Lifestyle & Content",
        followers: "850K",
        engagement: "7.2%",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=600",
    },
    {
        name: "Sarah Jenkins",
        niche: "Lifestyle & Fashion",
        followers: "1.2M",
        engagement: "4.8%",
        image: "/images/sarah.svg",
    },
    {
        name: "TechMarco",
        niche: "Tech & Gadgets",
        followers: "450K",
        engagement: "6.2%",
        image: "/images/marco.svg",
    },
    {
        name: "Elena Fit",
        niche: "Fitness & Health",
        followers: "890K",
        engagement: "3.5%",
        image: "/images/elena.svg",
    },
    {
        name: "Chef Julian",
        niche: "Food & Dining",
        followers: "2.1M",
        engagement: "5.1%",
        image: "/images/julian.svg",
    },
]

export function TalentSection() {
    return (
        <section className="w-full py-20 bg-slate-50">
            <Container>
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Trending Talent</h2>
                        <p className="text-slate-600">Discover creators with high engagement rates.</p>
                    </div>
                    <Link href="/discover" className="hidden sm:flex items-center text-blue-600 font-medium hover:text-blue-700">
                        View All Creators <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {talents.map((talent) => (
                        <div key={talent.name} className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
                            <Image
                                src={talent.image}
                                alt={talent.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                <div className="flex items-center gap-1 mb-1">
                                    <h3 className="font-bold text-lg">{talent.name}</h3>
                                    <BadgeCheck className="w-4 h-4 text-blue-400" />
                                </div>
                                <p className="text-sm text-slate-300 mb-3">{talent.niche}</p>

                                <div className="flex items-center justify-between text-xs font-medium border-t border-white/20 pt-3">
                                    <div>
                                        <p className="text-slate-400">Followers</p>
                                        <p>{talent.followers}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400">Engagement</p>
                                        <p className="text-green-400">{talent.engagement}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
