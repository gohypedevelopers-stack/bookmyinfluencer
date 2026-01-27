import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const userId = await getVerifiedUserIdFromCookies();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { platform, followers } = await req.json();

        if (!platform || followers === undefined) {
            return NextResponse.json({ error: "Platform and followers count are required" }, { status: 400 });
        }

        const creator = await db.creator.findUnique({ where: { userId } });
        if (!creator) {
            return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
        }

        // Upsert Self Reported Metric
        await db.creatorSelfReportedMetric.upsert({
            where: {
                creatorId_provider: {
                    creatorId: creator.id,
                    provider: platform
                }
            },
            create: {
                creatorId: creator.id,
                provider: platform,
                followersCount: parseInt(followers),
            },
            update: {
                followersCount: parseInt(followers),
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error in self-reported metrics route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
