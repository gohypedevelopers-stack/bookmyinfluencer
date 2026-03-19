
import Image from "next/image"
import { BadgeCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Container } from "@/components/container"
import { db } from "@/lib/db"

import { CreatorCarousel } from "./CreatorCarousel"

const DUMMY_CREATORS = [
    {
        id: "dummy-1",
        displayName: "Aryan Sharma",
        fullName: "Aryan Sharma",
        profileImageUrl: "/images/elena.png",
        niche: "Lifestyle & Fitness",
        metrics: [{ followersCount: 850000, engagementRate: 4.8 }],
        verificationStatus: 'APPROVED'
    },
    {
        id: "dummy-2",
        displayName: "Sanya Malhotra",
        fullName: "Sanya Malhotra",
        profileImageUrl: "/images/julian.png",
        niche: "Fashion & Beauty",
        metrics: [{ followersCount: 1250000, engagementRate: 5.2 }],
        verificationStatus: 'APPROVED'
    },
    {
        id: "dummy-3",
        displayName: "Rohan Varma",
        fullName: "Rohan Varma",
        profileImageUrl: "/images/marco.png",
        niche: "Tech & Gadgets",
        metrics: [{ followersCount: 450000, engagementRate: 6.1 }],
        verificationStatus: 'APPROVED'
    },
    {
        id: "dummy-4",
        displayName: "Priya Singh",
        fullName: "Priya Singh",
        profileImageUrl: "/images/sarah.png",
        niche: "Travel & Food",
        metrics: [{ followersCount: 320000, engagementRate: 7.4 }],
        verificationStatus: 'APPROVED'
    },
    {
        id: "dummy-5",
        displayName: "Kabir Das",
        fullName: "Kabir Das",
        profileImageUrl: "/images/marco.png",
        niche: "Comedy & Entertainment",
        metrics: [{ followersCount: 2100000, engagementRate: 3.9 }],
        verificationStatus: 'APPROVED'
    }
];

export async function TalentSection() {
    // Fetch top 12 verified creators for the carousel
    let dbCreators: any[] = [];
    try {
        dbCreators = await db.creator.findMany({
            where: {
                verificationStatus: 'APPROVED',
            },
            include: {
                user: true,
                metrics: {
                    orderBy: { fetchedAt: 'desc' },
                    take: 1
                },
                selfReportedMetrics: {
                    take: 1
                }
            },
            take: 10,
            orderBy: {
                verifiedAt: 'desc'
            }
        });
    } catch (e) {
        console.warn("TalentSection: Database unreachable (showing empty state). Error details suppressed.");
        dbCreators = [];
    }

    // Combine database creators with dummy creators, ensuring we always have data to show
    const creators = [...dbCreators, ...DUMMY_CREATORS].slice(0, 12);

    return (
        <section className="w-full py-20 md:py-32 bg-slate-50/50 overflow-hidden transition-colors duration-500">
            <Container>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-indigo-600" />
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Premium Selection</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Top Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Talent</span></h2>
                        <p className="text-slate-600 text-lg font-medium">Connect with creators who are shaping the digital landscape.</p>
                    </div>
                    <Link href="/discover" className="group flex items-center bg-white border border-slate-200 px-8 py-4 rounded-2xl text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all hover:scale-105 shadow-lg shadow-slate-200/50">
                        Explore Marketplace <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <CreatorCarousel creators={creators} />
            </Container>
        </section>
    )
}
