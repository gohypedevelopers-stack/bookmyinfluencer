-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'INFLUENCER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastSeenAt" DATETIME
);

-- CreateTable
CREATE TABLE "BrandProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "location" TEXT,
    "paymentMethods" TEXT DEFAULT '[]',
    "walletBalance" REAL NOT NULL DEFAULT 0,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "campaignType" TEXT,
    "campaignBudget" TEXT,
    "targetPlatforms" TEXT,
    "preferredCreatorType" TEXT,
    "campaignGoals" TEXT,
    "minFollowers" INTEGER,
    "maxFollowers" INTEGER,
    "minPricePerPost" REAL,
    "maxPricePerPost" REAL,
    "priceType" TEXT DEFAULT 'Per Post',
    CONSTRAINT "BrandProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedInfluencer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedInfluencer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedInfluencer_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InfluencerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "location" TEXT,
    "bio" TEXT,
    "instagramHandle" TEXT,
    "youtubeHandle" TEXT,
    "tiktokHandle" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" REAL NOT NULL DEFAULT 0,
    "socialData" TEXT,
    "pricing" TEXT,
    "price" INTEGER,
    "priceStory" INTEGER,
    "pricePost" INTEGER,
    "priceCollab" INTEGER,
    "priceType" TEXT DEFAULT 'Per Post',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "platforms" TEXT,
    CONSTRAINT "InfluencerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KYCSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
    "documentType" TEXT,
    "documentUrl" TEXT,
    "documentBackUrl" TEXT,
    "panCard" TEXT,
    "bankDetails" TEXT,
    "submittedAt" DATETIME,
    "reviewedAt" DATETIME,
    "adminNotes" TEXT,
    "livenessPrompt" TEXT,
    "livenessResult" TEXT,
    "selfieCapturedAt" DATETIME,
    "selfieImageKey" TEXT,
    "verifiedByAdminAt" DATETIME,
    CONSTRAINT "KYCSubmission_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "InfluencerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "budget" REAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "location" TEXT,
    "minFollowers" INTEGER DEFAULT 0,
    "niche" TEXT,
    "paymentType" TEXT DEFAULT 'FIXED',
    CONSTRAINT "Campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignCandidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONTACTED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampaignCandidate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CampaignCandidate_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "deliverablesDescription" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "history" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CampaignCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "platformFee" REAL NOT NULL,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "terms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CampaignCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Contract_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submissionUrl" TEXT,
    "submissionNotes" TEXT,
    "submittedAt" DATETIME,
    "approvedAt" DATETIME,
    "feedback" TEXT,
    CONSTRAINT "Deliverable_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EscrowTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentGatewayRef" TEXT,
    "invoiceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EscrowTransaction_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "bankReference" TEXT,
    "adminNotes" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "PayoutRequest_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT,
    "participants" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "initiatedBy" TEXT,
    CONSTRAINT "ChatThread_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CampaignCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachmentType" TEXT,
    "attachmentUrl" TEXT,
    "deliveredAt" DATETIME,
    "seenAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "raiserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dispute_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "verified_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "email_otps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "creators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "email" TEXT,
    "full_name" TEXT,
    "phone" TEXT,
    "niche" TEXT,
    "instagram_url" TEXT,
    "youtube_url" TEXT,
    "profile_image_url" TEXT,
    "auto_profile_image_url" TEXT,
    "display_name" TEXT,
    "auto_display_name" TEXT,
    "bio" TEXT,
    "auto_bio" TEXT,
    "pricing" TEXT,
    "price" INTEGER,
    "price_story" INTEGER,
    "price_post" INTEGER,
    "price_collab" INTEGER,
    "price_type" TEXT DEFAULT 'Per Post',
    "media_kit" TEXT,
    "raw_social_data" TEXT,
    "last_youtube_fetch_at" DATETIME,
    "last_instagram_fetch_at" DATETIME,
    "verified_at" DATETIME,
    "background_image_url" TEXT,
    "payment_history" TEXT,
    "payout_methods" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
    "is_live_sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_tiktok_fetch_at" DATETIME,
    "last_twitch_fetch_at" DATETIME,
    "notification_settings" TEXT,
    "tiktok_url" TEXT,
    "twitch_url" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "platforms" TEXT,
    CONSTRAINT "creators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "creator_social_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" DATETIME,
    "username" TEXT,
    "type" TEXT NOT NULL DEFAULT 'OAUTH',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "creator_social_accounts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "creator_self_reported_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "followers_count" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "creator_self_reported_metrics_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "creator_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followers_count" INTEGER NOT NULL DEFAULT 0,
    "engagement_rate" REAL NOT NULL DEFAULT 0,
    "views_count" TEXT,
    "media_count" INTEGER,
    "avg_likes" REAL,
    "avg_comments" REAL,
    "reach" INTEGER,
    "source" TEXT DEFAULT 'oauth',
    "fetched_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_response" TEXT,
    CONSTRAINT "creator_metrics_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "creator_kyc_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "instagram_followers" INTEGER,
    "youtube_subscribers" INTEGER,
    "total_posts" INTEGER,
    "engagement_rate" REAL,
    "admin_notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" DATETIME,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "liveness_prompt" TEXT,
    "liveness_result" TEXT,
    "selfie_captured_at" DATETIME,
    "selfie_image_key" TEXT,
    "verified_by_admin_at" DATETIME,
    CONSTRAINT "creator_kyc_submissions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BrandWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BrandWallet_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "campaignId" TEXT,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "BrandWallet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RazorpayPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "signature" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CampaignAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignAssignment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampaignAssignment_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayoutRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "utr" TEXT NOT NULL,
    "processedBy" TEXT,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PayoutRecord_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PayoutRecord_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "InfluencerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BrandProfile_userId_key" ON "BrandProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedInfluencer_brandId_influencerId_key" ON "SavedInfluencer"("brandId", "influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerProfile_userId_key" ON "InfluencerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KYCSubmission_profileId_key" ON "KYCSubmission"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignCandidate_campaignId_influencerId_key" ON "CampaignCandidate"("campaignId", "influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_candidateId_key" ON "Offer"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_candidateId_key" ON "Contract"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatThread_candidateId_key" ON "ChatThread"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON "Block"("blockerId", "blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_otps_user_id_key" ON "email_otps"("user_id");

-- CreateIndex
CREATE INDEX "email_otps_user_id_idx" ON "email_otps"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "creators_user_id_key" ON "creators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_social_accounts_creator_id_provider_key" ON "creator_social_accounts"("creator_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "creator_self_reported_metrics_creator_id_provider_key" ON "creator_self_reported_metrics"("creator_id", "provider");

-- CreateIndex
CREATE INDEX "creator_metrics_creator_id_provider_date_idx" ON "creator_metrics"("creator_id", "provider", "date");

-- CreateIndex
CREATE UNIQUE INDEX "creator_kyc_submissions_creator_id_key" ON "creator_kyc_submissions"("creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "BrandWallet_brandId_key" ON "BrandWallet"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayPayment_orderId_key" ON "RazorpayPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignAssignment_campaignId_key" ON "CampaignAssignment"("campaignId");
