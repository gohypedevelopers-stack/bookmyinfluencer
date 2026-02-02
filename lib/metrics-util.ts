
/**
 * parses human friendly numbers like "1,234", "1.2M", "500K"
 */
export function parseHumanNumber(input: string | number | undefined | null): number {
    if (input === undefined || input === null) return 0;
    if (typeof input === 'number') return input;

    // Normalize
    const str = String(input).toUpperCase().replace(/,/g, '').trim();
    if (!str || str === "HIDDEN" || str === "—") return 0;

    try {
        if (str.endsWith('M')) {
            return Math.round(parseFloat(str.replace('M', '')) * 1_000_000);
        }
        if (str.endsWith('K')) {
            return Math.round(parseFloat(str.replace('K', '')) * 1_000);
        }
        if (str.endsWith('B')) {
            return Math.round(parseFloat(str.replace('B', '')) * 1_000_000_000);
        }
        return Math.round(parseFloat(str)) || 0;
    } catch {
        return 0;
    }
}

export function parseInstagramUsername(input: string): string | null {
    if (!input) return null;
    const clean = input.trim();
    if (clean.includes("instagram.com/")) {
        try {
            const url = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
            const pathParts = url.pathname.split("/").filter(Boolean);
            return pathParts[0] || null;
        } catch {
            return null;
        }
    }
    return clean.replace(/^@/, "");
}

export function parseYoutubeChannel(input: string): { type: 'channel' | 'handle'; value: string } | null {
    if (!input) return null;
    const clean = input.trim();

    if (clean.includes("youtube.com/") || clean.includes("youtu.be/")) {
        try {
            const url = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
            const pathParts = url.pathname.split("/").filter(Boolean);
            if (pathParts[0] === "channel") return { type: 'channel', value: pathParts[1] };
            if (pathParts[0].startsWith("@")) return { type: 'handle', value: pathParts[0] };
            return { type: 'handle', value: pathParts[0] };
        } catch {
            return null;
        }
    }
    if (clean.startsWith("UC")) return { type: 'channel', value: clean };
    if (clean.startsWith("@")) return { type: 'handle', value: clean };
    return { type: 'handle', value: clean.startsWith("@") ? clean : `@${clean}` };
}

export function calculateEngagementRate(audience: number, avgLikes: number, avgComments: number): number {
    if (!audience || audience <= 0) return 0;
    const rate = ((avgLikes + avgComments) / audience) * 100;
    return Math.round(rate * 100) / 100;
}

export function normalizeInstagramMetrics(item: any): any {
    const followers = parseHumanNumber(item.followersCount || item.followers || item.followerCount);
    const posts = Array.isArray(item.latestPosts) ? item.latestPosts :
        (Array.isArray(item.posts) ? item.posts :
            (Array.isArray(item.timeline) ? item.timeline : []));

    const recentPosts = posts.slice(0, 12);
    let totalLikes = 0;
    let totalComments = 0;

    recentPosts.forEach((p: any) => {
        totalLikes += parseHumanNumber(p.likesCount || p.likes || p.likeCount);
        totalComments += parseHumanNumber(p.commentsCount || p.comments || p.commentCount);
    });

    const avgLikes = recentPosts.length ? Math.round(totalLikes / recentPosts.length) : 0;
    const avgComments = recentPosts.length ? Math.round(totalComments / recentPosts.length) : 0;

    return {
        platform: "instagram",
        username: item.username || item.ownerUsername || "",
        followers,
        avgLikes,
        avgComments,
        engagementRate: calculateEngagementRate(followers, avgLikes, avgComments)
    };
}

export function normalizeYoutubeMetrics(items: any[]): any {
    // 1. Find the best "channel" item.
    // User Note: "Apify youtube-scraper output item (type:"video") contains channel stats too"
    const channel = items.find(i =>
        i.numberOfSubscribers ||
        i.aboutChannelInfo?.numberOfSubscribers ||
        i.channelTotalViews ||
        i.aboutChannelInfo?.channelTotalViews
    ) ?? items[0];

    // 2. Map Channel Stats
    const subscribers = parseHumanNumber(
        channel.numberOfSubscribers ??
        channel.aboutChannelInfo?.numberOfSubscribers ??
        channel.subscriberCount ??
        channel.subscribers ?? 0
    );

    const totalViews = parseHumanNumber(
        channel.channelTotalViews ??
        channel.aboutChannelInfo?.channelTotalViews ??
        channel.viewCount ??
        channel.views ?? 0
    );

    const videoCount = parseHumanNumber(
        channel.channelTotalVideos ??
        channel.aboutChannelInfo?.channelTotalVideos ??
        channel.videoCount ??
        channel.numberOfVideos ?? 0
    );

    const channelName = channel.channelName ?? channel.aboutChannelInfo?.channelName ?? channel.title ?? channel.name ?? "";
    const isSubscribersHidden = false; // logic if needed: String(val).includes("hidden")

    // 3. Compute Averages from videos
    // User Note: "avgLikes/avgComments compute from video items"
    const videos = items.filter(v => v.type === "video");

    // Fallback if no explicit type='video' found, but only if they have likes
    const targetVideos = videos.length > 0 ? videos : items.filter(v => v.likes || v.likeCount);

    const recentVideos = targetVideos.slice(0, 12);
    let totalLikes = 0;
    let totalComments = 0;

    recentVideos.forEach(v => {
        totalLikes += parseHumanNumber(v.likes ?? v.likeCount);
        totalComments += parseHumanNumber(v.commentsCount ?? v.commentCount ?? v.comments);
    });

    const avgLikes = recentVideos.length ? Math.round(totalLikes / recentVideos.length) : 0;
    const avgComments = recentVideos.length ? Math.round(totalComments / recentVideos.length) : 0;

    // 4. Extract Channel Avatar (not video thumbnail!)
    // YouTube channel avatars are from yt3.googleusercontent.com
    let avatarUrl = "";

    console.log("[YouTube Avatar] Checking authorThumbnails:", channel.authorThumbnails);
    console.log("[YouTube Avatar] Checking avatarUrl:", channel.avatarUrl);

    // Priority 1: Check authorThumbnails array for yt3.googleusercontent.com URLs
    if (Array.isArray(channel.authorThumbnails)) {
        const ytAvatar = channel.authorThumbnails.find((t: any) =>
            t.url && t.url.includes('yt3.googleusercontent.com')
        );
        if (ytAvatar) {
            avatarUrl = ytAvatar.url;
            console.log("[YouTube Avatar] Found in authorThumbnails:", avatarUrl);
        }
    }

    // Priority 2: Check other common avatar fields
    if (!avatarUrl && channel.avatarUrl?.includes('yt3.googleusercontent.com')) {
        avatarUrl = channel.avatarUrl;
        console.log("[YouTube Avatar] Found in avatarUrl:", avatarUrl);
    }

    // Priority 3: Direct avatar object
    if (!avatarUrl && channel.avatar?.url?.includes('yt3.googleusercontent.com')) {
        avatarUrl = channel.avatar.url;
        console.log("[YouTube Avatar] Found in avatar.url:", avatarUrl);
    }

    // Fallback: If no yt3.googleusercontent URL found, use first available
    if (!avatarUrl) {
        console.log("[YouTube Avatar] No yt3.googleusercontent found, using fallback");
        avatarUrl = channel.authorThumbnails?.[0]?.url ||
            channel.avatarUrl ||
            channel.avatar?.url ||
            "";
    }

    console.log("[YouTube Avatar] Final URL:", avatarUrl);

    return {
        platform: "youtube",
        channel: channelName,
        channelId: channel.channelId || channel.id || "",
        title: channelName,
        description: channel.description || channel.aboutChannelInfo?.description || "",
        thumbnailUrl: avatarUrl,
        customUrl: channel.url || channel.channelUrl || "",

        // Critical Stats
        totalViews: String(totalViews),
        videoCount: videoCount,
        videos: videoCount,
        subscribers: subscribers,
        followers: subscribers,

        avgLikes,
        avgComments,
        engagementRate: calculateEngagementRate(subscribers, avgLikes, avgComments),
        isSubscribersHidden
    };
}
