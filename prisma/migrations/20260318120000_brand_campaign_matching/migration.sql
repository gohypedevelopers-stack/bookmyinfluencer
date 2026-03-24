-- CreateTable
CREATE TABLE "BrandCampaign" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "totalBudget" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "categoryLabel" TEXT,
    "minFollowers" INTEGER NOT NULL,
    "maxFollowers" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "targetAcceptedCount" INTEGER NOT NULL DEFAULT 20,
    "activeRequestLimit" INTEGER NOT NULL DEFAULT 20,
    "matchingTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Influencer" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceUserId" TEXT,
    "email" TEXT,
    "displayName" TEXT NOT NULL,
    "category" TEXT,
    "rawCategory" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceStory" INTEGER,
    "pricePost" INTEGER,
    "priceCollab" INTEGER,
    "platforms" TEXT,
    "profileImageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationRequest" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandCampaign_brandId_status_idx" ON "BrandCampaign"("brandId", "status");

-- CreateIndex
CREATE INDEX "BrandCampaign_category_minFollowers_maxFollowers_idx" ON "BrandCampaign"("category", "minFollowers", "maxFollowers");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_sourceKey_key" ON "Influencer"("sourceKey");

-- CreateIndex
CREATE INDEX "Influencer_category_followersCount_idx" ON "Influencer"("category", "followersCount");

-- CreateIndex
CREATE INDEX "Influencer_active_engagementRate_followersCount_idx" ON "Influencer"("active", "engagementRate", "followersCount");

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationRequest_campaignId_influencerId_key" ON "CollaborationRequest"("campaignId", "influencerId");

-- CreateIndex
CREATE INDEX "CollaborationRequest_status_expiresAt_idx" ON "CollaborationRequest"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "CollaborationRequest_campaignId_status_idx" ON "CollaborationRequest"("campaignId", "status");

-- AddForeignKey
ALTER TABLE "BrandCampaign" ADD CONSTRAINT "BrandCampaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationRequest" ADD CONSTRAINT "CollaborationRequest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BrandCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationRequest" ADD CONSTRAINT "CollaborationRequest_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
