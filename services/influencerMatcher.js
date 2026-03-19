import { db } from "@/lib/db";

const CATEGORY_KEYWORDS = {
    fashion: ["fashion", "style", "apparel", "clothing", "wear", "luxury", "accessories"],
    tech: ["tech", "technology", "gadget", "software", "saas", "ai", "app", "mobile"],
    beauty: ["beauty", "cosmetic", "skincare", "makeup", "haircare", "fragrance"],
    health: ["health", "wellness", "medical", "nutrition"],
    fitness: ["fitness", "workout", "gym", "sports", "athlete"],
    food: ["food", "beverage", "culinary", "recipe", "restaurant", "chef"],
    finance: ["finance", "fintech", "investment", "money", "crypto", "insurance"],
    education: ["education", "learning", "student", "course", "training"],
    entertainment: ["entertainment", "comedy", "music", "movie", "celebrity", "dance"],
    travel: ["travel", "tourism", "adventure", "hospitality"],
    gaming: ["gaming", "esports", "streamer", "game"],
    lifestyle: ["lifestyle", "daily life", "family", "home", "decor"],
    business: ["business", "entrepreneur", "startup", "marketing", "sales", "founder"],
};

function safeJsonParse(value) {
    if (!value || typeof value !== "string") return null;

    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function slugify(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function normalizeCategory(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "general";

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((keyword) => raw.includes(keyword))) {
            return category;
        }
    }

    const normalized = slugify(raw);
    return normalized || "general";
}

function normalizePlatforms(value) {
    if (!value) return null;
    if (Array.isArray(value)) return value.join(", ");
    return typeof value === "string" ? value : JSON.stringify(value);
}

function coerceNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function getCreatorFollowers(creator) {
    return (
        creator.metrics?.[0]?.followersCount ||
        creator.selfReportedMetrics?.[0]?.followersCount ||
        safeJsonParse(creator.rawSocialData)?.selfReported?.followers ||
        0
    );
}

function getCreatorEngagement(creator) {
    return creator.metrics?.[0]?.engagementRate || 0;
}

function getProfileSourceKey(profile) {
    const email = profile.user?.email?.trim().toLowerCase();
    if (email) return `email:${email}`;
    return `legacy:${profile.id}`;
}

function getCreatorSourceKey(creator) {
    const email = creator.email?.trim().toLowerCase();
    if (email) return `email:${email}`;
    return `creator:${creator.id}`;
}

function pickDisplayName(...values) {
    for (const value of values) {
        if (value && String(value).trim()) {
            return String(value).trim();
        }
    }

    return "Influencer";
}

function buildFromCreator(creator) {
    const rawCategory = creator.niche || "General";

    return {
        sourceKey: getCreatorSourceKey(creator),
        sourceType: "creator",
        sourceUserId: creator.userId || null,
        email: creator.email?.trim().toLowerCase() || null,
        displayName: pickDisplayName(creator.displayName, creator.fullName, creator.email),
        category: normalizeCategory(rawCategory),
        rawCategory,
        followersCount: coerceNumber(getCreatorFollowers(creator), 0),
        engagementRate: coerceNumber(getCreatorEngagement(creator), 0),
        priceStory: creator.priceStory ?? null,
        pricePost: creator.pricePost ?? creator.price ?? null,
        priceCollab: creator.priceCollab ?? null,
        platforms: normalizePlatforms(creator.platforms),
        profileImageUrl: creator.profileImageUrl || creator.autoProfileImageUrl || null,
        active: creator.onboardingCompleted !== false && creator.verificationStatus !== "REJECTED",
    };
}

function buildFromLegacyProfile(profile) {
    const rawCategory = profile.niche || "General";

    return {
        sourceKey: getProfileSourceKey(profile),
        sourceType: "legacy_profile",
        sourceUserId: profile.userId || null,
        email: profile.user?.email?.trim().toLowerCase() || null,
        displayName: pickDisplayName(profile.user?.name, profile.instagramHandle, profile.youtubeHandle, profile.user?.email),
        category: normalizeCategory(rawCategory),
        rawCategory,
        followersCount: coerceNumber(profile.followers, 0),
        engagementRate: coerceNumber(profile.engagementRate, 0),
        priceStory: profile.priceStory ?? null,
        pricePost: profile.pricePost ?? profile.price ?? null,
        priceCollab: profile.priceCollab ?? null,
        platforms: normalizePlatforms(profile.platforms),
        profileImageUrl: profile.user?.image || null,
        active: profile.onboardingCompleted !== false,
    };
}

function pickPreferredValue(currentValue, incomingValue) {
    if (currentValue === null || currentValue === undefined || currentValue === "") {
        return incomingValue;
    }

    return currentValue;
}

function mergeInfluencerRecords(current, incoming) {
    const useIncomingMetrics = incoming.followersCount > current.followersCount;

    return {
        sourceKey: current.sourceKey,
        sourceType: current.sourceType === incoming.sourceType ? current.sourceType : "merged",
        sourceUserId: pickPreferredValue(current.sourceUserId, incoming.sourceUserId),
        email: pickPreferredValue(current.email, incoming.email),
        displayName: current.displayName === "Influencer" ? incoming.displayName : current.displayName,
        category: current.category === "general" ? incoming.category : current.category,
        rawCategory: current.rawCategory === "General" ? incoming.rawCategory : current.rawCategory,
        followersCount: useIncomingMetrics ? incoming.followersCount : current.followersCount,
        engagementRate: useIncomingMetrics
            ? incoming.engagementRate
            : Math.max(current.engagementRate, incoming.engagementRate),
        priceStory: pickPreferredValue(current.priceStory, incoming.priceStory),
        pricePost: pickPreferredValue(current.pricePost, incoming.pricePost),
        priceCollab: pickPreferredValue(current.priceCollab, incoming.priceCollab),
        platforms: pickPreferredValue(current.platforms, incoming.platforms),
        profileImageUrl: pickPreferredValue(current.profileImageUrl, incoming.profileImageUrl),
        active: current.active || incoming.active,
    };
}

async function upsertInChunks(records, chunkSize = 25) {
    for (let index = 0; index < records.length; index += chunkSize) {
        const chunk = records.slice(index, index + chunkSize);
        await Promise.all(
            chunk.map((record) =>
                db.influencer.upsert({
                    where: { sourceKey: record.sourceKey },
                    update: record,
                    create: record,
                }),
            ),
        );
    }
}

export async function syncInfluencerIndex() {
    const [creators, legacyProfiles] = await Promise.all([
        db.creator.findMany({
            select: {
                id: true,
                userId: true,
                email: true,
                fullName: true,
                displayName: true,
                niche: true,
                platforms: true,
                rawSocialData: true,
                price: true,
                priceStory: true,
                pricePost: true,
                priceCollab: true,
                profileImageUrl: true,
                autoProfileImageUrl: true,
                onboardingCompleted: true,
                verificationStatus: true,
                metrics: {
                    select: { followersCount: true, engagementRate: true },
                    orderBy: { date: "desc" },
                    take: 1,
                },
                selfReportedMetrics: {
                    select: { followersCount: true },
                    orderBy: { updatedAt: "desc" },
                    take: 1,
                },
            },
        }),
        db.influencerProfile.findMany({
            select: {
                id: true,
                userId: true,
                niche: true,
                followers: true,
                engagementRate: true,
                price: true,
                priceStory: true,
                pricePost: true,
                priceCollab: true,
                platforms: true,
                instagramHandle: true,
                youtubeHandle: true,
                onboardingCompleted: true,
                user: {
                    select: {
                        email: true,
                        name: true,
                        image: true,
                    },
                },
            },
        }),
    ]);

    const combined = new Map();

    for (const creator of creators) {
        const record = buildFromCreator(creator);
        const existing = combined.get(record.sourceKey);
        combined.set(record.sourceKey, existing ? mergeInfluencerRecords(existing, record) : record);
    }

    for (const profile of legacyProfiles) {
        const record = buildFromLegacyProfile(profile);
        const existing = combined.get(record.sourceKey);
        combined.set(record.sourceKey, existing ? mergeInfluencerRecords(existing, record) : record);
    }

    const records = Array.from(combined.values());
    await upsertInChunks(records);

    return records.length;
}

async function queryInfluencers({ category, minFollowers, maxFollowers, limit, excludeInfluencerIds }) {
    return db.influencer.findMany({
        where: {
            active: true,
            followersCount: {
                gte: minFollowers,
                lte: maxFollowers,
            },
            ...(excludeInfluencerIds.length > 0
                ? {
                    id: {
                        notIn: excludeInfluencerIds,
                    },
                }
                : {}),
            ...(category && category !== "general"
                ? {
                    category,
                }
                : {}),
        },
        orderBy: [
            { engagementRate: "desc" },
            { followersCount: "desc" },
        ],
        take: limit,
    });
}

export async function getMatchedInfluencers({
    category,
    minFollowers = 0,
    maxFollowers = Number.MAX_SAFE_INTEGER,
    limit = 20,
    excludeInfluencerIds = [],
}) {
    await syncInfluencerIndex();

    const normalizedCategory = normalizeCategory(category);
    const exactMatches = await queryInfluencers({
        category: normalizedCategory,
        minFollowers,
        maxFollowers,
        limit,
        excludeInfluencerIds,
    });

    if (exactMatches.length >= limit || normalizedCategory === "general") {
        return exactMatches;
    }

    const fallbackMatches = await queryInfluencers({
        category: null,
        minFollowers,
        maxFollowers,
        limit: limit - exactMatches.length,
        excludeInfluencerIds: [...excludeInfluencerIds, ...exactMatches.map((item) => item.id)],
    });

    return [...exactMatches, ...fallbackMatches];
}
