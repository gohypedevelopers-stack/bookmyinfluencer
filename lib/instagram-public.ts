import { runApifyActor } from "@/lib/apify";

export interface InstagramPublicStats {
    username: string;
    fullName: string;
    biography: string;
    profilePicUrl: string;
    followersCount: number;
    followsCount: number;
    mediaCount: number;
    avgLikes?: number;
    avgComments?: number;
    engagementRate?: number;
    isPrivate: boolean;
    fetchedAt: Date;
}

export async function fetchInstagramPublicStats(
    usernameUrlOrHandle: string,
    apifyToken: string,
    actorId: string = "scraper-engine/instagram-profile-scraper" // Default as per requirement
): Promise<{ stats: InstagramPublicStats | null, error?: any }> {
    try {
        // Normalize input to username
        let username = usernameUrlOrHandle.trim();
        if (username.includes("instagram.com/")) {
            const parts = username.split("instagram.com/");
            const path = parts[1].split(/[/?#]/)[0];
            username = path;
        } else if (username.startsWith("@")) {
            username = username.substring(1);
        }

        if (!username) {
            return { stats: null, error: { message: "Invalid Instagram username" } };
        }

        // Run Actor using Helper
        // Schema for scraper-engine/instagram-profile-scraper often expects 'usernames' array
        const result = await runApifyActor<any[]>({
            token: apifyToken,
            actorId,
            input: { usernames: [username] },
            timeoutSecs: 90
        });

        if (result.error || !result.data || result.data.length === 0) {
            return { stats: null, error: result.error || { message: "No data returned" } };
        }

        // Find matching item
        const item = result.data.find((i: any) => i.username === username || i.ownerUsername === username) || result.data[0];

        if (!item || item.error) {
            return { stats: null, error: { message: item?.error || "Account not found in dataset" } };
        }

        // Engagement Calculation
        // Scrapers map fields differently. Try common mappings.
        const followers = item.followersCount || item.followers || 0;
        const postsCount = item.postsCount || item.posts || 0;

        let avgLikes = 0;
        let avgComments = 0;
        let engagementRate = 0;

        // Check for latestPosts or posts array
        const posts = item.latestPosts || item.posts || [];

        if (Array.isArray(posts) && posts.length > 0) {
            let totalLikes = 0;
            let totalComments = 0;
            let count = 0;

            // Limit to valid posts (some might be ads or null)
            const validPosts = posts.slice(0, 12); // Last 12 posts usually enough for estimate

            validPosts.forEach((post: any) => {
                const likes = post.likesCount || post.likes || 0;
                const comments = post.commentsCount || post.comments || 0;
                if (likes >= 0 && comments >= 0) {
                    totalLikes += likes;
                    totalComments += comments;
                    count++;
                }
            });

            if (count > 0) {
                avgLikes = totalLikes / count;
                avgComments = totalComments / count;
                if (followers > 0) {
                    engagementRate = ((totalLikes + totalComments) / count / followers) * 100;
                }
            }
        }

        return {
            stats: {
                username: item.username || item.ownerUsername || username,
                fullName: item.fullName || "",
                biography: item.biography || "",
                profilePicUrl: item.profilePicUrl || item.profilePicUrlHD || "",
                followersCount: followers,
                followsCount: item.followsCount || item.follows || 0,
                mediaCount: postsCount,
                avgLikes,
                avgComments,
                engagementRate,
                isPrivate: item.isPrivate || false,
                fetchedAt: new Date()
            }
        };

    } catch (e) {
        return { stats: null, error: e };
    }
}
