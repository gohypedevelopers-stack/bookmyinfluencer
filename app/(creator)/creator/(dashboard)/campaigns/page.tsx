import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import CreatorCampaignsClient from "./CreatorCampaignsClient"
import { CampaignStatus } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function CreatorCampaignsPage() {
    const creatorId = await getAuthenticatedCreatorId()

    let candidates = [] as any[]
    let activeCampaigns = [] as any[]
    let isVerified = false
    let followerCount = 0

    if (creatorId) {
        const otpUser = await db.otpUser.findUnique({
            where: { id: creatorId },
            include: { creator: true }
        })

        if (otpUser?.creator?.verificationStatus === 'APPROVED') {
            isVerified = true
        }

        if (otpUser?.email) {
            const legacyUser = await db.user.findUnique({
                where: { email: otpUser.email },
                include: { influencerProfile: true }
            })

            if (legacyUser?.influencerProfile) {
                const profileId = legacyUser.influencerProfile.id

                // Fetch ALL candidates (My Campaigns)
                candidates = await db.campaignCandidate.findMany({
                    where: {
                        influencerId: profileId,
                    },
                    include: {
                        campaign: {
                            include: {
                                brand: {
                                    include: { user: true }
                                }
                            }
                        },
                        contract: {
                            include: {
                                deliverables: true
                            }
                        },
                        offer: true
                    },
                    orderBy: { updatedAt: 'desc' }
                })

                followerCount = legacyUser.influencerProfile.followers || 0
            }
        }

        // Fetch Global Active Campaigns (Marketplace)
        activeCampaigns = await db.campaign.findMany({
            where: {
                status: CampaignStatus.ACTIVE
            },
            include: {
                brand: {
                    include: { user: true }
                },
                _count: {
                    select: { candidates: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    return <CreatorCampaignsClient candidates={candidates} activeCampaigns={activeCampaigns} isVerified={isVerified} followerCount={followerCount} />
}
