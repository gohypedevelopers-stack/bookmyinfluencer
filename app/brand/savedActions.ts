'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
    isVisibleCreatorProfile,
    visibleCreatorWhereWith,
    visibleInfluencerProfileWhereWith,
} from "@/lib/profile-visibility";

export async function toggleSavedInfluencer(targetId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'BRAND') {
            return { success: false, error: 'Unauthorized' };
        }

        const brand = await db.brandProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!brand) return { success: false, error: 'Brand profile not found' };

        // The ID passed from the frontend is usually the User ID or Creator ID.
        // We must resolve it to an InfluencerProfile ID because SavedInfluencer requires it.
        let actualInfluencerId = targetId;
        const profileByDirectId = await db.influencerProfile.findFirst({
            where: visibleInfluencerProfileWhereWith({ id: targetId }),
        });
        
        if (!profileByDirectId) {
            // Try by userId
            const profileByUserId = await db.influencerProfile.findFirst({
                where: visibleInfluencerProfileWhereWith({ userId: targetId }),
            });
            if (profileByUserId) {
                actualInfluencerId = profileByUserId.id;
            } else {
                // If it's a Creator.id or Creator.userId, try to find the Creator
                const creator = await db.creator.findFirst({
                    where: visibleCreatorWhereWith({ OR: [{ id: targetId }, { userId: targetId }] })
                });
                
                if (creator && isVisibleCreatorProfile(creator)) {
                    // Create an empty InfluencerProfile for the user using Creator info so it can be saved in DB
                    // We don't fetch metrics deeply here; default to 0. The UI fetches actual metrics dynamically.
                    const newProfile = await db.influencerProfile.create({
                        data: {
                            userId: creator.userId,
                            niche: creator.niche || 'General',
                            followers: 0,
                            onboardingCompleted: true,
                        }
                    });
                    actualInfluencerId = newProfile.id;
                } else {
                    return { success: false, error: 'Influencer not found in database' };
                }
            }
        }

        // Check if already saved
        // @ts-ignore
        const existing = await db.savedInfluencer.findUnique({
            where: {
                brandId_influencerId: {
                    brandId: brand.id,
                    influencerId: actualInfluencerId
                }
            }
        });

        if (existing) {
            // Unsave
            // @ts-ignore
            await db.savedInfluencer.delete({
                where: { id: existing.id }
            });
        } else {
            // Save
            // @ts-ignore
            await db.savedInfluencer.create({
                data: {
                    brandId: brand.id,
                    influencerId: actualInfluencerId
                }
            });
        }

        revalidatePath('/brand');
        revalidatePath('/brand/discover');
        revalidatePath('/brand/collections');
        return { success: true, isSaved: !existing };
    } catch (error) {
        console.error("Toggle Saved Influencer Error:", error);
        return { success: false, error: 'Failed to toggle saved status' };
    }
}

export async function getSavedInfluencers() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'BRAND') {
            return { success: false, error: 'Unauthorized' };
        }

        const brand = await db.brandProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!brand) return { success: false, error: 'Brand profile not found' };

        // @ts-ignore
        const saved = await db.savedInfluencer.findMany({
            where: {
                brandId: brand.id,
                influencer: visibleInfluencerProfileWhereWith(),
            },
            include: {
                influencer: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, savedInfluencers: saved };
    } catch (error) {
        console.error("Get Saved Influencers Error:", error);
        return { success: false, error: 'Failed to fetch saved influencers' };
    }
}
