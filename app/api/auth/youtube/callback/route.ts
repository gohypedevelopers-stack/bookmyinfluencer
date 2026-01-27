import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL("/creator/dashboard?error=access_denied", req.url));
    }
    if (!code) {
        return NextResponse.redirect(new URL("/creator/dashboard?error=no_code", req.url));
    }

    try {
        const userId = await getVerifiedUserIdFromCookies();
        if (!userId) return NextResponse.redirect(new URL("/login", req.url));

        const creator = await db.creator.findUnique({ where: { userId } });
        if (!creator) return NextResponse.redirect(new URL("/creator/dashboard?error=no_creator", req.url));

        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/youtube/callback`;
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Fetch channel info
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const response = await youtube.channels.list({
            part: ['snippet', 'statistics'],
            mine: true
        });

        const channels = response.data.items;
        if (!channels || channels.length === 0) {
            return NextResponse.redirect(new URL("/creator/dashboard?error=no_channel", req.url));
        }

        const channel = channels[0];

        // Store tokens
        await db.creatorSocialAccount.upsert({
            where: {
                creatorId_provider: {
                    creatorId: creator.id,
                    provider: "youtube"
                }
            },
            update: {
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token || undefined,
                expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                providerId: channel.id!,
                username: channel.snippet?.title || ""
            },
            create: {
                creatorId: creator.id,
                provider: "youtube",
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token,
                expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                providerId: channel.id!,
                username: channel.snippet?.title || ""
            }
        });

        // Store initial metrics
        await db.creatorMetric.create({
            data: {
                creatorId: creator.id,
                provider: "youtube",
                followersCount: parseInt(channel.statistics?.subscriberCount || "0"),
                viewsCount: channel.statistics?.viewCount || "0",
                mediaCount: parseInt(channel.statistics?.videoCount || "0"),
                rawResponse: JSON.stringify(channel)
            }
        });

        // Update creator handle if needed
        if (channel.snippet?.customUrl) {
            await db.creator.update({
                where: { id: creator.id },
                data: { youtube: channel.snippet.customUrl }
            });
        }

        return NextResponse.redirect(new URL("/creator/dashboard?success=youtube_connected", req.url));

    } catch (err) {
        console.error("YT Callback Error", err);
        return NextResponse.redirect(new URL("/creator/dashboard?error=server_error", req.url));
    }
}
