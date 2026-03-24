import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CREATOR_PASSWORD = "Creator@2026";
const BRAND_PASSWORD = "Brand@2026";

type CreatorSeed = {
  name: string;
  email: string;
  phone: string;
  niche: string;
  location: string;
  followers: number;
  engagementRate: number;
  priceStory: number;
  pricePost: number;
  priceCollab: number;
  instagramHandle: string;
  youtubeHandle: string;
  tiktokHandle: string;
  image: string;
};

type BrandSeed = {
  companyName: string;
  email: string;
  website: string;
  industry: string;
  location: string;
  description: string;
  campaignType: string;
  campaignBudget: string;
  minFollowers: number;
  maxFollowers: number;
  minPrice: number;
  maxPrice: number;
  walletBalance: number;
};

const creatorSeeds: CreatorSeed[] = [
  {
    name: "Aarav Mehta",
    email: "creator01.demo@bookmyinfluencer.com",
    phone: "9876500001",
    niche: "Technology",
    location: "Bangalore",
    followers: 185000,
    engagementRate: 6.3,
    priceStory: 6000,
    pricePost: 18000,
    priceCollab: 52000,
    instagramHandle: "@aaravtech",
    youtubeHandle: "@AaravBuilds",
    tiktokHandle: "@aaravshorts",
    image: "/images/marco.png",
  },
  {
    name: "Ishita Kapoor",
    email: "creator02.demo@bookmyinfluencer.com",
    phone: "9876500002",
    niche: "Fashion & Beauty",
    location: "Mumbai",
    followers: 320000,
    engagementRate: 5.9,
    priceStory: 8500,
    pricePost: 24000,
    priceCollab: 76000,
    instagramHandle: "@ishitastyle",
    youtubeHandle: "@IshitaLooks",
    tiktokHandle: "@ishitaglam",
    image: "/images/sarah.png",
  },
  {
    name: "Rohan Verma",
    email: "creator03.demo@bookmyinfluencer.com",
    phone: "9876500003",
    niche: "Gaming",
    location: "Delhi",
    followers: 540000,
    engagementRate: 7.1,
    priceStory: 10000,
    pricePost: 32000,
    priceCollab: 98000,
    instagramHandle: "@rohangames",
    youtubeHandle: "@RohanLive",
    tiktokHandle: "@rohangaming",
    image: "/images/julian.png",
  },
  {
    name: "Neha Bansal",
    email: "creator04.demo@bookmyinfluencer.com",
    phone: "9876500004",
    niche: "Food",
    location: "Pune",
    followers: 120000,
    engagementRate: 8.4,
    priceStory: 4500,
    pricePost: 14000,
    priceCollab: 42000,
    instagramHandle: "@nehacooks",
    youtubeHandle: "@NehaKitchen",
    tiktokHandle: "@nehatastes",
    image: "/images/elena.png",
  },
  {
    name: "Kabir Arora",
    email: "creator05.demo@bookmyinfluencer.com",
    phone: "9876500005",
    niche: "Fitness",
    location: "Chandigarh",
    followers: 410000,
    engagementRate: 5.4,
    priceStory: 9000,
    pricePost: 28000,
    priceCollab: 86000,
    instagramHandle: "@kabirfit",
    youtubeHandle: "@KabirStrength",
    tiktokHandle: "@kabirmoves",
    image: "/images/marco.png",
  },
  {
    name: "Sana Khan",
    email: "creator06.demo@bookmyinfluencer.com",
    phone: "9876500006",
    niche: "Travel",
    location: "Goa",
    followers: 250000,
    engagementRate: 6.7,
    priceStory: 7000,
    pricePost: 22000,
    priceCollab: 68000,
    instagramHandle: "@sanalens",
    youtubeHandle: "@SanaTravels",
    tiktokHandle: "@sanawanders",
    image: "/images/sarah.png",
  },
  {
    name: "Yash Sethi",
    email: "creator07.demo@bookmyinfluencer.com",
    phone: "9876500007",
    niche: "Finance",
    location: "Hyderabad",
    followers: 95000,
    engagementRate: 7.8,
    priceStory: 3500,
    pricePost: 11000,
    priceCollab: 36000,
    instagramHandle: "@yashmoney",
    youtubeHandle: "@YashExplains",
    tiktokHandle: "@yashfinance",
    image: "/images/julian.png",
  },
  {
    name: "Priya Nair",
    email: "creator08.demo@bookmyinfluencer.com",
    phone: "9876500008",
    niche: "Parenting",
    location: "Kochi",
    followers: 165000,
    engagementRate: 6.2,
    priceStory: 5200,
    pricePost: 16500,
    priceCollab: 50000,
    instagramHandle: "@priyaparent",
    youtubeHandle: "@PriyaFamily",
    tiktokHandle: "@priyamom",
    image: "/images/elena.png",
  },
  {
    name: "Dev Malhotra",
    email: "creator09.demo@bookmyinfluencer.com",
    phone: "9876500009",
    niche: "Automobile",
    location: "Jaipur",
    followers: 620000,
    engagementRate: 4.9,
    priceStory: 12000,
    pricePost: 36000,
    priceCollab: 110000,
    instagramHandle: "@devdrives",
    youtubeHandle: "@DevMotor",
    tiktokHandle: "@devcars",
    image: "/images/marco.png",
  },
  {
    name: "Ananya Iyer",
    email: "creator10.demo@bookmyinfluencer.com",
    phone: "9876500010",
    niche: "Education",
    location: "Chennai",
    followers: 275000,
    engagementRate: 7.3,
    priceStory: 6800,
    pricePost: 21000,
    priceCollab: 64000,
    instagramHandle: "@ananyalearns",
    youtubeHandle: "@AnanyaAcademy",
    tiktokHandle: "@ananyastudy",
    image: "/images/sarah.png",
  },
];

const brandSeeds: BrandSeed[] = [
  {
    companyName: "Nova Gadgets",
    email: "brand01.demo@bookmyinfluencer.com",
    website: "https://novagadgets.example",
    industry: "Technology",
    location: "Bangalore",
    description: "Smart consumer electronics brand focused on mobile accessories.",
    campaignType: "Product Launch",
    campaignBudget: "₹5,00,000 – ₹10,00,000",
    minFollowers: 10000,
    maxFollowers: 500000,
    minPrice: 15000,
    maxPrice: 150000,
    walletBalance: 300000,
  },
  {
    companyName: "Velvet Vogue",
    email: "brand02.demo@bookmyinfluencer.com",
    website: "https://velvetvogue.example",
    industry: "Fashion",
    location: "Mumbai",
    description: "D2C fashion label for urban premium wear.",
    campaignType: "Seasonal Collection",
    campaignBudget: "₹2,00,000 – ₹5,00,000",
    minFollowers: 50000,
    maxFollowers: 1000000,
    minPrice: 20000,
    maxPrice: 250000,
    walletBalance: 220000,
  },
  {
    companyName: "FitFuel Nutrition",
    email: "brand03.demo@bookmyinfluencer.com",
    website: "https://fitfuel.example",
    industry: "Health & Fitness",
    location: "Delhi",
    description: "Performance nutrition and wellness supplements.",
    campaignType: "Performance Campaign",
    campaignBudget: "₹1,00,000 – ₹2,00,000",
    minFollowers: 10000,
    maxFollowers: 300000,
    minPrice: 10000,
    maxPrice: 90000,
    walletBalance: 150000,
  },
  {
    companyName: "WanderNest Holidays",
    email: "brand04.demo@bookmyinfluencer.com",
    website: "https://wandernest.example",
    industry: "Travel",
    location: "Goa",
    description: "Curated travel experiences and destination packages.",
    campaignType: "Destination Promotion",
    campaignBudget: "₹3,00,000 – ₹6,00,000",
    minFollowers: 50000,
    maxFollowers: 2000000,
    minPrice: 25000,
    maxPrice: 300000,
    walletBalance: 280000,
  },
  {
    companyName: "EduSpark",
    email: "brand05.demo@bookmyinfluencer.com",
    website: "https://eduspark.example",
    industry: "Education",
    location: "Hyderabad",
    description: "Online learning platform for upskilling and certifications.",
    campaignType: "Awareness Drive",
    campaignBudget: "₹1,50,000 – ₹3,00,000",
    minFollowers: 10000,
    maxFollowers: 500000,
    minPrice: 12000,
    maxPrice: 120000,
    walletBalance: 180000,
  },
  {
    companyName: "PureHarvest Organics",
    email: "brand06.demo@bookmyinfluencer.com",
    website: "https://pureharvest.example",
    industry: "Food",
    location: "Pune",
    description: "Organic packaged foods and healthy snacks.",
    campaignType: "Trial Generation",
    campaignBudget: "₹1,00,000 – ₹2,50,000",
    minFollowers: 10000,
    maxFollowers: 250000,
    minPrice: 8000,
    maxPrice: 80000,
    walletBalance: 135000,
  },
  {
    companyName: "AutoPulse",
    email: "brand07.demo@bookmyinfluencer.com",
    website: "https://autopulse.example",
    industry: "Automobile",
    location: "Chennai",
    description: "Connected automotive accessories and smart telemetry.",
    campaignType: "Feature Campaign",
    campaignBudget: "₹4,00,000 – ₹8,00,000",
    minFollowers: 50000,
    maxFollowers: 1500000,
    minPrice: 30000,
    maxPrice: 220000,
    walletBalance: 360000,
  },
  {
    companyName: "HomeEase Decor",
    email: "brand08.demo@bookmyinfluencer.com",
    website: "https://homeease.example",
    industry: "Lifestyle",
    location: "Ahmedabad",
    description: "Modern home decor and utility products.",
    campaignType: "UGC Program",
    campaignBudget: "₹80,000 – ₹1,50,000",
    minFollowers: 10000,
    maxFollowers: 200000,
    minPrice: 6000,
    maxPrice: 60000,
    walletBalance: 90000,
  },
  {
    companyName: "FinEdge",
    email: "brand09.demo@bookmyinfluencer.com",
    website: "https://finedge.example",
    industry: "Finance",
    location: "Gurugram",
    description: "Digital finance and wealth management platform.",
    campaignType: "Trust Campaign",
    campaignBudget: "₹2,50,000 – ₹4,00,000",
    minFollowers: 25000,
    maxFollowers: 750000,
    minPrice: 18000,
    maxPrice: 180000,
    walletBalance: 240000,
  },
  {
    companyName: "PlayForge Studios",
    email: "brand10.demo@bookmyinfluencer.com",
    website: "https://playforge.example",
    industry: "Gaming",
    location: "Noida",
    description: "Mobile gaming publisher focused on competitive titles.",
    campaignType: "Game Launch",
    campaignBudget: "₹6,00,000 – ₹12,00,000",
    minFollowers: 50000,
    maxFollowers: 3000000,
    minPrice: 35000,
    maxPrice: 350000,
    walletBalance: 420000,
  },
];

async function upsertCreator(seed: CreatorSeed, creatorPasswordHash: string) {
  const email = seed.email.trim().toLowerCase();
  const now = new Date();
  const instagramUsername = seed.instagramHandle.replace("@", "").toLowerCase();
  const youtubeUsername = seed.youtubeHandle.replace("@", "").toLowerCase();

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: seed.name,
      passwordHash: creatorPasswordHash,
      role: "INFLUENCER",
      image: seed.image,
    },
    create: {
      name: seed.name,
      email,
      passwordHash: creatorPasswordHash,
      role: "INFLUENCER",
      image: seed.image,
    },
  });

  const influencerProfile = await prisma.influencerProfile.upsert({
    where: { userId: user.id },
    update: {
      niche: seed.niche,
      location: seed.location,
      bio: `${seed.name} creates high-performing ${seed.niche.toLowerCase()} content for modern brands.`,
      instagramHandle: seed.instagramHandle,
      youtubeHandle: seed.youtubeHandle,
      tiktokHandle: seed.tiktokHandle,
      followers: seed.followers,
      engagementRate: seed.engagementRate,
      socialData: JSON.stringify({
        instagram: seed.instagramHandle,
        youtube: seed.youtubeHandle,
        tiktok: seed.tiktokHandle,
      }),
      pricing: JSON.stringify({
        story: seed.priceStory,
        post: seed.pricePost,
        collab: seed.priceCollab,
      }),
      priceStory: seed.priceStory,
      pricePost: seed.pricePost,
      priceCollab: seed.priceCollab,
      priceType: "Per Collab",
      onboardingCompleted: true,
      platforms: JSON.stringify(["Instagram", "YouTube", "TikTok"]),
    },
    create: {
      userId: user.id,
      niche: seed.niche,
      location: seed.location,
      bio: `${seed.name} creates high-performing ${seed.niche.toLowerCase()} content for modern brands.`,
      instagramHandle: seed.instagramHandle,
      youtubeHandle: seed.youtubeHandle,
      tiktokHandle: seed.tiktokHandle,
      followers: seed.followers,
      engagementRate: seed.engagementRate,
      socialData: JSON.stringify({
        instagram: seed.instagramHandle,
        youtube: seed.youtubeHandle,
        tiktok: seed.tiktokHandle,
      }),
      pricing: JSON.stringify({
        story: seed.priceStory,
        post: seed.pricePost,
        collab: seed.priceCollab,
      }),
      priceStory: seed.priceStory,
      pricePost: seed.pricePost,
      priceCollab: seed.priceCollab,
      priceType: "Per Collab",
      onboardingCompleted: true,
      platforms: JSON.stringify(["Instagram", "YouTube", "TikTok"]),
    },
  });

  await prisma.kYCSubmission.upsert({
    where: { profileId: influencerProfile.id },
    update: {
      status: "APPROVED",
      submittedAt: now,
      reviewedAt: now,
      adminNotes: "Demo profile auto-approved.",
    },
    create: {
      profileId: influencerProfile.id,
      status: "APPROVED",
      submittedAt: now,
      reviewedAt: now,
      adminNotes: "Demo profile auto-approved.",
    },
  });

  await prisma.influencer.upsert({
    where: { sourceKey: `user:${user.id}` },
    update: {
      sourceType: "INFLUENCER_PROFILE",
      sourceUserId: user.id,
      email,
      displayName: seed.name,
      category: seed.niche,
      rawCategory: seed.niche,
      followersCount: seed.followers,
      engagementRate: seed.engagementRate,
      priceStory: seed.priceStory,
      pricePost: seed.pricePost,
      priceCollab: seed.priceCollab,
      platforms: JSON.stringify(["Instagram", "YouTube", "TikTok"]),
      profileImageUrl: seed.image,
      active: true,
    },
    create: {
      sourceKey: `user:${user.id}`,
      sourceType: "INFLUENCER_PROFILE",
      sourceUserId: user.id,
      email,
      displayName: seed.name,
      category: seed.niche,
      rawCategory: seed.niche,
      followersCount: seed.followers,
      engagementRate: seed.engagementRate,
      priceStory: seed.priceStory,
      pricePost: seed.pricePost,
      priceCollab: seed.priceCollab,
      platforms: JSON.stringify(["Instagram", "YouTube", "TikTok"]),
      profileImageUrl: seed.image,
      active: true,
    },
  });

  const otpUser = await prisma.otpUser.upsert({
    where: { email },
    update: { verifiedAt: now },
    create: { email, verifiedAt: now },
  });

  const creator = await prisma.creator.upsert({
    where: { userId: otpUser.id },
    update: {
      email,
      fullName: seed.name,
      phone: seed.phone,
      niche: seed.niche,
      instagramUrl: `https://instagram.com/${instagramUsername}`,
      youtubeUrl: `https://youtube.com/${youtubeUsername}`,
      tiktokUrl: `https://tiktok.com/@${seed.tiktokHandle.replace("@", "").toLowerCase()}`,
      profileImageUrl: seed.image,
      displayName: seed.name,
      bio: `${seed.name} creates high-performing ${seed.niche.toLowerCase()} content for modern brands.`,
      pricing: JSON.stringify({
        story: seed.priceStory,
        post: seed.pricePost,
        collab: seed.priceCollab,
      }),
      priceStory: seed.priceStory,
      pricePost: seed.pricePost,
      priceCollab: seed.priceCollab,
      priceType: "Per Collab",
      onboardingCompleted: true,
      platforms: JSON.stringify(["Instagram", "YouTube", "TikTok"]),
      verificationStatus: "APPROVED",
      verifiedAt: now,
      mediaKit: JSON.stringify({
        intro: `${seed.name} media kit`,
        audience: "India, 18-34",
      }),
      payoutMethods: JSON.stringify(["UPI", "Bank Transfer"]),
    },
    create: {
      userId: otpUser.id,
      email,
      fullName: seed.name,
      phone: seed.phone,
      niche: seed.niche,
      instagramUrl: `https://instagram.com/${instagramUsername}`,
      youtubeUrl: `https://youtube.com/${youtubeUsername}`,
      tiktokUrl: `https://tiktok.com/@${seed.tiktokHandle.replace("@", "").toLowerCase()}`,
      profileImageUrl: seed.image,
      displayName: seed.name,
      bio: `${seed.name} creates high-performing ${seed.niche.toLowerCase()} content for modern brands.`,
      pricing: JSON.stringify({
        story: seed.priceStory,
        post: seed.pricePost,
        collab: seed.priceCollab,
      }),
      priceStory: seed.priceStory,
      pricePost: seed.pricePost,
      priceCollab: seed.priceCollab,
      priceType: "Per Collab",
      onboardingCompleted: true,
      platforms: JSON.stringify(["Instagram", "YouTube", "TikTok"]),
      verificationStatus: "APPROVED",
      verifiedAt: now,
      mediaKit: JSON.stringify({
        intro: `${seed.name} media kit`,
        audience: "India, 18-34",
      }),
      payoutMethods: JSON.stringify(["UPI", "Bank Transfer"]),
    },
  });

  await prisma.creatorKYCSubmission.upsert({
    where: { creatorId: creator.id },
    update: {
      status: "APPROVED",
      instagramFollowers: seed.followers,
      youtubeSubscribers: Math.round(seed.followers * 0.45),
      totalPosts: 240,
      engagementRate: seed.engagementRate,
      reviewedAt: now,
      reviewedBy: "system-seed",
      adminNotes: "Demo creator seeded as approved.",
    },
    create: {
      creatorId: creator.id,
      status: "APPROVED",
      instagramFollowers: seed.followers,
      youtubeSubscribers: Math.round(seed.followers * 0.45),
      totalPosts: 240,
      engagementRate: seed.engagementRate,
      reviewedAt: now,
      reviewedBy: "system-seed",
      adminNotes: "Demo creator seeded as approved.",
    },
  });

  await prisma.creatorSelfReportedMetric.upsert({
    where: {
      creatorId_provider: { creatorId: creator.id, provider: "instagram" },
    },
    update: { followersCount: seed.followers },
    create: {
      creatorId: creator.id,
      provider: "instagram",
      followersCount: seed.followers,
    },
  });

  await prisma.creatorSelfReportedMetric.upsert({
    where: {
      creatorId_provider: { creatorId: creator.id, provider: "youtube" },
    },
    update: { followersCount: Math.round(seed.followers * 0.45) },
    create: {
      creatorId: creator.id,
      provider: "youtube",
      followersCount: Math.round(seed.followers * 0.45),
    },
  });

  const existingInstagramMetric = await prisma.creatorMetric.findFirst({
    where: { creatorId: creator.id, provider: "instagram" },
    orderBy: { date: "desc" },
  });

  if (existingInstagramMetric) {
    await prisma.creatorMetric.update({
      where: { id: existingInstagramMetric.id },
      data: {
        followersCount: seed.followers,
        engagementRate: seed.engagementRate,
        avgLikes: Math.round(seed.followers * 0.04),
        avgComments: Math.round(seed.followers * 0.003),
        mediaCount: 320,
      },
    });
  } else {
    await prisma.creatorMetric.create({
      data: {
        creatorId: creator.id,
        provider: "instagram",
        followersCount: seed.followers,
        engagementRate: seed.engagementRate,
        avgLikes: Math.round(seed.followers * 0.04),
        avgComments: Math.round(seed.followers * 0.003),
        mediaCount: 320,
      },
    });
  }

  const existingYoutubeMetric = await prisma.creatorMetric.findFirst({
    where: { creatorId: creator.id, provider: "youtube" },
    orderBy: { date: "desc" },
  });

  if (existingYoutubeMetric) {
    await prisma.creatorMetric.update({
      where: { id: existingYoutubeMetric.id },
      data: {
        followersCount: Math.round(seed.followers * 0.45),
        engagementRate: Math.max(seed.engagementRate - 1.2, 2.2),
        avgLikes: Math.round(seed.followers * 0.02),
        avgComments: Math.round(seed.followers * 0.0012),
        mediaCount: 180,
      },
    });
  } else {
    await prisma.creatorMetric.create({
      data: {
        creatorId: creator.id,
        provider: "youtube",
        followersCount: Math.round(seed.followers * 0.45),
        engagementRate: Math.max(seed.engagementRate - 1.2, 2.2),
        avgLikes: Math.round(seed.followers * 0.02),
        avgComments: Math.round(seed.followers * 0.0012),
        mediaCount: 180,
      },
    });
  }

  await prisma.creatorSocialAccount.upsert({
    where: {
      creatorId_provider: { creatorId: creator.id, provider: "instagram" },
    },
    update: {
      providerId: `manual:${instagramUsername}`,
      username: instagramUsername,
      type: "MANUAL",
    },
    create: {
      creatorId: creator.id,
      provider: "instagram",
      providerId: `manual:${instagramUsername}`,
      username: instagramUsername,
      type: "MANUAL",
    },
  });

  await prisma.creatorSocialAccount.upsert({
    where: {
      creatorId_provider: { creatorId: creator.id, provider: "youtube" },
    },
    update: {
      providerId: `manual:${youtubeUsername}`,
      username: youtubeUsername,
      type: "MANUAL",
    },
    create: {
      creatorId: creator.id,
      provider: "youtube",
      providerId: `manual:${youtubeUsername}`,
      username: youtubeUsername,
      type: "MANUAL",
    },
  });
}

async function upsertBrand(seed: BrandSeed, brandPasswordHash: string) {
  const email = seed.email.trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: seed.companyName,
      passwordHash: brandPasswordHash,
      role: "BRAND",
    },
    create: {
      name: seed.companyName,
      email,
      passwordHash: brandPasswordHash,
      role: "BRAND",
    },
  });

  const brandProfile = await prisma.brandProfile.upsert({
    where: { userId: user.id },
    update: {
      companyName: seed.companyName,
      website: seed.website,
      industry: seed.industry,
      description: seed.description,
      location: seed.location,
      paymentMethods: JSON.stringify(["UPI", "NetBanking", "Card"]),
      walletBalance: seed.walletBalance,
      onboardingCompleted: true,
      campaignType: seed.campaignType,
      campaignBudget: seed.campaignBudget,
      targetPlatforms: JSON.stringify(["Instagram", "YouTube"]),
      preferredCreatorType: "Micro + Macro",
      campaignGoals: "Awareness, conversions, and creator-led UGC.",
      minFollowers: seed.minFollowers,
      maxFollowers: seed.maxFollowers,
      minPricePerPost: seed.minPrice,
      maxPricePerPost: seed.maxPrice,
      priceType: "Per Collab",
    },
    create: {
      userId: user.id,
      companyName: seed.companyName,
      website: seed.website,
      industry: seed.industry,
      description: seed.description,
      location: seed.location,
      paymentMethods: JSON.stringify(["UPI", "NetBanking", "Card"]),
      walletBalance: seed.walletBalance,
      onboardingCompleted: true,
      campaignType: seed.campaignType,
      campaignBudget: seed.campaignBudget,
      targetPlatforms: JSON.stringify(["Instagram", "YouTube"]),
      preferredCreatorType: "Micro + Macro",
      campaignGoals: "Awareness, conversions, and creator-led UGC.",
      minFollowers: seed.minFollowers,
      maxFollowers: seed.maxFollowers,
      minPricePerPost: seed.minPrice,
      maxPricePerPost: seed.maxPrice,
      priceType: "Per Collab",
    },
  });

  await prisma.brandWallet.upsert({
    where: { brandId: brandProfile.id },
    update: {
      balance: seed.walletBalance,
      currency: "INR",
    },
    create: {
      brandId: brandProfile.id,
      balance: seed.walletBalance,
      currency: "INR",
    },
  });
}

async function main() {
  console.log("Seeding 10 creators + 10 brands (upsert, non-destructive)...");

  const creatorPasswordHash = await bcrypt.hash(CREATOR_PASSWORD, 10);
  const brandPasswordHash = await bcrypt.hash(BRAND_PASSWORD, 10);

  for (const creatorSeed of creatorSeeds) {
    await upsertCreator(creatorSeed, creatorPasswordHash);
  }

  for (const brandSeed of brandSeeds) {
    await upsertBrand(brandSeed, brandPasswordHash);
  }

  console.log("Done.");
  console.log("");
  console.log(`Creators seeded: ${creatorSeeds.length}`);
  console.log(`Brands seeded: ${brandSeeds.length}`);
  console.log("");
  console.log(`Creator default password: ${CREATOR_PASSWORD}`);
  console.log(`Brand default password: ${BRAND_PASSWORD}`);
  console.log("");
  console.log("Creator emails:");
  creatorSeeds.forEach((seed) => console.log(` - ${seed.email}`));
  console.log("");
  console.log("Brand emails:");
  brandSeeds.forEach((seed) => console.log(` - ${seed.email}`));
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
