
import { NextRequest, NextResponse } from 'next/server';
import { runApifyActor } from '@/lib/apify';
import { normalizeInstagramMetrics, parseInstagramUsername } from '@/lib/metrics-util';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, link } = body;

        const targetUsername = username ? parseInstagramUsername(username) : (link ? parseInstagramUsername(link) : null);

        if (!targetUsername) {
            return NextResponse.json({ error: "Invalid username or link provided" }, { status: 400 });
        }

        const apifyToken = process.env.APIFY_TOKEN;
        const actorId = process.env.APIFY_INSTAGRAM_ACTOR_ID;

        if (!apifyToken || !actorId) {
            return NextResponse.json({ error: "Server configuration error (missing Apify credentials)" }, { status: 500 });
        }

        // Run Apify Actor
        // Common Input: { usernames: ["..."] } or { directUrls: ["..."] }
        // We will try generic `usernames` array which is common for IG scrapers.
        const input = {
            usernames: [targetUsername],
            resultsLimit: 1, // Minimize cost/time
            resultsType: "details", // Often required to get details vs posts
            searchLimit: 1
        };

        const result = await runApifyActor({
            token: apifyToken,
            actorId: actorId,
            input: input,
            timeoutSecs: 120
        });

        if (result.error) {
            console.error("Apify IG Error:", result.error);
            // Specific error handling for "actor not rented"
            if (typeof result.error === 'object' && (result.error as any).type === 'actor-is-not-rented') {
                return NextResponse.json({ error: "Instagram scraper actor not rented. Rent actor or change APIFY_INSTAGRAM_ACTOR_ID" }, { status: 403 });
            }
            // Or if error string contains it
            const errString = JSON.stringify(result.error);
            if (errString.includes("rented") || errString.includes("403")) {
                return NextResponse.json({ error: "Instagram scraper actor not rented or access denied." }, { status: 403 });
            }

            return NextResponse.json({ error: "Failed to fetch Instagram metrics" }, { status: 500 });
        }

        const items = result.data || [];
        if (items.length === 0) {
            return NextResponse.json({ error: "Creator not found or private profile" }, { status: 404 });
        }

        // Normalize first item
        const item = items[0];
        // Check if error inside item (some scrapers return { error: "..." } in dataset)
        if (item.error) {
            return NextResponse.json({ error: item.error }, { status: 500 });
        }

        const normalized = normalizeInstagramMetrics(item);

        // Ensure the parsed username matches or override if scraped data is better
        if (!normalized.username) normalized.username = targetUsername;

        // Save raw social data for Media Kit
        // Instagram scrapers often return posts in `latestPosts` or `posts` inside the main item
        const posts = Array.isArray(item.latestPosts) ? item.latestPosts :
            (Array.isArray(item.posts) ? item.posts : []);

        if (posts.length > 0) {
            (normalized as any).rawPosts = posts.slice(0, 50);
        }

        return NextResponse.json(normalized);

    } catch (error: any) {
        console.error("IG Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
