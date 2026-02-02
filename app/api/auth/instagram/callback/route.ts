import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorReason = searchParams.get("error_reason");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (error || errorReason) {
        return NextResponse.redirect(new URL(`/creator/dashboard?error=${errorReason || error}`, baseUrl));
    }
    if (!code) {
        return NextResponse.redirect(new URL("/creator/dashboard?error=no_code", baseUrl));
    }

    try {
        const userId = await getVerifiedUserIdFromCookies();
        if (!userId) return NextResponse.redirect(new URL("/login", baseUrl));

        const creator = await db.creator.findUnique({ where: { userId } });
        if (!creator) return NextResponse.redirect(new URL("/creator/dashboard?error=no_creator", baseUrl));

        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;
        const redirectUri = `${baseUrl}/api/auth/instagram/callback`;

        // 1. Exchange code for short-lived token
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("IG Token Error:", tokenData.error);
            return NextResponse.redirect(new URL("/creator/dashboard?error=token_exchange_failed", baseUrl));
        }

        // 2. Exchange for Long-Lived Token
        const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`;
        const longRes = await fetch(longLivedUrl);
        const longData = await longRes.json();
        const finalToken = longData.access_token || tokenData.access_token;

        // 3. Get Pages and Connected IG Account
        const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${finalToken}&fields=id,name,instagram_business_account{id,username}`;
        const pagesRes = await fetch(pagesUrl);
        const pagesData = await pagesRes.json();

        let igAccount = null;

        if (pagesData.data) {
            for (const page of pagesData.data) {
                if (page.instagram_business_account) {
                    igAccount = page.instagram_business_account;
                    break;
                }
            }
        }

        if (!igAccount) {
            return NextResponse.redirect(new URL("/creator/dashboard?error=no_ig_business_linked_to_page", baseUrl));
        }

        // 4. Fetch specific IG metrics
        const igUrl = `https://graph.facebook.com/v19.0/${igAccount.id}?fields=username,followers_count,media_count&access_token=${finalToken}`;
        const metricRes = await fetch(igUrl);
        const metricData = await metricRes.json();

        // 5. Save to DB
        await db.creatorSocialAccount.upsert({
            where: {
                creatorId_provider: {
                    creatorId: creator.id,
                    provider: "instagram"
                }
            },
            update: {
                accessToken: finalToken,
                expiresAt: longData.expires_in ? new Date(Date.now() + (longData.expires_in * 1000)) : undefined,
                providerId: igAccount.id,
                username: metricData.username || igAccount.username
            },
            create: {
                creatorId: creator.id,
                provider: "instagram",
                accessToken: finalToken,
                expiresAt: longData.expires_in ? new Date(Date.now() + (longData.expires_in * 1000)) : undefined,
                providerId: igAccount.id,
                username: metricData.username || igAccount.username
            }
        });

        await db.creatorMetric.create({
            data: {
                creatorId: creator.id,
                provider: "instagram",
                followersCount: metricData.followers_count || 0,
                mediaCount: metricData.media_count || 0,
                rawResponse: JSON.stringify(metricData)
            }
        });

        // Update creator handle with full URL
        if (metricData.username) {
            await db.creator.update({
                where: { id: creator.id },
                data: { instagramUrl: `https://instagram.com/${metricData.username}` }
            });
        }

        return NextResponse.redirect(new URL("/creator/dashboard?success=instagram_connected", baseUrl));

    } catch (err) {
        console.error("IG Callback Error", err);
        return NextResponse.redirect(new URL("/creator/dashboard?error=server_error", baseUrl));
    }
}
