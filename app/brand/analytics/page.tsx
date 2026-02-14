
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getBrandOverallAnalytics } from "@/app/brand/actions";
import { GlobalAnalyticsDashboard } from "./GlobalAnalyticsDashboard";

export default async function BrandAnalyticsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'BRAND') {
        redirect('/login?role=brand');
    }

    const brand = await db.brandProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!brand) {
        redirect('/brand/onboarding');
    }

    // Fetch Global Analytics Data with Safety Check
    let analyticsData;

    try {
        const analytics = await getBrandOverallAnalytics();
        if (analytics?.success && analytics?.data) {
            analyticsData = analytics.data;
        }
    } catch (e) {
        console.error("BrandAnalyticsPage Fetch Error:", e);
    }

    // Default empty data structure if fetch fails or returns null
    if (!analyticsData) {
        analyticsData = {
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
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <GlobalAnalyticsDashboard
                    data={analyticsData as any}
                    brandName={brand.companyName || "Your Brand"}
                />
            </div>
        </div>
    );
}
