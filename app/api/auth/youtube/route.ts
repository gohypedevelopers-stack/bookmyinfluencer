import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
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
            return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/youtube/callback`
        );

        const scopes = [
            'https://www.googleapis.com/auth/youtube.readonly',
        ];

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: creator.id,
            prompt: 'consent'
        });

        return NextResponse.redirect(url);
    } catch (error) {
        console.error("YouTube Auth Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
