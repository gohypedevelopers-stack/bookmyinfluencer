import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Get all brand profiles from the database
        const brandProfiles = await db.brandProfile.findMany({
            include: {
                user: true,
                campaigns: {
                    where: {
                        status: 'ACTIVE'
                    }
                }
            }
        });

        // Transform data for public display
        const publicBrands = brandProfiles.map(brand => {
            // Calculate total spent from campaigns
            const totalSpent = brand.campaigns.reduce((sum, campaign) => {
                return sum + (campaign.budget || 0);
            }, 0);

            return {
                id: brand.userId,
                name: brand.user.name || brand.companyName || 'Brand',
                company: brand.companyName || 'Company',
                industry: brand.industry || 'Business',
                location: brand.location || 'India',
                logo: brand.user.image || '',
                activeCampaigns: brand.campaigns.length,
                totalSpent: totalSpent
            };
        });

        return NextResponse.json({ brands: publicBrands });
    } catch (error) {
        console.error("Failed to fetch public brands:", error);
        return NextResponse.json({ brands: [] }, { status: 500 });
    }
}
