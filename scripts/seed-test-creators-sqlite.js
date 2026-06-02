const crypto = require("node:crypto");
const sqlite = require("node:sqlite");
const bcrypt = require("bcryptjs");

const db = new sqlite.DatabaseSync("prisma/dev.db");

const TEST_PASSWORD = "Test@12345";
const CREATORS_PER_NICHE = 20;
const MIN_FOLLOWERS = 10_000;
const MAX_FOLLOWERS = 500_000;

const BRAND_EMAIL = "brand.seed@testbrand.com";
const MANAGER_EMAIL = "manager.seed@testbrand.com";
const CREATOR_DOMAIN = "testcreator.com";

const ONBOARDING_NICHES = [
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
];

const CAMPAIGN_STRATEGIES = [
  "Product Promotion",
  "Brand Awareness",
  "App Installs",
  "Event Promotion",
  "Affiliate Marketing",
  "Other",
];

const INDIAN_MALE_PROFILES = [
  { name: 'Aarav Mehta', image: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?w=500&auto=format&fit=crop&q=80' },
  { name: 'Rohan Verma', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop&q=80' },
  { name: 'Kabir Sharma', image: 'https://images.unsplash.com/photo-1629872430082-93d8912beccf?w=500&auto=format&fit=crop&q=80' },
  { name: 'Yash Kapoor', image: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=500&auto=format&fit=crop&q=80' },
  { name: 'Dev Nair', image: 'https://images.unsplash.com/photo-1613679074971-91fc27180061?w=500&auto=format&fit=crop&q=80' },
  { name: 'Vihaan Iyer', image: 'https://images.unsplash.com/photo-1602442787305-decbd65be507?w=500&auto=format&fit=crop&q=80' },
  { name: 'Arjun Arora', image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=500&auto=format&fit=crop&q=80' },
  { name: 'Aditya Sethi', image: 'https://images.unsplash.com/photo-1626548307930-deac221f87d9?w=500&auto=format&fit=crop&q=80' },
  { name: 'Reyansh Jain', image: 'https://images.unsplash.com/photo-1624298357597-fd92dfbec01d?w=500&auto=format&fit=crop&q=80' },
  { name: 'Ishaan Patel', image: 'https://images.unsplash.com/photo-1619380061814-58f03707f082?w=500&auto=format&fit=crop&q=80' },
  { name: 'Aniket Trivedi', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=500&auto=format&fit=crop&q=80' }
];

const INDIAN_FEMALE_PROFILES = [
  { name: 'Ishita Mehta', image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=500&auto=format&fit=crop&q=80' },
  { name: 'Neha Kapoor', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80' },
  { name: 'Sana Verma', image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=80' },
  { name: 'Priya Sharma', image: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=500&auto=format&fit=crop&q=80' },
  { name: 'Ananya Nair', image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=500&auto=format&fit=crop&q=80' },
  { name: 'Kiara Arora', image: 'https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?w=500&auto=format&fit=crop&q=80' },
  { name: 'Aaradhya Sethi', image: 'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=500&auto=format&fit=crop&q=80' },
  { name: 'Diya Iyer', image: 'https://images.unsplash.com/photo-1596215143922-eedeaba0d91c?w=500&auto=format&fit=crop&q=80' },
  { name: 'Meera Joshi', image: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=500&auto=format&fit=crop&q=80' },
  { name: 'Nisha Patel', image: 'https://images.unsplash.com/photo-1611432579699-484f7990b127?w=500&auto=format&fit=crop&q=80' },
  { name: 'Pooja Trivedi', image: 'https://images.unsplash.com/photo-1605980776566-0486c3ac7617?w=500&auto=format&fit=crop&q=80' },
  { name: 'Bhumi Choudhary', image: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=500&auto=format&fit=crop&q=80' },
  { name: 'Kavya Rao', image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=500&auto=format&fit=crop&q=80' },
  { name: 'Aditi Desai', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80' },
  { name: 'Shruti Singhania', image: 'https://images.unsplash.com/photo-1614644147724-2d4785d69962?w=500&auto=format&fit=crop&q=80' },
  { name: 'Tanvi Malhotra', image: 'https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?w=500&auto=format&fit=crop&q=80' }
];

const LOCATIONS = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Noida"];

function nowIso() {
  return new Date().toISOString();
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashText(value) {
  let hash = 2166136261;
  const s = String(value || "");
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seedText) {
  let state = hashText(seedText) || 123456;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toMoney(value) {
  return Math.max(500, Math.round(value / 100) * 100);
}

function cuidLike(prefix = "c") {
  return `${prefix}${crypto.randomBytes(12).toString("hex")}`;
}

function uuid() {
  return crypto.randomUUID();
}

function parseNicheTokens(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

function normalizeCategory(niche) {
  const s = String(niche || "").toLowerCase();
  if (s.includes("fashion") || s.includes("style")) return "fashion";
  if (s.includes("tech") || s.includes("gadget")) return "tech";
  if (s.includes("beauty") || s.includes("makeup")) return "beauty";
  if (s.includes("health") || s.includes("wellness")) return "health";
  if (s.includes("fitness")) return "fitness";
  if (s.includes("finance") || s.includes("crypto")) return "finance";
  if (s.includes("travel")) return "travel";
  if (s.includes("food") || s.includes("culinary")) return "food";
  if (s.includes("gaming")) return "gaming";
  if (s.includes("education")) return "education";
  if (s.includes("lifestyle")) return "lifestyle";
  if (s.includes("parent")) return "parenting";
  return slugify(niche) || "general";
}

function loadNiches() {
  const map = new Map();

  // Keep onboarding niches as canonical targets for deterministic 20x generation.
  for (const niche of ONBOARDING_NICHES) {
    map.set(niche.toLowerCase(), niche);
  }

  // Optionally include additional existing custom niches.
  if (process.env.SEED_INCLUDE_EXISTING_NICHES === "true") {
    const creatorRows = db.prepare(`SELECT niche FROM creators WHERE niche IS NOT NULL`).all();
    const profileRows = db.prepare(`SELECT niche FROM "InfluencerProfile" WHERE niche IS NOT NULL`).all();
    for (const row of [...creatorRows, ...profileRows]) {
      for (const token of parseNicheTokens(row.niche)) {
        const key = token.toLowerCase();
        if (!map.has(key)) map.set(key, token);
      }
    }
  }

  return Array.from(map.values());
}

function buildSlugMap(niches) {
  const used = new Set();
  const map = new Map();
  for (const niche of niches) {
    const base = (slugify(niche) || "creator").slice(0, 22);
    let slug = base;
    let i = 2;
    while (used.has(slug)) slug = `${base}-${i++}`;
    used.add(slug);
    map.set(niche, slug);
  }
  return map;
}

function buildSeed(niche, nicheSlug, index) {
  const r = createRng(`${nicheSlug}-${index}`);

  // Alternate genders deterministically based on index to keep a perfect 50/50 balance
  let profile;
  if (index % 2 === 0) {
    const fIdx = Math.floor(r() * INDIAN_FEMALE_PROFILES.length);
    profile = INDIAN_FEMALE_PROFILES[fIdx];
  } else {
    const mIdx = Math.floor(r() * INDIAN_MALE_PROFILES.length);
    profile = INDIAN_MALE_PROFILES[mIdx];
  }
  const fullName = profile.name;
  const image = profile.image;

  const handleBase = `${nicheSlug}_creator_${String(index).padStart(2, "0")}`;
  const email = `${nicheSlug}.${String(index).padStart(2, "0")}@${CREATOR_DOMAIN}`;
  const followers = Math.floor(MIN_FOLLOWERS + r() * (MAX_FOLLOWERS - MIN_FOLLOWERS));
  const suspicious = index % 11 === 0 || index % 17 === 0;
  const premium = index % 9 === 0;
  const engagementRate = suspicious
    ? Number((2.4 + r() * 2).toFixed(2))
    : premium
      ? Number((10 + r() * 2.2).toFixed(2))
      : Number((5 + r() * 5).toFixed(2));
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
    image,
  };
}

const q = {
  getUserByEmail: db.prepare(`SELECT id FROM "User" WHERE email = ?`),
  insertUser: db.prepare(`INSERT INTO "User" (id,name,email,passwordHash,image,role,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`),
  updateUser: db.prepare(`UPDATE "User" SET name=?, passwordHash=?, image=?, role='INFLUENCER', updatedAt=? WHERE id=?`),

  getOtpByEmail: db.prepare(`SELECT id FROM users WHERE email = ?`),
  insertOtp: db.prepare(`INSERT INTO users (id,email,verified_at,created_at) VALUES (?,?,?,?)`),
  updateOtp: db.prepare(`UPDATE users SET verified_at=? WHERE id=?`),

  getCreatorByUserId: db.prepare(`SELECT id FROM creators WHERE user_id = ?`),
  insertCreator: db.prepare(`
    INSERT INTO creators
    (id,user_id,email,full_name,phone,niche,instagram_url,youtube_url,tiktok_url,profile_image_url,display_name,bio,pricing,price,price_story,price_post,price_collab,price_type,media_kit,raw_social_data,payout_methods,verification_status,verified_at,onboardingCompleted,platforms,is_live_sync_enabled)
    VALUES
    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `),
  updateCreator: db.prepare(`
    UPDATE creators SET
      email=?, full_name=?, phone=?, niche=?, instagram_url=?, youtube_url=?, tiktok_url=?, profile_image_url=?, display_name=?, bio=?, pricing=?, price=?, price_story=?, price_post=?, price_collab=?, price_type=?, media_kit=?, raw_social_data=?, payout_methods=?, verification_status='APPROVED', verified_at=?, onboardingCompleted=1, platforms=?, is_live_sync_enabled=1
    WHERE id=?
  `),

  getProfileByUserId: db.prepare(`SELECT id FROM "InfluencerProfile" WHERE userId = ?`),
  insertProfile: db.prepare(`
    INSERT INTO "InfluencerProfile"
    (id,userId,niche,location,bio,instagramHandle,youtubeHandle,tiktokHandle,followers,engagementRate,socialData,pricing,price,priceStory,pricePost,priceCollab,priceType,onboardingCompleted,platforms)
    VALUES
    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `),
  updateProfile: db.prepare(`
    UPDATE "InfluencerProfile" SET
      niche=?, location=?, bio=?, instagramHandle=?, youtubeHandle=?, tiktokHandle=?, followers=?, engagementRate=?, socialData=?, pricing=?, price=?, priceStory=?, pricePost=?, priceCollab=?, priceType='Per Post', onboardingCompleted=1, platforms=?
    WHERE id=?
  `),

  getKycByProfile: db.prepare(`SELECT id FROM "KYCSubmission" WHERE profileId = ?`),
  insertKyc: db.prepare(`INSERT INTO "KYCSubmission" (id,profileId,status,submittedAt,reviewedAt,adminNotes) VALUES (?,?,?,?,?,?)`),
  updateKyc: db.prepare(`UPDATE "KYCSubmission" SET status='APPROVED', submittedAt=?, reviewedAt=?, adminNotes=? WHERE id=?`),

  getCreatorKycByCreator: db.prepare(`SELECT id FROM creator_kyc_submissions WHERE creator_id = ?`),
  insertCreatorKyc: db.prepare(`INSERT INTO creator_kyc_submissions (id,creator_id,status,instagram_followers,youtube_subscribers,total_posts,engagement_rate,admin_notes,reviewed_by,reviewed_at,submitted_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`),
  updateCreatorKyc: db.prepare(`UPDATE creator_kyc_submissions SET status='APPROVED', instagram_followers=?, youtube_subscribers=?, total_posts=?, engagement_rate=?, admin_notes=?, reviewed_by=?, reviewed_at=?, updated_at=? WHERE id=?`),

  upsertSelfMetricSelect: db.prepare(`SELECT id FROM creator_self_reported_metrics WHERE creator_id=? AND provider=?`),
  insertSelfMetric: db.prepare(`INSERT INTO creator_self_reported_metrics (id,creator_id,provider,followers_count,updated_at) VALUES (?,?,?,?,?)`),
  updateSelfMetric: db.prepare(`UPDATE creator_self_reported_metrics SET followers_count=?, updated_at=? WHERE id=?`),

  upsertSocialSelect: db.prepare(`SELECT id FROM creator_social_accounts WHERE creator_id=? AND provider=?`),
  insertSocial: db.prepare(`INSERT INTO creator_social_accounts (id,creator_id,provider,provider_id,username,type,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)`),
  updateSocial: db.prepare(`UPDATE creator_social_accounts SET provider_id=?, username=?, type='MANUAL', updated_at=? WHERE id=?`),

  deleteSeedMetrics: db.prepare(`DELETE FROM creator_metrics WHERE creator_id=? AND source='seed:test_creators_sqlite'`),
  insertMetric: db.prepare(`INSERT INTO creator_metrics (id,creator_id,provider,date,followers_count,engagement_rate,views_count,media_count,avg_likes,avg_comments,reach,source,fetched_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`),

  getInfluencerBySourceKey: db.prepare(`SELECT id FROM "Influencer" WHERE sourceKey=?`),
  insertInfluencer: db.prepare(`INSERT INTO "Influencer" (id,sourceKey,sourceType,sourceUserId,email,displayName,category,rawCategory,followersCount,engagementRate,priceStory,pricePost,priceCollab,platforms,profileImageUrl,active,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),
  updateInfluencer: db.prepare(`UPDATE "Influencer" SET sourceType=?,sourceUserId=?,email=?,displayName=?,category=?,rawCategory=?,followersCount=?,engagementRate=?,priceStory=?,pricePost=?,priceCollab=?,platforms=?,profileImageUrl=?,active=1,updatedAt=? WHERE id=?`),

  getBrandByEmail: db.prepare(`SELECT id FROM "User" WHERE email=?`),
  insertBrandUser: db.prepare(`INSERT INTO "User" (id,name,email,passwordHash,role,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?)`),
  updateBrandUser: db.prepare(`UPDATE "User" SET name=?, passwordHash=?, role=?, updatedAt=? WHERE id=?`),

  getBrandProfileByUserId: db.prepare(`SELECT id FROM "BrandProfile" WHERE userId=?`),
  insertBrandProfile: db.prepare(`INSERT INTO "BrandProfile" (id,userId,companyName,website,industry,description,location,paymentMethods,walletBalance,onboardingCompleted,campaignType,campaignBudget,targetPlatforms,preferredCreatorType,campaignGoals,minFollowers,maxFollowers,minPricePerPost,maxPricePerPost,priceType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),
  updateBrandProfile: db.prepare(`UPDATE "BrandProfile" SET companyName=?, website=?, industry=?, description=?, location=?, paymentMethods=?, walletBalance=?, onboardingCompleted=1, campaignType=?, campaignBudget=?, targetPlatforms=?, preferredCreatorType=?, campaignGoals=?, minFollowers=?, maxFollowers=?, minPricePerPost=?, maxPricePerPost=?, priceType=? WHERE id=?`),

  getWalletByBrandId: db.prepare(`SELECT id FROM "BrandWallet" WHERE brandId=?`),
  insertWallet: db.prepare(`INSERT INTO "BrandWallet" (id,brandId,balance,currency,updatedAt) VALUES (?,?,?,?,?)`),
  updateWallet: db.prepare(`UPDATE "BrandWallet" SET balance=?, currency='INR', updatedAt=? WHERE id=?`),

  getCampaignById: db.prepare(`SELECT id FROM "Campaign" WHERE id=?`),
  insertCampaign: db.prepare(`INSERT INTO "Campaign" (id,brandId,title,description,requirements,budget,influencerType,platform,engagementMin,engagementMax,paymentStatus,paidAt,status,startDate,endDate,createdAt,updatedAt,images,minFollowers,niche,paymentType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),
  updateCampaign: db.prepare(`UPDATE "Campaign" SET brandId=?, title=?, description=?, requirements=?, budget=?, influencerType=?, platform=?, engagementMin=?, engagementMax=?, paymentStatus=?, paidAt=?, status=?, startDate=?, endDate=?, updatedAt=?, images='[]', minFollowers=?, niche=?, paymentType='UPFRONT' WHERE id=?`),

  getAssignmentByCampaign: db.prepare(`SELECT id FROM "CampaignAssignment" WHERE campaignId=?`),
  insertAssignment: db.prepare(`INSERT INTO "CampaignAssignment" (id,campaignId,managerId,assignedAt) VALUES (?,?,?,?)`),
  updateAssignment: db.prepare(`UPDATE "CampaignAssignment" SET managerId=?, assignedAt=? WHERE id=?`),

  getCandidateByCampaignInfluencer: db.prepare(`SELECT id FROM "CampaignCandidate" WHERE campaignId=? AND influencerId=?`),
  insertCandidate: db.prepare(`INSERT INTO "CampaignCandidate" (id,campaignId,influencerId,status,brandDecision,creatorDecision,shuffleCount,matchScore,qualityScore,fakeEngagementFlag,estimatedBrandCharge,estimatedCreatorPayout,managerReviewStatus,managerReviewNotes,notes,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),
  updateCandidate: db.prepare(`UPDATE "CampaignCandidate" SET status='CONTACTED',brandDecision='ACCEPTED',creatorDecision='PENDING',matchScore=?,qualityScore=?,fakeEngagementFlag=?,estimatedBrandCharge=?,estimatedCreatorPayout=?,managerReviewStatus='PENDING',managerReviewNotes=?,updatedAt=? WHERE id=?`),

  getBrandCampaignById: db.prepare(`SELECT id FROM "BrandCampaign" WHERE id=?`),
  insertBrandCampaign: db.prepare(`INSERT INTO "BrandCampaign" (id,brandId,title,summary,totalBudget,category,categoryLabel,minFollowers,maxFollowers,status,targetAcceptedCount,activeRequestLimit,matchingTriggeredAt,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),
  updateBrandCampaign: db.prepare(`UPDATE "BrandCampaign" SET brandId=?, title=?, summary=?, totalBudget=?, category=?, categoryLabel=?, minFollowers=?, maxFollowers=?, status='active', targetAcceptedCount=20, activeRequestLimit=20, matchingTriggeredAt=?, updatedAt=? WHERE id=?`),

  getCollabReqByCampaignInfluencer: db.prepare(`SELECT id FROM "CollaborationRequest" WHERE campaignId=? AND influencerId=?`),
  insertCollabReq: db.prepare(`INSERT INTO "CollaborationRequest" (id,campaignId,influencerId,status,sentAt,expiresAt,respondedAt,acceptedAt,rejectionReason,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`),
  updateCollabReq: db.prepare(`UPDATE "CollaborationRequest" SET status=?, sentAt=?, expiresAt=?, respondedAt=?, acceptedAt=?, rejectionReason=?, archivedAt=NULL, expiredAt=NULL, updatedAt=? WHERE id=?`),
};

function upsertCreator(seed, passwordHash) {
  const now = nowIso();
  const pricing = JSON.stringify({ story: seed.priceStory, post: seed.pricePost, collab: seed.priceCollab, currency: "INR" });
  const platformsJson = JSON.stringify(seed.platforms);

  let user = q.getUserByEmail.get(seed.email);
  const insertedUser = !user;
  if (!user) {
    user = { id: cuidLike("usr") };
    q.insertUser.run(user.id, seed.fullName, seed.email, passwordHash, seed.image, "INFLUENCER", now, now);
  } else {
    q.updateUser.run(seed.fullName, passwordHash, seed.image, now, user.id);
  }

  let otp = q.getOtpByEmail.get(seed.email);
  if (!otp) {
    otp = { id: uuid() };
    q.insertOtp.run(otp.id, seed.email, now, now);
  } else {
    q.updateOtp.run(now, otp.id);
  }

  let creator = q.getCreatorByUserId.get(otp.id);
  if (!creator) {
    creator = { id: uuid() };
    q.insertCreator.run(
      creator.id, otp.id, seed.email, seed.fullName, seed.phone, seed.niche, seed.instagramUrl, seed.youtubeUrl, seed.tiktokUrl,
      seed.image, seed.fullName, `${seed.fullName} is a ${seed.niche} creator from ${seed.city}.`, pricing, seed.pricePost, seed.priceStory,
      seed.pricePost, seed.priceCollab, "Per Post", JSON.stringify({ avgLikes: seed.avgLikes, avgComments: seed.avgComments, avgViews: seed.avgViews }),
      JSON.stringify({ selfReported: { followers: seed.followers, engagement: seed.engagementRate, location: seed.city } }),
      JSON.stringify(["UPI", "Bank Transfer"]), "APPROVED", now, 1, platformsJson, 1
    );
  } else {
    q.updateCreator.run(
      seed.email, seed.fullName, seed.phone, seed.niche, seed.instagramUrl, seed.youtubeUrl, seed.tiktokUrl, seed.image, seed.fullName,
      `${seed.fullName} is a ${seed.niche} creator from ${seed.city}.`, pricing, seed.pricePost, seed.priceStory, seed.pricePost, seed.priceCollab,
      "Per Post", JSON.stringify({ avgLikes: seed.avgLikes, avgComments: seed.avgComments, avgViews: seed.avgViews }),
      JSON.stringify({ selfReported: { followers: seed.followers, engagement: seed.engagementRate, location: seed.city } }),
      JSON.stringify(["UPI", "Bank Transfer"]), now, platformsJson, creator.id
    );
  }

  let profile = q.getProfileByUserId.get(user.id);
  if (!profile) {
    profile = { id: cuidLike("inf") };
    q.insertProfile.run(
      profile.id, user.id, seed.niche, seed.city, `${seed.fullName} creates conversion-focused ${seed.niche.toLowerCase()} content.`,
      seed.instagramHandle, seed.youtubeHandle, seed.tiktokHandle, seed.followers, seed.engagementRate,
      JSON.stringify({ avgLikes: seed.avgLikes, avgComments: seed.avgComments, avgViews: seed.avgViews }),
      pricing, seed.pricePost, seed.priceStory, seed.pricePost, seed.priceCollab, "Per Post", 1, platformsJson
    );
  } else {
    q.updateProfile.run(
      seed.niche, seed.city, `${seed.fullName} creates conversion-focused ${seed.niche.toLowerCase()} content.`,
      seed.instagramHandle, seed.youtubeHandle, seed.tiktokHandle, seed.followers, seed.engagementRate,
      JSON.stringify({ avgLikes: seed.avgLikes, avgComments: seed.avgComments, avgViews: seed.avgViews }),
      pricing, seed.pricePost, seed.priceStory, seed.pricePost, seed.priceCollab, platformsJson, profile.id
    );
  }

  let kyc = q.getKycByProfile.get(profile.id);
  if (!kyc) {
    kyc = { id: cuidLike("kyc") };
    q.insertKyc.run(kyc.id, profile.id, "APPROVED", now, now, "Seeded test profile approved.");
  } else {
    q.updateKyc.run(now, now, "Seeded test profile approved.", kyc.id);
  }

  let creatorKyc = q.getCreatorKycByCreator.get(creator.id);
  if (!creatorKyc) {
    creatorKyc = { id: uuid() };
    q.insertCreatorKyc.run(
      creatorKyc.id, creator.id, "APPROVED", seed.followers, Math.round(seed.followers * 0.42), Math.max(36, Math.round(seed.followers / 1800)),
      seed.engagementRate, "Seeded creator approved.", "seed-script", now, now, now
    );
  } else {
    q.updateCreatorKyc.run(
      seed.followers, Math.round(seed.followers * 0.42), Math.max(36, Math.round(seed.followers / 1800)),
      seed.engagementRate, "Seeded creator approved.", "seed-script", now, now, creatorKyc.id
    );
  }

  for (const [provider, followers] of [["instagram", seed.followers], ["youtube", Math.round(seed.followers * 0.42)]]) {
    const metricRow = q.upsertSelfMetricSelect.get(creator.id, provider);
    if (!metricRow) q.insertSelfMetric.run(uuid(), creator.id, provider, followers, now);
    else q.updateSelfMetric.run(followers, now, metricRow.id);
  }

  const socialRows = [
    ["instagram", `manual:${seed.instagramHandle.replace("@", "").toLowerCase()}`, seed.instagramHandle.replace("@", "").toLowerCase()],
    ["youtube", `manual:${seed.youtubeHandle.replace("@", "").toLowerCase()}`, seed.youtubeHandle.replace("@", "").toLowerCase()],
  ];
  for (const [provider, providerId, username] of socialRows) {
    const social = q.upsertSocialSelect.get(creator.id, provider);
    if (!social) q.insertSocial.run(uuid(), creator.id, provider, providerId, username, "MANUAL", now, now);
    else q.updateSocial.run(providerId, username, now, social.id);
  }

  q.deleteSeedMetrics.run(creator.id);
  q.insertMetric.run(uuid(), creator.id, "instagram", now, seed.followers, seed.engagementRate, String(seed.avgViews), Math.max(20, Math.round(seed.followers / 9000)), seed.avgLikes, seed.avgComments, Math.round(seed.avgViews * 0.85), "seed:test_creators_sqlite", now);
  q.insertMetric.run(uuid(), creator.id, "youtube", now, Math.round(seed.followers * 0.42), clamp(Number((seed.engagementRate - 1.1).toFixed(2)), 1.8, 12.5), String(Math.round(seed.avgViews * 1.2)), Math.max(12, Math.round(seed.followers / 22000)), Math.round(seed.avgLikes * 0.64), Math.round(seed.avgComments * 0.56), Math.round(seed.avgViews), "seed:test_creators_sqlite", now);

  const sourceKey = `seed:${seed.email}`;
  let influencer = q.getInfluencerBySourceKey.get(sourceKey);
  if (!influencer) {
    influencer = { id: cuidLike("idx") };
    q.insertInfluencer.run(
      influencer.id, sourceKey, "SEED_CREATOR", user.id, seed.email, seed.fullName, normalizeCategory(seed.niche), seed.niche,
      seed.followers, seed.engagementRate, seed.priceStory, seed.pricePost, seed.priceCollab, platformsJson, seed.image, 1, now, now
    );
  } else {
    q.updateInfluencer.run(
      "SEED_CREATOR", user.id, seed.email, seed.fullName, normalizeCategory(seed.niche), seed.niche,
      seed.followers, seed.engagementRate, seed.priceStory, seed.pricePost, seed.priceCollab, platformsJson, seed.image, now, influencer.id
    );
  }

  return {
    insertedUser,
    ref: {
      niche: seed.niche,
      email: seed.email,
      userId: user.id,
      influencerProfileId: profile.id,
      influencerIndexId: influencer.id,
      followers: seed.followers,
      engagementRate: seed.engagementRate,
      suspicious: seed.suspicious,
    },
  };
}

function ensureBrandAndManager(passwordHash) {
  const now = nowIso();

  function upsertUser(email, name, role) {
    let row = q.getBrandByEmail.get(email);
    if (!row) {
      row = { id: cuidLike("usr") };
      q.insertBrandUser.run(row.id, name, email, passwordHash, role, now, now);
    } else {
      q.updateBrandUser.run(name, passwordHash, role, now, row.id);
    }
    return row.id;
  }

  const brandUserId = upsertUser(BRAND_EMAIL, "Seed Test Brand", "BRAND");
  const managerUserId = upsertUser(MANAGER_EMAIL, "Seed Test Manager", "MANAGER");

  let brandProfile = q.getBrandProfileByUserId.get(brandUserId);
  if (!brandProfile) {
    brandProfile = { id: cuidLike("brd") };
    q.insertBrandProfile.run(
      brandProfile.id, brandUserId, "Seed Test Brand", "https://seed-test-brand.example", "Consumer",
      "Auto-generated brand for creator request flow testing.", "Mumbai", JSON.stringify(["UPI", "Bank Transfer"]), 2500000,
      1, CAMPAIGN_STRATEGIES[0], "2L - 10L", JSON.stringify(["Instagram", "YouTube"]), "Micro", "Visibility and conversions",
      MIN_FOLLOWERS, MAX_FOLLOWERS, 2500, 60000, "Per Post"
    );
  } else {
    q.updateBrandProfile.run(
      "Seed Test Brand", "https://seed-test-brand.example", "Consumer",
      "Auto-generated brand for creator request flow testing.", "Mumbai", JSON.stringify(["UPI", "Bank Transfer"]), 2500000,
      CAMPAIGN_STRATEGIES[0], "2L - 10L", JSON.stringify(["Instagram", "YouTube"]), "Micro", "Visibility and conversions",
      MIN_FOLLOWERS, MAX_FOLLOWERS, 2500, 60000, "Per Post", brandProfile.id
    );
  }

  let wallet = q.getWalletByBrandId.get(brandProfile.id);
  if (!wallet) q.insertWallet.run(cuidLike("wal"), brandProfile.id, 2500000, "INR", now);
  else q.updateWallet.run(2500000, now, wallet.id);

  return { brandProfileId: brandProfile.id, managerUserId };
}

function seedCampaignInvites(brandProfileId, managerUserId, creatorsByNiche, slugMap) {
  const now = new Date();
  const targetNiches = Array.from(creatorsByNiche.keys());
  let paymentFlowCampaigns = 0;
  let paidCampaigns = 0;
  let invites = 0;

  for (let nicheIndex = 0; nicheIndex < targetNiches.length; nicheIndex++) {
    const niche = targetNiches[nicheIndex];
    const strategy = CAMPAIGN_STRATEGIES[nicheIndex % CAMPAIGN_STRATEGIES.length];
    const slug = slugMap.get(niche) || slugify(niche);
    const creators = (creatorsByNiche.get(niche) || []).slice(0, 8);
    if (!creators.length) continue;

    const paymentFlowCampaignId = `seed-payment-flow-campaign-${slug}`;
    const paidCampaignId = `seed-paid-live-campaign-${slug}`;
    const budget = creators.reduce((sum, c) => sum + Math.max(c.followers, MIN_FOLLOWERS), 0);
    const startDate = new Date(now.getTime() - 2 * 86400000).toISOString();
    const endDate = new Date(now.getTime() + 25 * 86400000).toISOString();
    const nowS = now.toISOString();

    const paymentFlowCampaign = q.getCampaignById.get(paymentFlowCampaignId);
    if (!paymentFlowCampaign) {
      q.insertCampaign.run(
        paymentFlowCampaignId, brandProfileId, `Seed ${strategy} - ${niche}`, `Auto-seeded campaign for accept -> payment -> chat flow (${niche}).`,
        `Strategy: ${strategy}. Deliverables: 1 Reel/Video + 2 Stories`, budget, `RANGE_${MIN_FOLLOWERS}_${MAX_FOLLOWERS}`, "Instagram,YouTube", 5, 10,
        "PENDING", null, "DRAFT", startDate, endDate, nowS, nowS, "[]", MIN_FOLLOWERS, niche, "UPFRONT"
      );
    } else {
      q.updateCampaign.run(
        brandProfileId, `Seed ${strategy} - ${niche}`, `Auto-seeded campaign for accept -> payment -> chat flow (${niche}).`,
        `Strategy: ${strategy}. Deliverables: 1 Reel/Video + 2 Stories`, budget, `RANGE_${MIN_FOLLOWERS}_${MAX_FOLLOWERS}`, "Instagram,YouTube", 5, 10,
        "PENDING", null, "DRAFT", startDate, endDate, nowS, MIN_FOLLOWERS, niche, paymentFlowCampaignId
      );
    }

    const paidCampaign = q.getCampaignById.get(paidCampaignId);
    if (!paidCampaign) {
      q.insertCampaign.run(
        paidCampaignId, brandProfileId, `Seed ${strategy} Paid Live - ${niche}`, `Auto-seeded paid campaign for creator dashboard visibility (${niche}).`,
        `Strategy: ${strategy}. Deliverables: 1 Reel/Video + 2 Stories`, budget, `RANGE_${MIN_FOLLOWERS}_${MAX_FOLLOWERS}`, "Instagram,YouTube", 5, 10,
        "PAID", nowS, "ACTIVE", startDate, endDate, nowS, nowS, "[]", MIN_FOLLOWERS, niche, "UPFRONT"
      );
    } else {
      q.updateCampaign.run(
        brandProfileId, `Seed ${strategy} Paid Live - ${niche}`, `Auto-seeded paid campaign for creator dashboard visibility (${niche}).`,
        `Strategy: ${strategy}. Deliverables: 1 Reel/Video + 2 Stories`, budget, `RANGE_${MIN_FOLLOWERS}_${MAX_FOLLOWERS}`, "Instagram,YouTube", 5, 10,
        "PAID", nowS, "ACTIVE", startDate, endDate, nowS, MIN_FOLLOWERS, niche, paidCampaignId
      );
    }

    const paymentAssignment = q.getAssignmentByCampaign.get(paymentFlowCampaignId);
    if (!paymentAssignment) q.insertAssignment.run(cuidLike("asg"), paymentFlowCampaignId, managerUserId, nowS);
    else q.updateAssignment.run(managerUserId, nowS, paymentAssignment.id);

    const paidAssignment = q.getAssignmentByCampaign.get(paidCampaignId);
    if (!paidAssignment) q.insertAssignment.run(cuidLike("asg"), paidCampaignId, managerUserId, nowS);
    else q.updateAssignment.run(managerUserId, nowS, paidAssignment.id);

    for (const creator of creators) {
      const pendingCandidate = q.getCandidateByCampaignInfluencer.get(paymentFlowCampaignId, creator.influencerProfileId);
      if (!pendingCandidate) {
        q.insertCandidate.run(
          cuidLike("cand"), paymentFlowCampaignId, creator.influencerProfileId, "CONTACTED", "ACCEPTED", "PENDING", 0,
          creator.engagementRate, clamp(creator.engagementRate * 10, 0, 100), creator.suspicious ? 1 : 0,
          Math.max(creator.followers, MIN_FOLLOWERS), Number((Math.max(creator.followers, MIN_FOLLOWERS) * 0.1).toFixed(2)),
          "PENDING", "Seeded invitation for dashboard testing.", JSON.stringify({ source: "seed-test-creators-sqlite" }), nowS, nowS
        );
      } else {
        q.updateCandidate.run(
          creator.engagementRate, clamp(creator.engagementRate * 10, 0, 100), creator.suspicious ? 1 : 0,
          Math.max(creator.followers, MIN_FOLLOWERS), Number((Math.max(creator.followers, MIN_FOLLOWERS) * 0.1).toFixed(2)),
          "Seeded invitation for dashboard testing.", nowS, pendingCandidate.id
        );
      }

      const paidCandidate = q.getCandidateByCampaignInfluencer.get(paidCampaignId, creator.influencerProfileId);
      if (!paidCandidate) {
        q.insertCandidate.run(
          cuidLike("cand"), paidCampaignId, creator.influencerProfileId, "CONTACTED", "ACCEPTED", "PENDING", 0,
          creator.engagementRate, clamp(creator.engagementRate * 10, 0, 100), creator.suspicious ? 1 : 0,
          Math.max(creator.followers, MIN_FOLLOWERS), Number((Math.max(creator.followers, MIN_FOLLOWERS) * 0.1).toFixed(2)),
          "PENDING", "Seeded PAID invitation for creator dashboard testing.", JSON.stringify({ source: "seed-test-creators-sqlite" }), nowS, nowS
        );
      } else {
        q.updateCandidate.run(
          creator.engagementRate, clamp(creator.engagementRate * 10, 0, 100), creator.suspicious ? 1 : 0,
          Math.max(creator.followers, MIN_FOLLOWERS), Number((Math.max(creator.followers, MIN_FOLLOWERS) * 0.1).toFixed(2)),
          "Seeded PAID invitation for creator dashboard testing.", nowS, paidCandidate.id
        );
      }
      invites += 2;
    }

    paymentFlowCampaigns += 1;
    paidCampaigns += 1;
  }

  return { paymentFlowCampaigns, paidCampaigns, invites };
}

function seedBrandCampaignRequests(brandProfileId, creatorsByNiche, slugMap) {
  const now = new Date();
  const targetNiches = Array.from(creatorsByNiche.keys());
  let campaigns = 0;
  let requests = 0;

  for (let nicheIndex = 0; nicheIndex < targetNiches.length; nicheIndex++) {
    const niche = targetNiches[nicheIndex];
    const strategy = CAMPAIGN_STRATEGIES[nicheIndex % CAMPAIGN_STRATEGIES.length];
    const slug = slugMap.get(niche) || slugify(niche);
    const creators = (creatorsByNiche.get(niche) || []).slice(0, 12);
    if (!creators.length) continue;

    const campaignId = `seed-brand-campaign-${slug}`;
    const nowS = now.toISOString();
    const exists = q.getBrandCampaignById.get(campaignId);
    if (!exists) {
      q.insertBrandCampaign.run(
        campaignId, brandProfileId, `Seed ${strategy} Matching - ${niche}`, `Auto-generated ${strategy} campaign for request flow testing.`,
        750000, normalizeCategory(niche), niche, MIN_FOLLOWERS, MAX_FOLLOWERS, "active", 20, 20, nowS, nowS, nowS
      );
    } else {
      q.updateBrandCampaign.run(
        brandProfileId, `Seed ${strategy} Matching - ${niche}`, `Auto-generated ${strategy} campaign for request flow testing.`,
        750000, normalizeCategory(niche), niche, MIN_FOLLOWERS, MAX_FOLLOWERS, nowS, nowS, exists.id
      );
    }

    for (let i = 0; i < creators.length; i++) {
      const creator = creators[i];
      const status = i % 8 === 0 ? "accepted" : i % 11 === 0 ? "rejected" : "pending";
      const sentAt = new Date(now.getTime() - i * 3600000).toISOString();
      const expiresAt = new Date(now.getTime() + 5 * 86400000 + i * 60000).toISOString();
      const respondedAt = status === "pending" ? null : new Date(now.getTime() - i * 1200000).toISOString();
      const acceptedAt = status === "accepted" ? respondedAt : null;
      const rejectionReason = status === "rejected" ? "seeded_test_rejection" : null;

      const req = q.getCollabReqByCampaignInfluencer.get(campaignId, creator.influencerIndexId);
      if (!req) {
        q.insertCollabReq.run(
          cuidLike("req"), campaignId, creator.influencerIndexId, status, sentAt, expiresAt, respondedAt, acceptedAt,
          rejectionReason, sentAt, nowIso()
        );
      } else {
        q.updateCollabReq.run(status, sentAt, expiresAt, respondedAt, acceptedAt, rejectionReason, nowIso(), req.id);
      }
      requests += 1;
    }

    campaigns += 1;
  }

  return { campaigns, requests };
}

function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This seed script is blocked in production.");
  }

  const passwordHash = bcrypt.hashSync(TEST_PASSWORD, 10);
  const niches = loadNiches();
  const slugMap = buildSlugMap(niches);
  const creatorsByNiche = new Map();

  let inserted = 0;
  let updated = 0;

  db.exec("BEGIN");
  try {
    console.log(`[seed:sqlite] Niches found: ${niches.length}`);
    console.log(`[seed:sqlite] Niches: ${niches.join(", ")}`);
    for (const niche of niches) {
      const slug = slugMap.get(niche) || slugify(niche);
      const refs = [];
      for (let i = 1; i <= CREATORS_PER_NICHE; i++) {
        const seed = buildSeed(niche, slug, i);
        const result = upsertCreator(seed, passwordHash);
        refs.push(result.ref);
        if (result.insertedUser) inserted += 1;
        else updated += 1;
      }
      creatorsByNiche.set(niche, refs);
    }

    const { brandProfileId, managerUserId } = ensureBrandAndManager(passwordHash);
    const inviteResult = seedCampaignInvites(brandProfileId, managerUserId, creatorsByNiche, slugMap);
    const requestResult = seedBrandCampaignRequests(brandProfileId, creatorsByNiche, slugMap);

    db.exec("COMMIT");

    console.log("========== SEED SUMMARY ==========");
    console.log(`Niches found: ${niches.length}`);
    console.log(`Creators planned: ${niches.length * CREATORS_PER_NICHE}`);
    console.log(`Creators inserted (new User): ${inserted}`);
    console.log(`Creators updated (existing User): ${updated}`);
    console.log(`Payment-flow campaigns seeded (PENDING): ${inviteResult.paymentFlowCampaigns}`);
    console.log(`Paid live campaigns seeded (creator dashboard): ${inviteResult.paidCampaigns}`);
    console.log(`Campaign candidate invites seeded: ${inviteResult.invites}`);
    console.log(`Brand campaigns seeded: ${requestResult.campaigns}`);
    console.log(`Collaboration requests seeded: ${requestResult.requests}`);
    console.log(`Creator email format: <niche-slug>.01-20@${CREATOR_DOMAIN}`);
    console.log(`Password (creator/brand/manager): ${TEST_PASSWORD}`);
    console.log(`Brand login: ${BRAND_EMAIL}`);
    console.log(`Manager login: ${MANAGER_EMAIL}`);
    console.log("==================================");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

try {
  main();
} catch (error) {
  console.error("[seed:sqlite] FAILED:", error);
  process.exitCode = 1;
}
