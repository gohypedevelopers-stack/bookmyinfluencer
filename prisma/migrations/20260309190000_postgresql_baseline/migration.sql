-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'INFLUENCER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "location" TEXT,
    "paymentMethods" TEXT DEFAULT '[]',
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "campaignType" TEXT,
    "campaignBudget" TEXT,
    "targetPlatforms" TEXT,
    "preferredCreatorType" TEXT,
    "campaignGoals" TEXT,
    "minFollowers" INTEGER,
    "maxFollowers" INTEGER,
    "minPricePerPost" DOUBLE PRECISION,
    "maxPricePerPost" DOUBLE PRECISION,
    "priceType" TEXT DEFAULT 'Per Post',

    CONSTRAINT "BrandProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedInfluencer" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedInfluencer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "location" TEXT,
    "bio" TEXT,
    "instagramHandle" TEXT,
    "youtubeHandle" TEXT,
    "tiktokHandle" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "socialData" TEXT,
    "pricing" TEXT,
    "price" INTEGER,
    "priceStory" INTEGER,
    "pricePost" INTEGER,
    "priceCollab" INTEGER,
    "priceType" TEXT DEFAULT 'Per Post',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "platforms" TEXT,

    CONSTRAINT "InfluencerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCSubmission" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
    "documentType" TEXT,
    "documentUrl" TEXT,
    "documentBackUrl" TEXT,
    "panCard" TEXT,
    "bankDetails" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "livenessPrompt" TEXT,
    "livenessResult" TEXT,
    "selfieCapturedAt" TIMESTAMP(3),
    "selfieImageKey" TEXT,
    "verifiedByAdminAt" TIMESTAMP(3),

    CONSTRAINT "KYCSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "budget" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "location" TEXT,
    "minFollowers" INTEGER DEFAULT 0,
    "niche" TEXT,
    "paymentType" TEXT DEFAULT 'FIXED',

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignCandidate" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONTACTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "deliverablesDescription" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "history" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submissionUrl" TEXT,
    "submissionNotes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "feedback" TEXT,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowTransaction" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentGatewayRef" TEXT,
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "bankReference" TEXT,
    "adminNotes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "participants" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "initiatedBy" TEXT,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachmentType" TEXT,
    "attachmentUrl" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "seenAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SENT',

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "raiserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creators" (
    "id" TEXT NOT NULL,
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
    "last_youtube_fetch_at" TIMESTAMP(3),
    "last_instagram_fetch_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "background_image_url" TEXT,
    "payment_history" TEXT,
    "payout_methods" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
    "is_live_sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_tiktok_fetch_at" TIMESTAMP(3),
    "last_twitch_fetch_at" TIMESTAMP(3),
    "notification_settings" TEXT,
    "tiktok_url" TEXT,
    "twitch_url" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "platforms" TEXT,

    CONSTRAINT "creators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_social_accounts" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "username" TEXT,
    "type" TEXT NOT NULL DEFAULT 'OAUTH',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_self_reported_metrics" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "followers_count" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_self_reported_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_metrics" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followers_count" INTEGER NOT NULL DEFAULT 0,
    "engagement_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "views_count" TEXT,
    "media_count" INTEGER,
    "avg_likes" DOUBLE PRECISION,
    "avg_comments" DOUBLE PRECISION,
    "reach" INTEGER,
    "source" TEXT DEFAULT 'oauth',
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_response" TEXT,

    CONSTRAINT "creator_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_kyc_submissions" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "instagram_followers" INTEGER,
    "youtube_subscribers" INTEGER,
    "total_posts" INTEGER,
    "engagement_rate" DOUBLE PRECISION,
    "admin_notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "liveness_prompt" TEXT,
    "liveness_result" TEXT,
    "selfie_captured_at" TIMESTAMP(3),
    "selfie_image_key" TEXT,
    "verified_by_admin_at" TIMESTAMP(3),

    CONSTRAINT "creator_kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandWallet" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "campaignId" TEXT,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RazorpayPayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "signature" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RazorpayPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignAssignment" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRecord" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "utr" TEXT NOT NULL,
    "processedBy" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutRecord_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "BrandProfile" ADD CONSTRAINT "BrandProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedInfluencer" ADD CONSTRAINT "SavedInfluencer_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedInfluencer" ADD CONSTRAINT "SavedInfluencer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerProfile" ADD CONSTRAINT "InfluencerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCSubmission" ADD CONSTRAINT "KYCSubmission_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "InfluencerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignCandidate" ADD CONSTRAINT "CampaignCandidate_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignCandidate" ADD CONSTRAINT "CampaignCandidate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CampaignCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CampaignCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CampaignCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_otps" ADD CONSTRAINT "email_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creators" ADD CONSTRAINT "creators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_social_accounts" ADD CONSTRAINT "creator_social_accounts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_self_reported_metrics" ADD CONSTRAINT "creator_self_reported_metrics_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_metrics" ADD CONSTRAINT "creator_metrics_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_kyc_submissions" ADD CONSTRAINT "creator_kyc_submissions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandWallet" ADD CONSTRAINT "BrandWallet_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "BrandWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAssignment" ADD CONSTRAINT "CampaignAssignment_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAssignment" ADD CONSTRAINT "CampaignAssignment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRecord" ADD CONSTRAINT "PayoutRecord_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "InfluencerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRecord" ADD CONSTRAINT "PayoutRecord_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

