
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubePublicStats {
    channelId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    customUrl: string;
    subscribers: string | null; // null if hidden
    totalViews: string;
    videoCount: string;
    recentEngagementRate: number;
    avgLikes?: number;
    avgComments?: number;
    isSubscribersHidden: boolean;
}

export interface YouTubeResolverResult {
    channelId: string | null;
    error?: string;
    reason?: string;
}

// Helper for fetch with error parsing
async function fetchYouTube(url: string) {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
        const error = (data as any).error;
        throw {
            message: error?.message || 'YouTube API Error',
            reason: error?.errors?.[0]?.reason || 'unknown',
            status: error?.code || res.status
        };
    }
    return data;
}

export async function resolveChannelIdFromUrl(
    input: string,
    apiKey: string
): Promise<YouTubeResolverResult> {
    const normalized = input.trim();

    try {
        // 1. Exact Channel ID
        // e.g. UCxxxx or https://youtube.com/channel/UCxxxx
        const channelIdMatch = normalized.match(/(?:^|\/channel\/)(UC[\w-]{22})(?:$|\/|\?)/);
        if (channelIdMatch) {
            return { channelId: channelIdMatch[1] };
        }

        // 2. Handle
        // e.g. @handle or https://youtube.com/@handle
        let handle: string | null = null;
        const handleMatch = normalized.match(/(?:^|\/)(@[\w.-]+)(?:$|\/|\?)/);
        if (handleMatch) {
            handle = handleMatch[1].substring(1); // remove @
        } else if (normalized.startsWith('@')) {
            handle = normalized.substring(1);
        }

        if (handle) {
            // A) Try channels endpoint with forHandle (NO '@')
            // Note: undocumented parameter in public docs but widely used.
            // However, if it fails, fallback to search.
            try {
                const channelsUrl = `${BASE_URL}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
                const channelsData = await fetchYouTube(channelsUrl);
                if (channelsData.items && channelsData.items.length > 0) {
                    return { channelId: channelsData.items[0].id };
                }
            } catch (e) {
                // ignore error on forHandle and try search
                console.warn('forHandle failed, falling back to search', e);
            }

            // B) Fallback: search.list
            const searchUrl = `${BASE_URL}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(handle)}&key=${apiKey}`;
            const searchData = await fetchYouTube(searchUrl);

            if (searchData.items && searchData.items.length > 0 && searchData.items[0].id?.channelId) {
                return { channelId: searchData.items[0].id.channelId };
            }

            return { channelId: null, error: 'NOT_FOUND', reason: 'Handle resolution failed' };
        }

        // 3. Video URL
        // e.g. watch?v=ID or youtu.be/ID or /embed/ID
        const videoMatch = normalized.match(/(?:v=|youtu\.be\/|\/embed\/)([\w-]{11})/);
        if (videoMatch) {
            const videoId = videoMatch[1];
            const videoUrl = `${BASE_URL}/videos?part=snippet&id=${videoId}&key=${apiKey}`;
            const videoData = await fetchYouTube(videoUrl);

            if (videoData.items && videoData.items.length > 0 && videoData.items[0].snippet?.channelId) {
                return { channelId: videoData.items[0].snippet.channelId };
            }
            return { channelId: null, error: 'NOT_FOUND', reason: 'Video resolution failed' };
        }

        // 4. Fallback search (e.g. /c/User or just a name)
        let query = normalized;
        // Extract last path segment if it looks like a URL
        if (normalized.includes('/')) {
            const parts = normalized.split('/').filter(p => p.length > 0 && p !== 'https:' && p !== 'http:' && p !== 'www.youtube.com' && p !== 'youtube.com');
            if (parts.length > 0) query = parts[parts.length - 1];
        }

        // Safety check: don't search if query is looks like a URL base
        if (query.includes('youtube.com')) query = '';

        if (query && query.length > 1) {
            const searchUrl = `${BASE_URL}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(query)}&key=${apiKey}`;
            const searchData = await fetchYouTube(searchUrl);

            if (searchData.items && searchData.items.length > 0 && searchData.items[0].id?.channelId) {
                return { channelId: searchData.items[0].id.channelId };
            }
        }

        return { channelId: null, error: 'NOT_FOUND', reason: 'Could not resolve channel ID' };

    } catch (err: any) {
        return { channelId: null, error: 'YOUTUBE_API_ERROR', reason: err.reason || err.message || String(err) };
    }
}

import { runApifyActor } from "@/lib/apify";

// ... existing interfaces ...

export async function fetchPublicYouTubeStatsViaApify(
    channelUrl: string,
    apifyToken: string,
    actorId = "streamers/youtube-scraper"
): Promise<{ stats: YouTubePublicStats | null, error?: any }> {
    try {
        const result = await runApifyActor<any>({
            token: apifyToken,
            actorId,
            input: {
                urls: [channelUrl],
                maxResults: 1 // We only need channel details
            }
        });

        if (result.error || !result.data) {
            // Try fallback data structure if array
            if (Array.isArray(result.data) && result.data.length > 0) {
                // proceed with result.data[0]
            } else {
                return { stats: null, error: result.error || { message: "No data from Apify" } };
            }
        }

        let item: any = Array.isArray(result.data) ? result.data[0] : result.data;

        // "streamers/youtube-scraper" outputs specific structure.
        // Map fields carefully.
        const channelId = item.channelId || item.id;
        if (!channelId) return { stats: null, error: { message: "Channel ID not found in Apify result" } };

        return {
            stats: {
                channelId,
                title: item.name || item.title || "",
                description: item.description || "",
                thumbnailUrl: item.avatarUrl || item.thumbnailUrl || "",
                customUrl: item.url,
                subscribers: item.subscriberCount ? String(item.subscriberCount) : null,
                totalViews: item.viewCount ? String(item.viewCount) : "0",
                videoCount: item.videoCount ? String(item.videoCount) : "0",
                recentEngagementRate: 0, // Harder to calculate from basic scrape unless we scrape videos too
                avgLikes: 0,
                avgComments: 0,
                isSubscribersHidden: item.subscriberCount === null
            }
        };

    } catch (e) {
        return { stats: null, error: e };
    }
}
// ... existing fetchPublicYouTubeStats ...
export async function fetchPublicYouTubeStats(
    channelId: string,
    apiKey: string
): Promise<{ stats: YouTubePublicStats | null, error?: any }> {
    try {
        // 1. Get Channel Stats
        const channelUrl = `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
        const channelData = await fetchYouTube(channelUrl);

        if (!channelData.items || channelData.items.length === 0) {
            return { stats: null, error: { message: 'Channel not found', reason: 'notFound' } };
        }

        const item = channelData.items[0];
        const snippet = item.snippet;
        const stats = item.statistics;

        // 2. Compute Engagement Rate (Fetch last 10 videos)
        let engagementRate = 0;
        let avgLikes = 0;
        let avgComments = 0;

        try {
            const searchUrl = `${BASE_URL}/search?part=id&channelId=${channelId}&order=date&type=video&maxResults=10&key=${apiKey}`;
            const searchData = await fetchYouTube(searchUrl);

            if (searchData.items && searchData.items.length > 0) {
                const videoIds = searchData.items.map((i: any) => i.id.videoId).join(',');
                const videoStatsUrl = `${BASE_URL}/videos?part=statistics&id=${videoIds}&key=${apiKey}`;
                const videoStatsData = await fetchYouTube(videoStatsUrl);

                if (videoStatsData.items && videoStatsData.items.length > 0) {
                    let totalEngagement = 0;
                    let totalViewsForCalc = 0;
                    let totalLikes = 0;
                    let totalComments = 0;
                    let count = 0;

                    videoStatsData.items.forEach((v: any) => {
                        const viewCount = parseInt(v.statistics?.viewCount || '0');
                        if (viewCount > 0) {
                            const likes = parseInt(v.statistics?.likeCount || '0');
                            const comments = parseInt(v.statistics?.commentCount || '0');

                            totalEngagement += (likes + comments);
                            totalViewsForCalc += viewCount;
                            totalLikes += likes;
                            totalComments += comments;
                            count++;
                        }
                    });

                    if (totalViewsForCalc > 0) {
                        engagementRate = (totalEngagement / totalViewsForCalc) * 100;
                    }
                    if (count > 0) {
                        avgLikes = totalLikes / count;
                        avgComments = totalComments / count;
                    }
                }
            }
        } catch (e) {
            console.warn("Engagement calculation failed", e);
            // Ignore, default to 0
        }

        return {
            stats: {
                channelId,
                title: snippet.title,
                description: snippet.description,
                thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
                customUrl: snippet.customUrl,
                subscribers: !stats.hiddenSubscriberCount ? stats.subscriberCount : null,
                totalViews: stats.viewCount,
                videoCount: stats.videoCount,
                recentEngagementRate: engagementRate,
                avgLikes,
                avgComments,
                isSubscribersHidden: !!stats.hiddenSubscriberCount
            }
        };

    } catch (err) {
        return { stats: null, error: err };
    }
}
