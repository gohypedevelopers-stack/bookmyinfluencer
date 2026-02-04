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
    const campaigns = await db.campaign.findMany({
        where: {
            brand: {
                userId: session.user.id
            }
        },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            budget: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            _count: {
                select: {
                    candidates: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return <CampaignListClient campaigns={campaigns} />;
}
