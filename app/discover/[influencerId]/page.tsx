
import { db } from "@/lib/db";
import InfluencerProfileClient from "./InfluencerProfileClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InfluencerProfilePage({
    params,
}: {
    params: Promise<{ influencerId: string }>;
}) {
    // Make profile publicly viewable - no auth required
    // Handle session errors gracefully (e.g., invalid cookies)
    let session = null;
    try {
        session = await getServerSession(authOptions);
    } catch (error) {
        // Ignore session errors on public pages
        console.log('Session error (expected on public page):', error);
    }

    const { influencerId } = await params;

    const profile = await db.influencerProfile.findUnique({
        where: { id: influencerId },
        include: { user: true }
    });

    if (!profile) {
        return <div className="p-10 text-center">Influencer not found.</div>;
    }

    return <InfluencerProfileClient profile={profile} session={session} />;
}
