-- Campaign flow alignment for micro-influencer managed execution
ALTER TABLE "Campaign"
ADD COLUMN IF NOT EXISTS "influencerType" TEXT DEFAULT 'MICRO',
ADD COLUMN IF NOT EXISTS "platform" TEXT,
ADD COLUMN IF NOT EXISTS "engagementMin" DOUBLE PRECISION DEFAULT 5,
ADD COLUMN IF NOT EXISTS "engagementMax" DOUBLE PRECISION DEFAULT 10,
ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Campaign_brandId_paymentStatus_status_idx"
ON "Campaign"("brandId", "paymentStatus", "status");

ALTER TABLE "CampaignCandidate"
ADD COLUMN IF NOT EXISTS "brandDecision" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "creatorDecision" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "shuffleCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "fakeEngagementFlag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "estimatedBrandCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "estimatedCreatorPayout" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "managerReviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "managerReviewNotes" TEXT,
ADD COLUMN IF NOT EXISTS "contentSubmissionUrl" TEXT,
ADD COLUMN IF NOT EXISTS "contentSubmittedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "managerReviewedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "readyForBrandReviewAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "CampaignCandidate_campaignId_brandDecision_idx"
ON "CampaignCandidate"("campaignId", "brandDecision");

CREATE INDEX IF NOT EXISTS "CampaignCandidate_campaignId_managerReviewStatus_idx"
ON "CampaignCandidate"("campaignId", "managerReviewStatus");

CREATE INDEX IF NOT EXISTS "CampaignCandidate_influencerId_creatorDecision_idx"
ON "CampaignCandidate"("influencerId", "creatorDecision");

