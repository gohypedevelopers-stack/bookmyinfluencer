import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const userId = await getVerifiedUserIdFromCookies();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const creator = await db.creator.findUnique({ where: { userId } });
        if (!creator) {
            return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        const appId = process.env.META_APP_ID;
        if (!appId) {
            return NextResponse.json({ error: "Configuration Error: META_APP_ID missing" }, { status: 500 });
        }

        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/instagram/callback`;
        const scope = "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement";
        const state = creator.id; // Using creator ID as state for simplicity (CSRF protection is handled by matching user session in callback)

        const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}&response_type=code`;

        return NextResponse.redirect(url);
    } catch (error) {
        console.error("Instagram Auth Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
