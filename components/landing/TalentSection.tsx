
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
        profileImageUrl: "/images/dummy/lifestyle.png",
        niche: "Lifestyle & Fitness",
        metrics: [{ followersCount: 850000, engagementRate: 4.8 }],
        verificationStatus: 'APPROVED'
    },
    {
        id: "dummy-2",
        displayName: "Sanya Malhotra",
        fullName: "Sanya Malhotra",
        profileImageUrl: "/images/dummy/fashion.png",
        niche: "Fashion & Beauty",
        metrics: [{ followersCount: 1250000, engagementRate: 5.2 }],
        verificationStatus: 'APPROVED'
    },
    {
        id: "dummy-3",
        displayName: "Rohan Varma",
        fullName: "Rohan Varma",
        profileImageUrl: "/images/dummy/tech.png",
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
        <section className="w-full py-16 md:py-20 bg-slate-50 overflow-hidden">
            <Container>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Trending Talent</h2>
                        <p className="text-slate-600">Discover creators with high engagement rates.</p>
                    </div>
                    <Link href="/discover" className="flex items-center text-blue-600 font-medium hover:text-blue-700">
                        Explore All Creators <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <CreatorCarousel creators={creators} />
            </Container>
        </section>
    )
}
