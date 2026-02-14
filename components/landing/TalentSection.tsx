
import Image from "next/image"
import { BadgeCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Container } from "@/components/container"
import { db } from "@/lib/db"

import { CreatorCarousel } from "./CreatorCarousel"

export async function TalentSection() {
    // Fetch top 12 verified creators for the carousel
    let creators: any[] = [];
    try {
        creators = await db.creator.findMany({
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
            take: 12,
            orderBy: {
                verifiedAt: 'desc'
            }
        });
    } catch (e) {
        console.warn("TalentSection: Database unreachable (showing empty state). Error details suppressed.");
        creators = [];
    }


    // Fallback if no creators found (so homepage doesn't break)
    if (!creators || creators.length === 0) {
        return null;
    }

    return (
        <section className="w-full py-20 bg-slate-50 overflow-hidden">
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

                <CreatorCarousel creators={creators} />
            </Container>
        </section>
    )
}
