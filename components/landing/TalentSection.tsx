import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Container } from "@/components/container"
import { db } from "@/lib/db"

import { CreatorCarousel } from "./CreatorCarousel"

const CREATOR_QUERY_TIMEOUT_MS = 2500;

export async function TalentSection() {
    // Fetch verified micro creators with a strict timeout so landing page stays fast.
    let dbCreators: any[] = [];
    try {
        const creatorQuery = db.creator.findMany({
            where: {
                verificationStatus: "APPROVED",
                metrics: {
                    some: {
                        followersCount: {
                            gte: 10000,
                            lte: 500000,
                        }
                    },
                },
            },
            include: {
                user: true,
                metrics: {
                    orderBy: { fetchedAt: "desc" },
                    take: 1,
                },
                selfReportedMetrics: {
                    take: 1,
                },
            },
            take: 10,
            orderBy: {
                verifiedAt: "desc",
            },
        }).catch(err => {
            console.warn("TalentSection background query failed:", err.message);
            return [];
        });

        const timeoutFallback = new Promise<any[]>((resolve) => {
            setTimeout(() => resolve([]), CREATOR_QUERY_TIMEOUT_MS);
        });

        dbCreators = await Promise.race([creatorQuery, timeoutFallback]);
    } catch (e) {
        console.warn("TalentSection: Database unreachable (showing empty state). Error details suppressed.");
        dbCreators = [];
    }

    const creators = dbCreators.slice(0, 12);

    return (
        <section className="w-full py-20 md:py-28 bg-slate-50/50 overflow-hidden transition-colors duration-500">
            <Container>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-indigo-600" />
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Premium Selection</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Top Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Micro Talent</span></h2>
                        <p className="text-slate-600 text-lg font-medium">Curated creators built for manager-led execution and dependable campaign quality.</p>
                    </div>
                    <Link href="/discover" className="group flex items-center bg-white border border-slate-200 px-8 py-4 rounded-2xl text-slate-800 font-semibold text-sm hover:bg-indigo-50/50 hover:border-indigo-200 transition-all duration-300 hover:scale-105 shadow-lg shadow-slate-200/50">
                        View Creator Showcase <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <CreatorCarousel creators={creators} />
            </Container>
        </section>
    )
}
