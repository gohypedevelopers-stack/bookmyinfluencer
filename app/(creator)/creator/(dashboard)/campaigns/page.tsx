import { db } from "@/lib/db";
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth";
import CreatorCampaignsClient from "./CreatorCampaignsClient";

export const dynamic = "force-dynamic";

export default async function CreatorCampaignsPage() {
    const creatorId = await getAuthenticatedCreatorId();

    let candidates: any[] = [];
    let followerCount = 0;

    if (creatorId) {
        const otpUser = await db.otpUser.findUnique({
            where: { id: creatorId },
            include: { creator: true },
        });

        if (otpUser?.email) {
            const legacyUser = await db.user.findUnique({
                where: { email: otpUser.email },
                include: { influencerProfile: true },
            });

            if (legacyUser?.influencerProfile) {
                const influencerId = legacyUser.influencerProfile.id;
                followerCount = legacyUser.influencerProfile.followers || 0;

                candidates = await db.campaignCandidate.findMany({
                    where: {
                        influencerId,
                        influencer: {
                            followers: {
                                gte: 10_000,
                                lte: 500_000,
                            },
                        },
                        campaign: {
                            paymentStatus: "PAID",
                        },
                        brandDecision: "ACCEPTED",
                    },
                    include: {
                        campaign: {
                            include: {
                                brand: { include: { user: true } },
                                assignment: { include: { manager: true } },
                            },
                        },
                        chatThread: {
                            include: {
                                messages: {
                                    include: {
                                        sender: { select: { id: true, name: true } },
                                    },
                                    orderBy: { createdAt: "desc" },
                                    take: 5,
                                },
                            },
                        },
                    },
                    orderBy: { updatedAt: "desc" },
                });
            }
        }
    }

    return <CreatorCampaignsClient candidates={candidates} followerCount={followerCount} />;
}

