export enum UserRole {
    BRAND = 'BRAND',
    INFLUENCER = 'INFLUENCER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
}

export enum KYCStatus {
    NOT_SUBMITTED = 'NOT_SUBMITTED',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum CampaignStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED',
    ARCHIVED = 'ARCHIVED',
}

export enum CandidateStatus {
    CONTACTED = 'CONTACTED',
    IN_NEGOTIATION = 'IN_NEGOTIATION',
    HIRED = 'HIRED',
    CONTENT_REVIEW = 'CONTENT_REVIEW',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    OFFERED = 'OFFERED',
}

export enum OfferStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    COUNTERED = 'COUNTERED',
}

export enum LivenessPrompt {
    SMILE = 'SMILE',
    BLINK = 'BLINK',
}

export enum LivenessResult {
    PASSED = 'PASSED',
    FAILED = 'FAILED',
    NOT_CHECKED = 'NOT_CHECKED',
}

export enum ContractStatus {
    DRAFT = 'DRAFT',
    PENDING_ESCROW = 'PENDING_ESCROW',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DISPUTED = 'DISPUTED',
}

export enum DeliverableStatus {
    PENDING = 'PENDING',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum EscrowTransactionStatus {
    PENDING = 'PENDING',
    FUNDED = 'FUNDED',
    RELEASED = 'RELEASED',
    REFUNDED = 'REFUNDED',
    DISPUTED = 'DISPUTED',
}

export enum PayoutStatus {
    REQUESTED = 'REQUESTED',
    PROCESSING = 'PROCESSING',
    PAID = 'PAID',
    FAILED = 'FAILED',
}

export enum DisputeStatus {
    OPEN = 'OPEN',
    RESOLVED_REFUND = 'RESOLVED_REFUND',
    RESOLVED_RELEASE = 'RESOLVED_RELEASE',
    CLOSED = 'CLOSED',
}

export enum MessageStatus {
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    SEEN = 'SEEN',
}
