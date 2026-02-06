
import { db } from "@/lib/db";
import DiscoveryClient from "../DiscoveryClient";
export const dynamic = "force-dynamic";

export default async function AdvancedDiscoveryPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const influencers = await db.influencerProfile.findMany({
        include: { user: true }
    });

    return <DiscoveryClient influencers={influencers} />;
}
