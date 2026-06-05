import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    visibleCreatorWhereWith,
    visibleInfluencerProfileWhereWith,
} from "@/lib/profile-visibility";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ results: [] }, { status: 401 });

    const query = req.nextUrl.searchParams.get("q")?.trim();
    if (!query || query.length < 2) return NextResponse.json({ results: [] });

    try {
        // Search legacy InfluencerProfile table
        const profiles = await db.influencerProfile.findMany({
            where: visibleInfluencerProfileWhereWith({
                OR: [
                    { instagramHandle: { contains: query } },
                    { user: { name: { contains: query } } },
                    { niche: { contains: query } },
                    { location: { contains: query } },
                ]
            }),
            include: { user: { select: { id: true, name: true, image: true } } },
            take: 5,
        });

        // Search Creator table
        const creators = await db.creator.findMany({
            where: visibleCreatorWhereWith({
                OR: [
                    { fullName: { contains: query } },
                    { displayName: { contains: query } },
                    { niche: { contains: query } },
                    { instagramUrl: { contains: query } },
                ]
            }),
            include: { user: { select: { id: true } } },
            take: 5,
        });

        const profileResults = profiles.map(p => ({
            id: p.userId,
            profileId: p.id,
            name: p.user?.name || p.instagramHandle || "Unknown",
            handle: p.instagramHandle || "",
            niche: Array.isArray(p.niche) ? p.niche[0] : p.niche || "",
            avatar: p.user?.image || null,
            followers: p.followers,
            type: "influencer" as const,
        }));

        const creatorResults = creators.map(c => ({
            id: c.id,
            profileId: c.id,
            name: c.displayName || c.fullName || "Creator",
            handle: c.instagramUrl ? c.instagramUrl.split("/").filter(Boolean).pop() || "" : "",
            niche: c.niche || "",
            avatar: c.profileImageUrl || c.autoProfileImageUrl || null,
            followers: 0,
            type: "creator" as const,
        }));

        // Merge, de-duplicate by name
        const seen = new Set<string>();
        const merged = [...profileResults, ...creatorResults].filter(r => {
            if (seen.has(r.name)) return false;
            seen.add(r.name);
            return true;
        }).slice(0, 8);

        return NextResponse.json({ results: merged });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ results: [] });
    }
}
