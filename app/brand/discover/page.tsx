import { db } from "@/lib/db";
import { visibleInfluencerProfileWhere } from "@/lib/profile-visibility";
import DiscoveryClient from "./DiscoveryClient";

export const dynamic = "force-dynamic";

export default async function BrandDiscoverPage() {
    const influencers = await db.influencerProfile.findMany({
        where: visibleInfluencerProfileWhere,
        include: {
            user: true
        },
        take: 20,
    });

    return <DiscoveryClient influencers={influencers as any} />;
}

