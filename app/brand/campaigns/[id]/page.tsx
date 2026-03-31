import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCampaignAnalytics } from "@/app/brand/actions";
import { getBrandManagerConversation } from "@/app/brand/campaigns/flow-actions";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import BrandManagerChatCard from "./BrandManagerChatCard";
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
            id,
            brandId: brand.id
        }
    });

    if (!campaign) {
        notFound();
    }

    const [analytics, managerConversation] = await Promise.all([
        getCampaignAnalytics(id),
        getBrandManagerConversation(id),
    ]);

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
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_28%,#eef4ff_100%)] pb-24">
            <div className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1400px] items-center px-6 py-4">
                    <Link
                        href="/brand/campaigns"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-950"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Campaigns
                    </Link>
                </div>
            </div>

            <div className="relative mx-auto max-w-[1400px] px-6 py-8">
                <div className="pointer-events-none absolute inset-x-8 top-0 -z-10 h-72 rounded-[40px] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(13,148,136,0.18),_transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0))]" />

                <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <AnalyticsDashboard
                        data={analyticsData as any}
                        campaignTitle={campaign.title}
                        campaignStatus={campaign.status}
                    />

                    <div className="xl:sticky xl:top-24">
                        <BrandManagerChatCard
                            campaignId={campaign.id}
                            currentUserId={session.user.id}
                            managerName={(managerConversation.success ? managerConversation.managerName : "Project Manager") || "Project Manager"}
                            locked={managerConversation.success ? Boolean(managerConversation.locked) : true}
                            initialMessages={managerConversation.success ? (managerConversation.messages as any[]) : []}
                            compact
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
