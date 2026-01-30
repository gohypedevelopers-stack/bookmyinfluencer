-- Manual Migration: Add KYC System Fields
-- Run this SQL directly in your PostgreSQL database when ready

-- Step 1: Add new columns to creators table
ALTER TABLE creators 
ADD COLUMN verification_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
ADD COLUMN verified_at TIMESTAMP;

-- Step 2: Create the creator_kyc_submissions table
CREATE TABLE creator_kyc_submissions (
    id VARCHAR(255) PRIMARY KEY,
    creator_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    
    -- Submitted Data
    instagram_followers INTEGER,
    youtube_subscribers INTEGER,
    total_posts INTEGER,
    engagement_rate DOUBLE PRECISION,
    
    -- Admin Review
    admin_notes TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
);

-- Step 3: Create index for faster queries
CREATE INDEX idx_kyc_status ON creator_kyc_submissions(status);
CREATE INDEX idx_kyc_creator ON creator_kyc_submissions(creator_id);

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('creators', 'creator_kyc_submissions');
