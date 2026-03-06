'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleSavedInfluencer(influencerId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'BRAND') {
            return { success: false, error: 'Unauthorized' };
        }

        const brand = await db.brandProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!brand) return { success: false, error: 'Brand profile not found' };

        // Check if already saved
        // @ts-ignore
        const existing = await db.savedInfluencer.findUnique({
            where: {
                brandId_influencerId: {
                    brandId: brand.id,
                    influencerId
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
                    influencerId
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
            where: { brandId: brand.id },
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
