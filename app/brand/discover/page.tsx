import { db } from "@/lib/db";
import DiscoveryClient from "./DiscoveryClient";

export const dynamic = "force-dynamic";

export default async function BrandDiscoverPage() {
    const influencers = await db.influencerProfile.findMany({
        include: {
            user: true
        },
        take: 20,
    });

    return <DiscoveryClient influencers={influencers as any} />;
}

