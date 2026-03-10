import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";


const DUMMY_MARKETPLACE_BRANDS = [
    {
        id: "dummy-b-1",
        name: "L'Oréal Paris",
        company: "L'Oréal India",
        industry: "Cosmetics & Beauty",
        location: "Mumbai, India",
        logo: "https://logos-world.net/wp-content/uploads/2020/12/LOreal-Logo.png",
        activeCampaigns: 4,
        totalSpent: 1500000
    },
    {
        id: "dummy-b-2",
        name: "OnePlus India",
        company: "OnePlus Technology",
        industry: "Consumer Electronics",
        location: "Bangalore, India",
        logo: "https://logos-world.net/wp-content/uploads/2020/07/OnePlus-Logo.png",
        activeCampaigns: 2,
        totalSpent: 850000
    },
    {
        id: "dummy-b-3",
        name: "Tata Starbucks",
        company: "Starbucks India",
        industry: "Food & Beverage",
        location: "Mumbai, India",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
        activeCampaigns: 1,
        totalSpent: 250000
    },
    {
        id: "dummy-b-4",
        name: "Nike India",
        company: "Nike, Inc.",
        industry: "Sports & Apparel",
        location: "Global",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png",
        activeCampaigns: 7,
        totalSpent: 4200000
    },
    {
        id: "dummy-b-5",
        name: "Zomato",
        company: "Zomato Limited",
        industry: "Food Delivery & Tech",
        location: "Gurgaon, India",
        logo: "https://logos-world.net/wp-content/uploads/2022/04/Zomato-Logo.png",
        activeCampaigns: 5,
        totalSpent: 900000
    }
];

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
        const dbBrands = brandProfiles.map(brand => {
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

        // Combine with dummy brands
        const allBrands = [...dbBrands, ...DUMMY_MARKETPLACE_BRANDS];

        return NextResponse.json({ brands: allBrands });
    } catch (error) {
        console.error("Failed to fetch public brands:", error);
        return NextResponse.json({ brands: [] }, { status: 500 });
    }
}
