export type SharedPlatformId = "instagram" | "youtube";

export type FollowerRangeOption = {
  label: string;
  min: number;
  max: number;
};

export type FollowerTier = {
  label: "Micro" | "Macro";
  desc: string;
  badge: string;
  min: number;
  max: number;
  color: string;
  rangeOptions: FollowerRangeOption[];
};

export const SHARED_PLATFORM_OPTIONS: ReadonlyArray<{
  id: SharedPlatformId;
  label: string;
}> = [
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
];

export const SHARED_NICHE_LABELS = [
  "Tech & Gadgets",
  "Fashion & Style",
  "Beauty & Makeup",
  "Fitness & Health",
  "Food & Culinary",
  "Travel & Lifestyle",
  "Finance & Crypto",
  "Education",
  "Gaming",
  "Parenting",
] as const;

export const SHARED_MICRO_FOLLOWER_RANGES: FollowerRangeOption[] = Array.from(
  { length: 10 },
  (_, idx) => {
    const min = idx * 10_000;
    const max = (idx + 1) * 10_000;
    return { label: `${idx * 10}-${(idx + 1) * 10}K`, min, max };
  }
);

export const SHARED_MACRO_FOLLOWER_RANGES: FollowerRangeOption[] = [
  { label: "100-200K", min: 100_000, max: 200_000 },
  { label: "200-300K", min: 200_000, max: 300_000 },
  { label: "300-400K", min: 300_000, max: 400_000 },
  { label: "400-500K", min: 400_000, max: 500_000 },
];

export const SHARED_FOLLOWER_TIERS: FollowerTier[] = [
  {
    label: "Micro",
    desc: "0K - 100K followers",
    badge: "High Engagement",
    min: 0,
    max: 100_000,
    color: "from-blue-400 to-cyan-500",
    rangeOptions: SHARED_MICRO_FOLLOWER_RANGES,
  },
  {
    label: "Macro",
    desc: "100K - 500K followers",
    badge: "Broad Reach",
    min: 100_000,
    max: 500_000,
    color: "from-violet-400 to-purple-500",
    rangeOptions: SHARED_MACRO_FOLLOWER_RANGES,
  },
];

export const SHARED_CREATOR_FOLLOWER_RANGES: FollowerRangeOption[] = [
  ...SHARED_MICRO_FOLLOWER_RANGES,
  ...SHARED_MACRO_FOLLOWER_RANGES,
];

const SHARED_NICHE_ALIAS_MAP = new Map<string, string>([
  ["tech", "Tech & Gadgets"],
  ["technology", "Tech & Gadgets"],
  ["technology & gadgets", "Tech & Gadgets"],
  ["fashion", "Fashion & Style"],
  ["fashion & beauty", "Fashion & Style"],
  ["beauty", "Beauty & Makeup"],
  ["beauty & skincare", "Beauty & Makeup"],
  ["fitness", "Fitness & Health"],
  ["health", "Fitness & Health"],
  ["food", "Food & Culinary"],
  ["travel", "Travel & Lifestyle"],
  ["lifestyle", "Travel & Lifestyle"],
  ["finance", "Finance & Crypto"],
  ["crypto", "Finance & Crypto"],
  ["education", "Education"],
  ["gaming", "Gaming"],
  ["parenting", "Parenting"],
]);

const SHARED_FOLLOWER_RANGE_BY_LABEL = new Map(
  SHARED_CREATOR_FOLLOWER_RANGES.map((range) => [range.label.toLowerCase(), range])
);

function parseCompactNumber(value: string) {
  const normalized = value.trim().toUpperCase();
  const multiplier = normalized.endsWith("M")
    ? 1_000_000
    : normalized.endsWith("K")
      ? 1_000
      : 1;
  const numeric = Number.parseFloat(normalized.replace(/[KM]/g, ""));
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * multiplier);
}

export function normalizeSharedNiche(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const canonical = SHARED_NICHE_LABELS.find(
    (label) => label.toLowerCase() === trimmed.toLowerCase()
  );
  if (canonical) return canonical;

  return SHARED_NICHE_ALIAS_MAP.get(trimmed.toLowerCase()) ?? trimmed;
}

export function normalizeSharedPlatformId(value?: string | null): SharedPlatformId | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "instagram") return "instagram";
  if (normalized === "youtube") return "youtube";
  return null;
}

export function estimateFollowersCountFromRange(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const canonicalRange = SHARED_FOLLOWER_RANGE_BY_LABEL.get(trimmed.toLowerCase());
  if (canonicalRange) {
    return Math.round((canonicalRange.min + canonicalRange.max) / 2);
  }

  const openEndedMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*([KM]?)\+$/i);
  if (openEndedMatch) {
    const compact = `${openEndedMatch[1]}${openEndedMatch[2] || ""}`;
    return parseCompactNumber(compact);
  }

  const rangeMatch = trimmed.match(
    /^(\d+(?:\.\d+)?)\s*([KM]?)\s*-\s*(\d+(?:\.\d+)?)\s*([KM]?)$/i
  );
  if (!rangeMatch) {
    return parseCompactNumber(trimmed);
  }

  const min = parseCompactNumber(`${rangeMatch[1]}${rangeMatch[2] || ""}`);
  const max = parseCompactNumber(`${rangeMatch[3]}${rangeMatch[4] || rangeMatch[2] || ""}`);
  if (min === null || max === null) return null;
  return Math.round((min + max) / 2);
}

export function parseEngagementRate(value?: string | null) {
  const parsed = Number.parseFloat(value?.trim() || "");
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}
