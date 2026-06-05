import type { Prisma } from "@prisma/client"

const HIDDEN_EMAIL_EXACT = new Set([
    "admin@bookmyinfluencers.com",
    "brand@nike.com",
    "rishav@influencer.com",
    "sarah@influencer.com",
    "mike@foodie.com",
    "brand1@example.com",
    "brand2@example.com",
    "brand3@example.com",
    "creator1@example.com",
    "creator2@example.com",
    "creator3@example.com",
    "fashion.icon@example.com",
    "tech.guru@example.com",
    "fitness.pro@example.com",
    "travel.diary@example.com",
    "foodie.eats@example.com",
    "brand.seed@testbrand.com",
    "manager.seed@testbrand.com",
])

const HIDDEN_EMAIL_SUFFIXES = [
    "@example.com",
    "@testcreator.com",
    "@testbrand.com",
]

const HIDDEN_EMAIL_PARTS = [
    ".demo@",
    "demo@",
    "test@",
    "archived.local",
]

const HIDDEN_TEXT_PARTS = [
    "dummy",
    "mock",
    "seed test",
    "test creator",
    "test brand",
    "simulation test",
]

const HIDDEN_ID_PREFIXES = [
    "dummy-",
    "seed-",
]

function normalize(value: unknown) {
    return String(value || "").trim().toLowerCase()
}

function hasHiddenText(value: unknown) {
    const normalized = normalize(value)
    return normalized.length > 0 && HIDDEN_TEXT_PARTS.some((part) => normalized.includes(part))
}

export function isHiddenProfileEmail(email: unknown) {
    const normalized = normalize(email)
    if (!normalized) return false

    return (
        HIDDEN_EMAIL_EXACT.has(normalized) ||
        HIDDEN_EMAIL_SUFFIXES.some((suffix) => normalized.endsWith(suffix)) ||
        HIDDEN_EMAIL_PARTS.some((part) => normalized.includes(part))
    )
}

export function isHiddenProfileId(id: unknown) {
    const normalized = normalize(id)
    return normalized.length > 0 && HIDDEN_ID_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

export function isHiddenWebsite(website: unknown) {
    const normalized = normalize(website)
    return normalized.includes(".example") || normalized.includes("example.")
}

function stringContains(field: string, value: string) {
    return {
        [field]: {
            contains: value,
            mode: "insensitive",
        },
    }
}

function stringEndsWith(field: string, value: string) {
    return {
        [field]: {
            endsWith: value,
            mode: "insensitive",
        },
    }
}

function hiddenEmailClauses(field: string) {
    return [
        { [field]: { in: Array.from(HIDDEN_EMAIL_EXACT), mode: "insensitive" } },
        ...HIDDEN_EMAIL_SUFFIXES.map((suffix) => stringEndsWith(field, suffix)),
        ...HIDDEN_EMAIL_PARTS.map((part) => stringContains(field, part)),
    ]
}

function hiddenTextClauses(...fields: string[]) {
    return fields.flatMap((field) => HIDDEN_TEXT_PARTS.map((part) => stringContains(field, part)))
}

function hiddenIdClauses(field = "id") {
    return HIDDEN_ID_PREFIXES.map((prefix) => ({
        [field]: {
            startsWith: prefix,
            mode: "insensitive",
        },
    }))
}

export function andWhere<T extends Record<string, unknown>>(...clauses: Array<T | null | undefined>) {
    const activeClauses = clauses.filter(Boolean) as T[]
    if (activeClauses.length === 0) return {}
    if (activeClauses.length === 1) return activeClauses[0]
    return { AND: activeClauses } as unknown as T
}

export const visibleCreatorWhere = {
    AND: [
        { onboardingCompleted: true },
        {
            NOT: [
                ...hiddenIdClauses(),
                ...hiddenEmailClauses("email"),
                ...hiddenTextClauses("fullName", "displayName", "autoDisplayName"),
                ...hiddenEmailClauses("email").map((clause) => ({ user: clause })),
            ],
        },
    ],
} satisfies Prisma.CreatorWhereInput

export const visibleInfluencerProfileWhere = {
    AND: [
        { onboardingCompleted: true },
        {
            NOT: [
                ...hiddenIdClauses(),
                ...hiddenTextClauses("instagramHandle", "youtubeHandle", "tiktokHandle", "bio"),
                ...hiddenEmailClauses("email").map((clause) => ({ user: clause })),
                ...hiddenTextClauses("name").map((clause) => ({ user: clause })),
            ],
        },
    ],
} satisfies Prisma.InfluencerProfileWhereInput

export const visibleBrandProfileWhere = {
    AND: [
        { onboardingCompleted: true },
        {
            NOT: [
                ...hiddenIdClauses(),
                ...hiddenTextClauses("companyName", "description"),
                ...HIDDEN_EMAIL_PARTS.map((part) => stringContains("website", part)),
                stringContains("website", ".example"),
                stringContains("website", "example."),
                ...hiddenEmailClauses("email").map((clause) => ({ user: clause })),
                ...hiddenTextClauses("name").map((clause) => ({ user: clause })),
            ],
        },
    ],
} satisfies Prisma.BrandProfileWhereInput

export const visibleInfluencerIndexWhere = {
    active: true,
    NOT: [
        ...hiddenIdClauses(),
        ...hiddenEmailClauses("email"),
        ...hiddenTextClauses("displayName", "rawCategory"),
        { sourceKey: { startsWith: "seed:", mode: "insensitive" } },
        { sourceType: { equals: "SEED_CREATOR", mode: "insensitive" } },
    ],
} satisfies Prisma.InfluencerWhereInput

export const visibleUserWhere = {
    NOT: [
        ...hiddenIdClauses(),
        ...hiddenEmailClauses("email"),
        ...hiddenTextClauses("name"),
    ],
} satisfies Prisma.UserWhereInput

export function visibleCreatorWhereWith(where?: Prisma.CreatorWhereInput) {
    return andWhere<Prisma.CreatorWhereInput>(visibleCreatorWhere, where)
}

export function visibleInfluencerProfileWhereWith(where?: Prisma.InfluencerProfileWhereInput) {
    return andWhere<Prisma.InfluencerProfileWhereInput>(visibleInfluencerProfileWhere, where)
}

export function visibleBrandProfileWhereWith(where?: Prisma.BrandProfileWhereInput) {
    return andWhere<Prisma.BrandProfileWhereInput>(visibleBrandProfileWhere, where)
}

export function visibleInfluencerIndexWhereWith(where?: Prisma.InfluencerWhereInput) {
    return andWhere<Prisma.InfluencerWhereInput>(visibleInfluencerIndexWhere, where)
}

export function visibleUserWhereWith(where?: Prisma.UserWhereInput) {
    return andWhere<Prisma.UserWhereInput>(visibleUserWhere, where)
}

export function isVisibleCreatorProfile(record: any) {
    if (!record) return false
    if (isHiddenProfileId(record.id) || isHiddenProfileId(record.userId) || isHiddenProfileId(record.dbId)) return false
    if (isHiddenProfileEmail(record.email) || isHiddenProfileEmail(record.user?.email)) return false
    if (hasHiddenText(record.fullName) || hasHiddenText(record.displayName) || hasHiddenText(record.autoDisplayName)) return false
    if (hasHiddenText(record.name) || hasHiddenText(record.handle)) return false
    return record.onboardingCompleted !== false
}

export function isVisibleInfluencerProfile(record: any) {
    if (!record) return false
    if (isHiddenProfileId(record.id) || isHiddenProfileId(record.userId) || isHiddenProfileId(record.dbId)) return false
    if (isHiddenProfileEmail(record.user?.email) || isHiddenProfileEmail(record.email)) return false
    if (hasHiddenText(record.user?.name) || hasHiddenText(record.name)) return false
    if (hasHiddenText(record.instagramHandle) || hasHiddenText(record.youtubeHandle) || hasHiddenText(record.tiktokHandle)) return false
    return record.onboardingCompleted !== false
}

export function isVisibleBrandProfile(record: any) {
    if (!record) return false
    if (isHiddenProfileId(record.id) || isHiddenProfileId(record.userId)) return false
    if (isHiddenProfileEmail(record.user?.email) || isHiddenProfileEmail(record.email)) return false
    if (hasHiddenText(record.companyName) || hasHiddenText(record.user?.name) || hasHiddenText(record.name)) return false
    if (isHiddenWebsite(record.website)) return false
    return record.onboardingCompleted !== false
}

export function isVisibleInfluencerIndex(record: any) {
    if (!record) return false
    if (isHiddenProfileId(record.id) || isHiddenProfileId(record.sourceUserId)) return false
    if (isHiddenProfileEmail(record.email)) return false
    if (hasHiddenText(record.displayName) || hasHiddenText(record.rawCategory)) return false
    if (normalize(record.sourceKey).startsWith("seed:")) return false
    if (normalize(record.sourceType) === "seed_creator") return false
    return record.active !== false
}
