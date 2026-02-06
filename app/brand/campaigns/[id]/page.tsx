
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCampaignAnalytics } from "@/app/brand/actions";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'BRAND') {
        redirect('/login?role=brand');
    }

    const { id } = await params;

    const brand = await db.brandProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!brand) {
        redirect('/brand/onboarding');
    }

    const campaign = await db.campaign.findFirst({
        where: {
            id: id,
            brandId: brand.id
        }
    });

    if (!campaign) {
        notFound();
    }

    // Fetch Analytics Data
    const analytics = await getCampaignAnalytics(id);

    // Default empty data structure if fetch fails
    const analyticsData = analytics.success ? analytics.data : {
        summary: {
            totalReach: 0,
            totalEngagement: 0,
            avgCPE: "0.00",
            conversions: 0,
            totalSpent: 0,
            budget: 0
        },
        performance: [],
        creators: []
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Simple Back Header */}
            <div className="bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link href="/brand/campaigns" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Campaigns
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <AnalyticsDashboard
                    data={analyticsData as any}
                    campaignTitle={campaign.title}
                />
            </div>
        </div>
    );
}

