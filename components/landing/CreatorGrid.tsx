
import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, Star, Zap } from 'lucide-react';
import { Container } from '@/components/container';

const ALL_CREATORS = [
    {
        id: "dummy-1",
        name: "Aryan Sharma",
        image: "/images/elena.png",
        category: "Lifestyle & Fitness",
        followers: "850K+",
        engagement: "4.8%",
        rating: 4.9,
        verified: true
    },
    {
        id: "dummy-2",
        name: "Sanya Malhotra",
        image: "/images/julian.png",
        category: "Fashion & Beauty",
        followers: "1.2M+",
        engagement: "5.2%",
        rating: 5.0,
        verified: true
    },
    {
        id: "dummy-3",
        name: "Rohan Varma",
        image: "/images/marco.png",
        category: "Tech & Gadgets",
        followers: "450K+",
        engagement: "6.1%",
        rating: 4.8,
        verified: true
    },
    {
        id: "dummy-4",
        name: "Priya Singh",
        image: "/images/sarah.png",
        category: "Travel & Food",
        followers: "320K+",
        engagement: "7.4%",
        rating: 4.7,
        verified: true
    },
    {
        id: "dummy-5",
        name: "Kabir Das",
        image: "/images/marco.png",
        category: "Comedy",
        followers: "2.1M+",
        engagement: "3.9%",
        rating: 4.6,
        verified: true
    },
    {
        id: "dummy-6",
        name: "Ishani Goyal",
        image: "/images/elena.png",
        category: "Education",
        followers: "150K+",
        engagement: "8.2%",
        rating: 4.9,
        verified: true
    }
];

export function CreatorGrid() {
    return (
        <section className="w-full py-20 bg-white">
            <Container>
                <div className="text-center mb-16">
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
                                        <div className="bg-blue-600 p-1.5 rounded-full shadow-lg">
                                            <BadgeCheck className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{creator.name}</h3>
                                        <div className="flex items-center gap-1 text-orange-500">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-sm font-bold">{creator.rating}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Followers</p>
                                        <p className="text-lg font-black text-slate-900 leading-none">{creator.followers}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Engagement</span>
                                        <span className="text-sm font-bold text-green-600">{creator.engagement}</span>
                                    </div>
                                    <Link
                                        href={`/creators/${creator.id}`}
                                        className="bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-colors"
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
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 font-bold px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 group"
                    >
                        Browse All 5,000+ Creators
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </Container>
        </section>
    );
}

import { ArrowRight } from 'lucide-react';
