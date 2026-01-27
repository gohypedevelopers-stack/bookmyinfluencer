
import { NextRequest, NextResponse } from 'next/server';
import { runApifyActor } from '@/lib/apify';
import { normalizeYoutubeMetrics, parseYoutubeChannel } from '@/lib/metrics-util';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { channelId, handle, link } = body;

        let target = null;

        if (channelId) target = { type: 'channel', value: channelId };
        else if (handle) target = { type: 'handle', value: handle };
        else if (link) target = parseYoutubeChannel(link);

        if (!target || !target.value) {
            return NextResponse.json({ error: "Invalid YouTube channel input" }, { status: 400 });
        }

        const apifyToken = process.env.APIFY_TOKEN;
        const actorId = process.env.APIFY_YOUTUBE_ACTOR_ID;

        if (!apifyToken || !actorId) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Prepare Input based on type
        // Common YT Scraper Inputs: startUrls, searchKeywords, channelIds
        const input: any = { maxResults: 1 };

        if (target.type === 'channel' && target.value.startsWith("UC")) {
            // Likely channel ID
            // Many scrapers take startUrls for specific channel
            input.startUrls = [{ url: `https://www.youtube.com/channel/${target.value}` }];
        } else {
            // Handle or Link
            // Ensure full URL for startUrls if possible
            let url = target.value;
            if (target.type === 'handle' && !url.includes("youtube.com")) {
                url = `https://www.youtube.com/${url.startsWith("@") ? url : "@" + url}`;
            }
            input.startUrls = [{ url }];
        }

        const result = await runApifyActor({
            token: apifyToken,
            actorId: actorId,
            input: input,
            timeoutSecs: 120
        });

        if (result.error) {
            console.error("Apify YT Error:", result.error);
            return NextResponse.json({ error: "Failed to fetch YouTube metrics" }, { status: 500 });
        }

        const items = result.data || [];
        if (items.length === 0) {
            return NextResponse.json({ error: "Channel not found" }, { status: 404 });
        }

        const normalized = normalizeYoutubeMetrics(items[0]);
        return NextResponse.json(normalized);

    } catch (error: any) {
        console.error("YT Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
