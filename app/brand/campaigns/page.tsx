import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CampaignListClient from "./CampaignListClient";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== 'BRAND' && session.user.role !== 'ADMIN' && session.user.role !== 'INFLUENCER')) {
        redirect('/login');
    }

    // Fetch campaigns for the logged-in brand
    // Fetch campaigns for the logged-in brand using raw query to ensure new fields (images) are fetched
    // despite potential stale Prisma Client definitions.
    const campaignsRaw = await db.$queryRaw`
        SELECT c.*, 
        (SELECT COUNT(*) FROM "CampaignCandidate" WHERE "campaignId" = c."id") as "candidatesCount"
        FROM "Campaign" c
        JOIN "BrandProfile" b ON c."brandId" = b."id"
        WHERE b."userId" = ${session.user.id}
        ORDER BY c."createdAt" DESC
    ` as any[];

    const campaigns = campaignsRaw.map(c => ({
        ...c,
        // Ensure dates are Date objects if driver returns strings
        createdAt: new Date(c.createdAt),
        startDate: c.startDate ? new Date(c.startDate) : null,
        endDate: c.endDate ? new Date(c.endDate) : null,
        // Map count
        _count: {
            candidates: Number(c.candidatesCount || 0)
        }
    }));

    return <CampaignListClient campaigns={campaigns} />;
}
