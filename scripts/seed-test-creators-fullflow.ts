import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_PASSWORD = "Test@12345";
const DEFAULT_CREATORS_PER_NICHE = 20;
const MIN_FOLLOWERS = 10_000;
const MAX_FOLLOWERS = 500_000;
const METRIC_SOURCE = "seed:test_creators_v1";

const BRAND_EMAIL = "brand.seed@testbrand.com";
const MANAGER_EMAIL = "manager.seed@testbrand.com";
const CREATOR_DOMAIN = "testcreator.com";

const DEFAULT_NICHES = [
  "Fashion",
  "Tech",
  "Fitness",
  "Finance",
  "Travel",
  "Food",
  "Gaming",
  "Lifestyle",
  "Education",
];

const FIRST_NAMES = ["Aarav", "Ishita", "Rohan", "Neha", "Kabir", "Sana", "Yash", "Priya", "Dev", "Ananya"];
const LAST_NAMES = ["Mehta", "Kapoor", "Verma", "Sharma", "Nair", "Iyer", "Arora", "Sethi", "Jain", "Patel"];
const LOCATIONS = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Noida"];

type CreatorRef = {
  niche: string;
  email: string;
  userId: string;
  influencerProfileId: string;
  influencerIndexId: string;
  followers: number;
  engagementRate: number;
  suspicious: boolean;
};

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rng(seedText: string) {
  let state = hashText(seedText) || 123456;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toMoney(value: number) {
  return Math.max(500, Math.round(value / 100) * 100);
}

function parseNicheTokens(value: string | null | undefined) {
  if (!value) return [];
  return value.split(",").map((token) => token.trim()).filter(Boolean);
}

function normalizeCategory(niche: string) {
  const s = niche.toLowerCase();
  if (s.includes("fashion")) return "fashion";
  if (s.includes("tech")) return "tech";
  if (s.includes("fitness")) return "fitness";
  if (s.includes("finance")) return "finance";
  if (s.includes("travel")) return "travel";
  if (s.includes("food")) return "food";
  if (s.includes("gaming")) return "gaming";
  if (s.includes("education")) return "education";
  if (s.includes("lifestyle")) return "lifestyle";
  return slugify(niche) || "general";
}

async function loadNiches() {
  const [creatorNiches, profileNiches] = await Promise.all([
    prisma.creator.findMany({ where: { niche: { not: null } }, select: { niche: true } }),
    prisma.influencerProfile.findMany({ where: { niche: { not: null } }, select: { niche: true } }),
  ]);

  const map = new Map<string, string>();
  for (const item of creatorNiches) {
    for (const token of parseNicheTokens(item.niche)) {
      if (!map.has(token.toLowerCase())) map.set(token.toLowerCase(), token);
    }
  }
  for (const item of profileNiches) {
    for (const token of parseNicheTokens(item.niche)) {
      if (!map.has(token.toLowerCase())) map.set(token.toLowerCase(), token);
    }
  }

  const niches = Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  return niches.length ? niches : DEFAULT_NICHES;
}

function buildSlugMap(niches: string[]) {
  const used = new Set<string>();
  const map = new Map<string, string>();
  for (const niche of niches) {
    const base = (slugify(niche) || "creator").slice(0, 22);
    let slug = base;
    let i = 2;
    while (used.has(slug)) {
      slug = `${base}-${i++}`;
    }
    used.add(slug);
    map.set(niche, slug);
  }
  return map;
}

function buildSeed(niche: string, nicheSlug: string, index: number) {
  const r = rng(`${nicheSlug}-${index}`);
  const fullName = `${FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(r() * LAST_NAMES.length)]}`;
  const handleBase = `${nicheSlug}_creator_${String(index).padStart(2, "0")}`;
  const email = `${nicheSlug}.${String(index).padStart(2, "0")}@${CREATOR_DOMAIN}`;
  const followers = Math.floor(MIN_FOLLOWERS + r() * (MAX_FOLLOWERS - MIN_FOLLOWERS));
  const suspicious = index % 11 === 0 || index % 17 === 0;
  const premium = index % 9 === 0;
  const engagementRate = suspicious ? Number((2.4 + r() * 2).toFixed(2)) : premium ? Number((10 + r() * 2.2).toFixed(2)) : Number((5 + r() * 5).toFixed(2));
  const avgLikes = Math.max(40, Math.round(followers * (engagementRate / 100) * (0.48 + r() * 0.22)));
  const avgComments = Math.max(6, Math.round(avgLikes * (0.03 + r() * 0.06)));
  const avgViews = Math.max(avgLikes * 2, Math.round(followers * (0.22 + r() * 0.55)));
  const pricePost = toMoney(followers * (0.052 + r() * 0.02));
  const priceStory = toMoney(pricePost * (0.35 + r() * 0.2));
  const priceCollab = toMoney(pricePost * (2.2 + r() * 0.9));
  const platforms = index % 4 === 0 ? ["Instagram"] : index % 4 === 1 ? ["YouTube"] : index % 4 === 2 ? ["Instagram", "YouTube"] : ["Instagram", "YouTube", "TikTok"];
  const city = LOCATIONS[Math.floor(r() * LOCATIONS.length)];
  const phone = `9${String((hashText(email) % 900000000) + 100000000).padStart(9, "0")}`;

  return {
    niche,
    email,
    fullName,
    phone,
    city,
    followers,
    engagementRate,
    avgLikes,
    avgComments,
    avgViews,
    priceStory,
    pricePost,
    priceCollab,
    suspicious,
    platforms,
    instagramHandle: `@${handleBase}`,
    youtubeHandle: `@${handleBase}_yt`,
    tiktokHandle: `@${handleBase}_tt`,
    instagramUrl: `https://instagram.com/${handleBase}`,
    youtubeUrl: `https://youtube.com/@${handleBase}_yt`,
    tiktokUrl: `https://tiktok.com/@${handleBase}_tt`,
    image: `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`,
  };
}

async function upsertCreator(seed: ReturnType<typeof buildSeed>, passwordHash: string): Promise<{ inserted: boolean; ref: CreatorRef }> {
  const now = new Date();
  const existing = await prisma.user.findUnique({ where: { email: seed.email }, select: { id: true } });

  const ref = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: seed.email },
      update: { name: seed.fullName, passwordHash, role: "INFLUENCER", image: seed.image },
      create: { email: seed.email, name: seed.fullName, passwordHash, role: "INFLUENCER", image: seed.image },
      select: { id: true },
    });

    const otpUser = await tx.otpUser.upsert({
      where: { email: seed.email },
      update: { verifiedAt: now },
      create: { email: seed.email, verifiedAt: now },
      select: { id: true },
    });

    const pricing = JSON.stringify({ story: seed.priceStory, post: seed.pricePost, collab: seed.priceCollab, currency: "INR" });
    const platforms = JSON.stringify(seed.platforms);
    const creatorCommon = {
      email: seed.email,
      fullName: seed.fullName,
      displayName: seed.fullName,
      phone: seed.phone,
      niche: seed.niche,
      instagramUrl: seed.instagramUrl,
      youtubeUrl: seed.youtubeUrl,
      tiktokUrl: seed.tiktokUrl,
      profileImageUrl: seed.image,
      bio: `${seed.fullName} is a ${seed.niche} creator from ${seed.city}.`,
      pricing,
      price: seed.pricePost,
      priceStory: seed.priceStory,
      pricePost: seed.pricePost,
      priceCollab: seed.priceCollab,
      priceType: "Per Post",
      rawSocialData: JSON.stringify({ selfReported: { followers: seed.followers, engagement: seed.engagementRate, location: seed.city } }),
      onboardingCompleted: true,
      platforms,
      verificationStatus: "APPROVED",
      verifiedAt: now,
      mediaKit: JSON.stringify({ avgLikes: seed.avgLikes, avgComments: seed.avgComments, avgViews: seed.avgViews }),
      payoutMethods: JSON.stringify(["UPI", "Bank Transfer"]),
    };

    const creator = await tx.creator.upsert({
      where: { userId: otpUser.id },
      update: creatorCommon,
      create: { userId: otpUser.id, ...creatorCommon },
      select: { id: true },
    });

    const profileCommon = {
      niche: seed.niche,
      location: seed.city,
      bio: `${seed.fullName} creates conversion-focused ${seed.niche.toLowerCase()} content.`,
      instagramHandle: seed.instagramHandle,
      youtubeHandle: seed.youtubeHandle,
      tiktokHandle: seed.tiktokHandle,
      followers: seed.followers,
      engagementRate: seed.engagementRate,
      socialData: JSON.stringify({ avgLikes: seed.avgLikes, avgComments: seed.avgComments, avgViews: seed.avgViews }),
      pricing,
      price: seed.pricePost,
      priceStory: seed.priceStory,
      pricePost: seed.pricePost,
      priceCollab: seed.priceCollab,
      priceType: "Per Post",
      onboardingCompleted: true,
      platforms,
    };

    const influencerProfile = await tx.influencerProfile.upsert({
      where: { userId: user.id },
      update: profileCommon,
      create: { userId: user.id, ...profileCommon },
      select: { id: true, userId: true },
    });

    await tx.kYCSubmission.upsert({
      where: { profileId: influencerProfile.id },
      update: { status: "APPROVED", submittedAt: now, reviewedAt: now, adminNotes: "Seeded test profile approved." },
      create: { profileId: influencerProfile.id, status: "APPROVED", submittedAt: now, reviewedAt: now, adminNotes: "Seeded test profile approved." },
    });

    await tx.creatorKYCSubmission.upsert({
      where: { creatorId: creator.id },
      update: { status: "APPROVED", instagramFollowers: seed.followers, youtubeSubscribers: Math.round(seed.followers * 0.42), totalPosts: Math.max(36, Math.round(seed.followers / 1800)), engagementRate: seed.engagementRate, reviewedBy: "seed-script", reviewedAt: now, adminNotes: "Seeded creator approved." },
      create: { creatorId: creator.id, status: "APPROVED", instagramFollowers: seed.followers, youtubeSubscribers: Math.round(seed.followers * 0.42), totalPosts: Math.max(36, Math.round(seed.followers / 1800)), engagementRate: seed.engagementRate, reviewedBy: "seed-script", reviewedAt: now, adminNotes: "Seeded creator approved." },
    });

    await tx.creatorSelfReportedMetric.upsert({
      where: { creatorId_provider: { creatorId: creator.id, provider: "instagram" } },
      update: { followersCount: seed.followers },
      create: { creatorId: creator.id, provider: "instagram", followersCount: seed.followers },
    });
    await tx.creatorSelfReportedMetric.upsert({
      where: { creatorId_provider: { creatorId: creator.id, provider: "youtube" } },
      update: { followersCount: Math.round(seed.followers * 0.42) },
      create: { creatorId: creator.id, provider: "youtube", followersCount: Math.round(seed.followers * 0.42) },
    });

    await tx.creatorSocialAccount.upsert({
      where: { creatorId_provider: { creatorId: creator.id, provider: "instagram" } },
      update: { providerId: `manual:${seed.instagramHandle.replace("@", "").toLowerCase()}`, username: seed.instagramHandle.replace("@", "").toLowerCase(), type: "MANUAL" },
      create: { creatorId: creator.id, provider: "instagram", providerId: `manual:${seed.instagramHandle.replace("@", "").toLowerCase()}`, username: seed.instagramHandle.replace("@", "").toLowerCase(), type: "MANUAL" },
    });
    await tx.creatorSocialAccount.upsert({
      where: { creatorId_provider: { creatorId: creator.id, provider: "youtube" } },
      update: { providerId: `manual:${seed.youtubeHandle.replace("@", "").toLowerCase()}`, username: seed.youtubeHandle.replace("@", "").toLowerCase(), type: "MANUAL" },
      create: { creatorId: creator.id, provider: "youtube", providerId: `manual:${seed.youtubeHandle.replace("@", "").toLowerCase()}`, username: seed.youtubeHandle.replace("@", "").toLowerCase(), type: "MANUAL" },
    });

    await tx.creatorMetric.deleteMany({ where: { creatorId: creator.id, source: METRIC_SOURCE } });
    await tx.creatorMetric.create({ data: { creatorId: creator.id, provider: "instagram", followersCount: seed.followers, engagementRate: seed.engagementRate, viewsCount: String(seed.avgViews), mediaCount: Math.max(20, Math.round(seed.followers / 9000)), avgLikes: seed.avgLikes, avgComments: seed.avgComments, reach: Math.round(seed.avgViews * 0.85), source: METRIC_SOURCE, fetchedAt: now } });
    await tx.creatorMetric.create({ data: { creatorId: creator.id, provider: "youtube", followersCount: Math.round(seed.followers * 0.42), engagementRate: clamp(Number((seed.engagementRate - 1.1).toFixed(2)), 1.8, 12.5), viewsCount: String(Math.round(seed.avgViews * 1.2)), mediaCount: Math.max(12, Math.round(seed.followers / 22000)), avgLikes: Math.round(seed.avgLikes * 0.64), avgComments: Math.round(seed.avgComments * 0.56), reach: Math.round(seed.avgViews), source: METRIC_SOURCE, fetchedAt: now } });

    const influencer = await tx.influencer.upsert({
      where: { sourceKey: `seed:${seed.email}` },
      update: { sourceType: "SEED_CREATOR", sourceUserId: user.id, email: seed.email, displayName: seed.fullName, category: normalizeCategory(seed.niche), rawCategory: seed.niche, followersCount: seed.followers, engagementRate: seed.engagementRate, priceStory: seed.priceStory, pricePost: seed.pricePost, priceCollab: seed.priceCollab, platforms, profileImageUrl: seed.image, active: true },
      create: { sourceKey: `seed:${seed.email}`, sourceType: "SEED_CREATOR", sourceUserId: user.id, email: seed.email, displayName: seed.fullName, category: normalizeCategory(seed.niche), rawCategory: seed.niche, followersCount: seed.followers, engagementRate: seed.engagementRate, priceStory: seed.priceStory, pricePost: seed.pricePost, priceCollab: seed.priceCollab, platforms, profileImageUrl: seed.image, active: true },
      select: { id: true },
    });

    return { niche: seed.niche, email: seed.email, userId: user.id, influencerProfileId: influencerProfile.id, influencerIndexId: influencer.id, followers: seed.followers, engagementRate: seed.engagementRate, suspicious: seed.suspicious };
  });

  return { inserted: !existing, ref };
}

async function ensureBrandAndManager(passwordHash: string) {
  const brand = await prisma.user.upsert({
    where: { email: BRAND_EMAIL },
    update: { name: "Seed Test Brand", role: "BRAND", passwordHash },
    create: { email: BRAND_EMAIL, name: "Seed Test Brand", role: "BRAND", passwordHash },
    select: { id: true },
  });
  const manager = await prisma.user.upsert({
    where: { email: MANAGER_EMAIL },
    update: { name: "Seed Test Manager", role: "MANAGER", passwordHash },
    create: { email: MANAGER_EMAIL, name: "Seed Test Manager", role: "MANAGER", passwordHash },
    select: { id: true },
  });

  const brandProfile = await prisma.brandProfile.upsert({
    where: { userId: brand.id },
    update: {
      companyName: "Seed Test Brand",
      industry: "Consumer",
      website: "https://seed-test-brand.example",
      location: "Mumbai",
      description: "Auto-generated brand for creator request flow testing.",
      onboardingCompleted: true,
      paymentMethods: JSON.stringify(["UPI", "Bank Transfer"]),
      walletBalance: 2_500_000,
      campaignType: "Product Launch",
      campaignBudget: "2L - 10L",
      targetPlatforms: JSON.stringify(["Instagram", "YouTube"]),
      preferredCreatorType: "Micro",
      campaignGoals: "Visibility and conversions",
      minFollowers: MIN_FOLLOWERS,
      maxFollowers: MAX_FOLLOWERS,
      minPricePerPost: 2500,
      maxPricePerPost: 60000,
      priceType: "Per Post",
    },
    create: {
      userId: brand.id,
      companyName: "Seed Test Brand",
      industry: "Consumer",
      website: "https://seed-test-brand.example",
      location: "Mumbai",
      description: "Auto-generated brand for creator request flow testing.",
      onboardingCompleted: true,
      paymentMethods: JSON.stringify(["UPI", "Bank Transfer"]),
      walletBalance: 2_500_000,
      campaignType: "Product Launch",
      campaignBudget: "2L - 10L",
      targetPlatforms: JSON.stringify(["Instagram", "YouTube"]),
      preferredCreatorType: "Micro",
      campaignGoals: "Visibility and conversions",
      minFollowers: MIN_FOLLOWERS,
      maxFollowers: MAX_FOLLOWERS,
      minPricePerPost: 2500,
      maxPricePerPost: 60000,
      priceType: "Per Post",
    },
    select: { id: true },
  });

  await prisma.brandWallet.upsert({
    where: { brandId: brandProfile.id },
    update: { balance: 2_500_000, currency: "INR" },
    create: { brandId: brandProfile.id, balance: 2_500_000, currency: "INR" },
  });

  return { brandProfileId: brandProfile.id, managerUserId: manager.id };
}

async function seedCampaignInvites(brandProfileId: string, managerUserId: string, creatorsByNiche: Map<string, CreatorRef[]>, nicheSlugs: Map<string, string>) {
  const targetNiches = Array.from(creatorsByNiche.keys()).slice(0, Math.min(5, creatorsByNiche.size));
  let campaigns = 0;
  let invites = 0;

  for (const niche of targetNiches) {
    const slug = nicheSlugs.get(niche) || slugify(niche);
    const creators = (creatorsByNiche.get(niche) || []).slice(0, 8);
    if (!creators.length) continue;

    const campaign = await prisma.campaign.upsert({
      where: { id: `seed-paid-campaign-${slug}` },
      update: { brandId: brandProfileId, title: `Seed Paid Campaign - ${niche}`, description: `Auto-seeded paid campaign for ${niche}.`, requirements: "1 Reel/Video + 2 Stories", budget: creators.reduce((sum, c) => sum + Math.max(c.followers, MIN_FOLLOWERS), 0), influencerType: `RANGE_${MIN_FOLLOWERS}_${MAX_FOLLOWERS}`, platform: "Instagram,YouTube", engagementMin: 5, engagementMax: 10, paymentStatus: "PAID", paidAt: new Date(), status: "ACTIVE", niche, minFollowers: MIN_FOLLOWERS, paymentType: "UPFRONT", images: "[]" },
      create: { id: `seed-paid-campaign-${slug}`, brandId: brandProfileId, title: `Seed Paid Campaign - ${niche}`, description: `Auto-seeded paid campaign for ${niche}.`, requirements: "1 Reel/Video + 2 Stories", budget: creators.reduce((sum, c) => sum + Math.max(c.followers, MIN_FOLLOWERS), 0), influencerType: `RANGE_${MIN_FOLLOWERS}_${MAX_FOLLOWERS}`, platform: "Instagram,YouTube", engagementMin: 5, engagementMax: 10, paymentStatus: "PAID", paidAt: new Date(), status: "ACTIVE", niche, minFollowers: MIN_FOLLOWERS, paymentType: "UPFRONT", images: "[]" },
      select: { id: true },
    });

    await prisma.campaignAssignment.upsert({
      where: { campaignId: campaign.id },
      update: { managerId: managerUserId },
      create: { campaignId: campaign.id, managerId: managerUserId },
    });

    for (let i = 0; i < creators.length; i++) {
      const creator = creators[i];
      const candidate = await prisma.campaignCandidate.upsert({
        where: { campaignId_influencerId: { campaignId: campaign.id, influencerId: creator.influencerProfileId } },
        update: { status: "CONTACTED", brandDecision: "ACCEPTED", creatorDecision: "PENDING", matchScore: creator.engagementRate, qualityScore: clamp(creator.engagementRate * 10, 0, 100), fakeEngagementFlag: creator.suspicious, estimatedBrandCharge: Math.max(creator.followers, MIN_FOLLOWERS), estimatedCreatorPayout: Number((Math.max(creator.followers, MIN_FOLLOWERS) * 0.1).toFixed(2)), managerReviewStatus: "PENDING", managerReviewNotes: "Seeded invitation for dashboard testing." },
        create: { campaignId: campaign.id, influencerId: creator.influencerProfileId, status: "CONTACTED", brandDecision: "ACCEPTED", creatorDecision: "PENDING", matchScore: creator.engagementRate, qualityScore: clamp(creator.engagementRate * 10, 0, 100), fakeEngagementFlag: creator.suspicious, estimatedBrandCharge: Math.max(creator.followers, MIN_FOLLOWERS), estimatedCreatorPayout: Number((Math.max(creator.followers, MIN_FOLLOWERS) * 0.1).toFixed(2)), managerReviewStatus: "PENDING", managerReviewNotes: "Seeded invitation for dashboard testing.", notes: JSON.stringify({ source: "seed-test-creators-fullflow" }) },
        include: { influencer: { select: { userId: true } } },
      });

      if (i < 2 && candidate.influencer.userId) {
        const thread = await prisma.chatThread.upsert({
          where: { candidateId: candidate.id },
          update: { participants: `${managerUserId},${candidate.influencer.userId}` },
          create: { candidateId: candidate.id, participants: `${managerUserId},${candidate.influencer.userId}`, initiatedBy: `seed:campaign:${campaign.id}:candidate:${candidate.id}` },
          select: { id: true },
        });
        const existingMessage = await prisma.message.findFirst({ where: { threadId: thread.id, content: { contains: "Seeded invite thread" } }, select: { id: true } });
        if (!existingMessage) {
          await prisma.message.create({ data: { threadId: thread.id, senderId: managerUserId, content: "Seeded invite thread: Please review and respond to this paid campaign invitation.", status: "SENT" } });
        }
      }

      invites += 1;
    }

    campaigns += 1;
  }

  return { campaigns, invites };
}

async function seedBrandCampaignRequests(brandProfileId: string, creatorsByNiche: Map<string, CreatorRef[]>, nicheSlugs: Map<string, string>) {
  const targetNiches = Array.from(creatorsByNiche.keys()).slice(0, Math.min(3, creatorsByNiche.size));
  let campaigns = 0;
  let requests = 0;

  for (const niche of targetNiches) {
    const slug = nicheSlugs.get(niche) || slugify(niche);
    const creators = (creatorsByNiche.get(niche) || []).slice(0, 12);
    if (!creators.length) continue;

    const brandCampaign = await prisma.brandCampaign.upsert({
      where: { id: `seed-brand-campaign-${slug}` },
      update: { brandId: brandProfileId, title: `Seed Matching Campaign - ${niche}`, summary: "Auto-generated matching campaign for request flow testing.", totalBudget: 750000, category: normalizeCategory(niche), categoryLabel: niche, minFollowers: MIN_FOLLOWERS, maxFollowers: MAX_FOLLOWERS, status: "active", targetAcceptedCount: 20, activeRequestLimit: 20, matchingTriggeredAt: new Date() },
      create: { id: `seed-brand-campaign-${slug}`, brandId: brandProfileId, title: `Seed Matching Campaign - ${niche}`, summary: "Auto-generated matching campaign for request flow testing.", totalBudget: 750000, category: normalizeCategory(niche), categoryLabel: niche, minFollowers: MIN_FOLLOWERS, maxFollowers: MAX_FOLLOWERS, status: "active", targetAcceptedCount: 20, activeRequestLimit: 20, matchingTriggeredAt: new Date() },
      select: { id: true },
    });

    for (let i = 0; i < creators.length; i++) {
      const creator = creators[i];
      const now = new Date();
      const status = i % 8 === 0 ? "accepted" : i % 11 === 0 ? "rejected" : "pending";
      await prisma.collaborationRequest.upsert({
        where: { campaignId_influencerId: { campaignId: brandCampaign.id, influencerId: creator.influencerIndexId } },
        update: { status, expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + i * 60 * 1000), respondedAt: status === "pending" ? null : now, acceptedAt: status === "accepted" ? now : null, rejectionReason: status === "rejected" ? "seeded_test_rejection" : null, archivedAt: null, expiredAt: null },
        create: { campaignId: brandCampaign.id, influencerId: creator.influencerIndexId, status, expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + i * 60 * 1000), respondedAt: status === "pending" ? null : now, acceptedAt: status === "accepted" ? now : null, rejectionReason: status === "rejected" ? "seeded_test_rejection" : null },
      });
      requests += 1;
    }

    campaigns += 1;
  }

  return { campaigns, requests };
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This script is blocked in production.");
  }

  const creatorsPerNiche = Math.max(1, Number(process.env.SEED_CREATORS_PER_NICHE || DEFAULT_CREATORS_PER_NICHE));
  const maxNiches = Math.max(0, Number(process.env.SEED_MAX_NICHES || 0));

  const allNiches = await loadNiches();
  const niches = maxNiches > 0 ? allNiches.slice(0, maxNiches) : allNiches;
  const nicheSlugs = buildSlugMap(niches);
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const creatorsByNiche = new Map<string, CreatorRef[]>();
  let inserted = 0;
  let updated = 0;

  console.log(`[seed:test-creators] Niches discovered: ${allNiches.length}`);
  if (maxNiches > 0 && niches.length < allNiches.length) {
    console.log(`[seed:test-creators] Limiting to first ${niches.length} niches due to SEED_MAX_NICHES=${maxNiches}`);
  }
  for (const niche of niches) {
    const slug = nicheSlugs.get(niche) || slugify(niche);
    const refs: CreatorRef[] = [];
    console.log(`[seed:test-creators] ${niche}: seeding ${creatorsPerNiche}`);
    for (let i = 1; i <= creatorsPerNiche; i++) {
      const seed = buildSeed(niche, slug, i);
      const result = await upsertCreator(seed, passwordHash);
      if (result.inserted) inserted++; else updated++;
      refs.push(result.ref);
    }
    creatorsByNiche.set(niche, refs);
  }

  const { brandProfileId, managerUserId } = await ensureBrandAndManager(passwordHash);
  const inviteResult = await seedCampaignInvites(brandProfileId, managerUserId, creatorsByNiche, nicheSlugs);
  const requestResult = await seedBrandCampaignRequests(brandProfileId, creatorsByNiche, nicheSlugs);

  console.log("");
  console.log("========== SEED SUMMARY ==========");
  console.log(`Niches found: ${niches.length}`);
  console.log(`Creators planned: ${niches.length * creatorsPerNiche}`);
  console.log(`Creators inserted: ${inserted}`);
  console.log(`Creators updated: ${updated}`);
  console.log(`Paid campaigns seeded: ${inviteResult.campaigns}`);
  console.log(`Campaign candidate invites seeded: ${inviteResult.invites}`);
  console.log(`Brand campaigns seeded: ${requestResult.campaigns}`);
  console.log(`Collaboration requests seeded: ${requestResult.requests}`);
  console.log(`Creator email format: <niche-slug>.01-20@${CREATOR_DOMAIN}`);
  console.log(`Creator/Brand/Manager password: ${TEST_PASSWORD}`);
  console.log(`Brand login: ${BRAND_EMAIL}`);
  console.log(`Manager login: ${MANAGER_EMAIL}`);
  console.log("==================================");
}

main()
  .catch((error) => {
    console.error("[seed:test-creators] FAILED", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
