
import Image from "next/image"
import { BadgeCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Container } from "@/components/container"
import { db } from "@/lib/db"

export async function TalentSection() {
    // Fetch top 4 verified creators
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
            take: 4,
            orderBy: {
                verifiedAt: 'desc' // Or randomly/by followers if we had that field index
            }
        });
    } catch (e) {
        console.warn("TalentSection: Database unreachable (showing empty state). Error details suppressed.");
        creators = [];
    }


    // Fallback if no creators found (so homepage doesn't break)
    if (!creators || creators.length === 0) {
        return null; // Or keep mock data as fallback, but better to hide if empty
    }

    return (
        <section className="w-full py-20 bg-slate-50">
            <Container>
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Trending Talent</h2>
                        <p className="text-slate-600">Discover creators with high engagement rates.</p>
                    </div>
                    <Link href="/brand/discover" className="hidden sm:flex items-center text-blue-600 font-medium hover:text-blue-700">
                        View All Creators <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {creators.map((creator) => {
                        const metric = creator.metrics[0];
                        const selfMetric = creator.selfReportedMetrics[0];

                        const followers = metric?.followersCount || selfMetric?.followersCount || 0;
                        const engagement = metric?.engagementRate || 0;

                        const fmtFollowers = followers > 1000000
                            ? `${(followers / 1000000).toFixed(1)}M`
                            : followers > 1000
                                ? `${(followers / 1000).toFixed(1)}K`
                                : followers.toString();

                        const displayName = creator.displayName || creator.fullName || (creator.user as any).name || "Influencer";
                        // Use gradient placeholder if no image
                        // @ts-ignore
                        const imageSrc = creator.profileImageUrl || (creator.user as any).image || creator.backgroundImageUrl;

                        return (
                            <div key={creator.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
                                {imageSrc ? (
                                    <Image
                                        src={imageSrc}
                                        alt={displayName}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                    <div className="flex items-center gap-1 mb-1">
                                        <h3 className="font-bold text-lg text-white">{displayName}</h3>
                                        <BadgeCheck className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <p className="text-sm text-slate-300 mb-3">{creator.niche || 'General Content'}</p>

                                    <div className="flex items-center justify-between text-xs font-medium border-t border-white/20 pt-3">
                                        <div>
                                            <p className="text-slate-400">Followers</p>
                                            <p>{fmtFollowers}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400">Engagement</p>
                                            <p className="text-green-400">{engagement.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Container>
        </section>
    )
}
