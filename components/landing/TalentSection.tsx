import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Container } from "@/components/container"
import { db } from "@/lib/db"

import { CreatorCarousel } from "./CreatorCarousel"

const CREATOR_CACHE_TTL_MS = 60_000;
const CREATOR_ERROR_RETRY_MS = 30_000;

type TalentCreator = {
    id: string;
    displayName: string | null;
    fullName: string | null;
    niche: string | null;
    profileImageUrl: string | null;
    backgroundImageUrl: string | null;
    user?: {
        name: string | null;
        image: string | null;
    } | null;
    metrics: {
        followersCount: number;
        engagementRate: number;
    }[];
    selfReportedMetrics: {
        followersCount: number;
    }[];
};

const talentCache = globalThis as unknown as {
    talentCreators?: {
        data: TalentCreator[];
        fetchedAt: number;
    };
    talentCreatorsInFlight?: Promise<TalentCreator[]>;
    talentCreatorsLastErrorAt?: number;
};

async function fetchTalentCreators() {
    return db.creator.findMany({
        select: {
            id: true,
            displayName: true,
            fullName: true,
            niche: true,
            profileImageUrl: true,
            backgroundImageUrl: true,
            metrics: {
                select: {
                    followersCount: true,
                    engagementRate: true,
                },
                orderBy: { fetchedAt: "desc" },
                take: 1,
            },
            selfReportedMetrics: {
                select: {
                    followersCount: true,
                },
                orderBy: { updatedAt: "desc" },
                take: 1,
            },
        },
        take: 10,
        orderBy: {
            verifiedAt: "desc",
        },
    });
}

async function getTalentCreators() {
    const now = Date.now();
    const cached = talentCache.talentCreators;

    if (cached && now - cached.fetchedAt < CREATOR_CACHE_TTL_MS) {
        return cached.data;
    }

    if (!cached && talentCache.talentCreatorsLastErrorAt && now - talentCache.talentCreatorsLastErrorAt < CREATOR_ERROR_RETRY_MS) {
        return [];
    }

    if (talentCache.talentCreatorsInFlight) {
        return cached?.data ?? talentCache.talentCreatorsInFlight;
    }

    talentCache.talentCreatorsInFlight = fetchTalentCreators()
        .then((data) => {
            talentCache.talentCreators = {
                data,
                fetchedAt: Date.now(),
            };
            return data;
        })
        .catch((err) => {
            talentCache.talentCreatorsLastErrorAt = Date.now();
            console.warn("TalentSection creator query failed:", err instanceof Error ? err.message : String(err));
            return talentCache.talentCreators?.data ?? [];
        })
        .finally(() => {
            talentCache.talentCreatorsInFlight = undefined;
        });

    return cached?.data ?? talentCache.talentCreatorsInFlight;
}

export async function TalentSection() {
    const dbCreators = await getTalentCreators();

    const creators = dbCreators.slice(0, 12);

    return (
        <section className="w-full py-12 md:py-16 bg-slate-50/50 overflow-hidden transition-colors duration-500">
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
