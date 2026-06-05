import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, Star, ArrowRight, Zap } from "lucide-react"
import { Container } from "@/components/container"

// Mock data for the landing page
const ALL_CREATORS = [
    {
        id: "1",
        name: "Sarah Chen",
        category: "Tech & Gadgets",
        followers: "1.2M",
        engagement: "8.4%",
        rating: "4.9",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
        verified: true
    },
    {
        id: "2",
        name: "Marcus Rodriguez",
        category: "Lifestyle",
        followers: "850K",
        engagement: "6.2%",
        rating: "4.8",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
        verified: true
    },
    {
        id: "3",
        name: "Emma Watson",
        category: "Fashion",
        followers: "2.4M",
        engagement: "11.2%",
        rating: "5.0",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
        verified: true
    }
]

export function CreatorGrid() {
    return (
        <section className="w-full py-12 md:py-16 bg-white">
            <Container>
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Meet Our Top Creators</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">Browse through our curated list of verified influencers across various niches.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ALL_CREATORS.map((creator) => (
                        <div key={creator.id} className="group relative bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                            {/* Image Container */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <Image
                                    src={creator.image}
                                    alt={creator.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                                        <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                                        {creator.category}
                                    </span>
                                </div>
                                {creator.verified && (
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-indigo-600 p-1.5 rounded-full shadow-lg">
                                            <BadgeCheck className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{creator.name}</h3>
                                        <div className="flex items-center gap-1 text-orange-500">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-sm font-bold">{creator.rating}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Followers</p>
                                        <p className="text-lg font-bold text-slate-900 leading-none">{creator.followers}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Engagement</span>
                                        <span className="text-sm font-bold text-green-600">{creator.engagement}</span>
                                    </div>
                                    <Link
                                        href={`/creators/${creator.id}`}
                                        className="bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link
                        href="/discover"
                        className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300 group"
                    >
                        Browse All 5,000+ Creators
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </Container>
        </section>
    );
}
