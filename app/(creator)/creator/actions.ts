'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to get the actual Creator ID (from the Creator table, not User/OtpUser)
async function getCreatorId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    // 1. Try finding via User (NextAuth) -> InfluencerProfile (Legacy? No, check schema) -> Wait, schema has Creator linked to OtpUser
    // The auth system seems a bit hybrid.
    // Let's use the email to find the OtpUser -> Creator

    // Check if session user ID matches an OtpUser?
    // In `app/api/creator/campaigns/apply/route.ts` it used `getAuthenticatedCreatorId` from `@/lib/onboarding-auth`.
    // Let's try to stick to that pattern if possible, but since this is a server action, let's replicate the logic or simpler if session has email.

    const otpUser = await db.otpUser.findUnique({
        where: { email: session.user.email },
        include: { creator: true }
    });

    return otpUser?.creator?.userId; // This is the ID used in db.creator.findUnique({ where: { userId } }) often?
    // Wait, `userId` in Creator table is a FK to OtpUser.id.
    // Calls usually expect `creatorId` (UUID) or `userId`?
    // `getPublicCreators` uses `db.creator.findMany` and returns `userId`.
    // `handleCollabRequest` uses `candidate.influencer.userId` for notifications.
    // So the "User ID" for notifications is likely the OtpUser ID or the NextAuth User ID.

    // If the creator logged in via OTP, they have an OtpUser.
    // If they logged in via Google (NextAuth User), they have a User.
    // The Schema `Notification` model links to `User` model (NextAuth).
    // `model Notification { user User ... }`

    // If the creator is using the new dashboard, are they using `User` or `OtpUser`?
    // `app/brand/layout.tsx` checks `session.user.role`.
    // If `session` exists, `session.user.id` is the `User` ID.

    // So for Notifications, we should use `session.user.id`.

    return session?.user?.id || null;
}

// --- NOTIFICATIONS ---

export async function getCreatorNotifications() {
    const userId = await getCreatorId();
    if (!userId) return [];

    try {
        const notifications = await db.notification.findMany({
            where: {
                userId: userId,
                read: false
            },
            orderBy: { createdAt: 'desc' }
        });
        return notifications;
    } catch (error) {
        console.error("Failed to fetch notifications", error);
        return [];
    }
}

export async function markCreatorNotificationRead(notificationId: string) {
    const userId = await getCreatorId();
    if (!userId) return { success: false };

    try {
        await db.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        revalidatePath('/creator/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// --- MESSAGES ---

export async function getCreatorThreads() {
    const userId = await getCreatorId();
    if (!userId) return [];

    try {
        // Participants is a string CSV: "userId1,userId2"
        // We need to find threads where this userId is present.
        // Prisma `contains` on string field.

        const threads = await db.chatThread.findMany({
            where: {
                participants: {
                    contains: userId
                }
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                candidate: {
                    include: {
                        campaign: {
                            include: {
                                brand: {
                                    include: { user: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Format for UI
        return threads.map(thread => {
            const brand = thread.candidate?.campaign.brand;
            const lastMsg = thread.messages[0];

            return {
                id: thread.id,
                name: brand?.companyName || "Unknown Brand",
                image: brand?.user?.image || null,
                lastMessage: lastMsg?.content || "No messages yet",
                updatedAt: lastMsg?.createdAt || thread.updatedAt,
                unread: false // TODO: Add read status to Thread participants or Message read status
            };
        });

    } catch (error) {
        console.error("Failed to fetch threads", error);
        return [];
    }
}

export async function getThreadMessages(threadId: string) {
    const userId = await getCreatorId();
    if (!userId) return [];

    try {
        const messages = await db.message.findMany({
            where: { threadId },
            orderBy: { createdAt: 'asc' }, // Oldest first for chat
            include: {
                sender: true
            }
        });

        return messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            senderName: msg.sender.name || "User",
            senderImage: msg.sender.image,
            createdAt: msg.createdAt,
            isMe: msg.senderId === userId
        }));

    } catch (error) {
        console.error("Failed to fetch messages", error);
        return [];
    }
}

export async function sendMessage(threadId: string, content: string) {
    const userId = await getCreatorId();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const message = await db.message.create({
            data: {
                threadId,
                senderId: userId,
                content
            }
        });

        // Update thread updated at
        await db.chatThread.update({
            where: { id: threadId },
            data: { updatedAt: new Date() }
        });

        revalidatePath('/creator/messages');
        return { success: true, message };
    } catch (error) {
        console.error("Failed to send message", error);
        return { success: false, error: "Failed to send" };
    }
}

// --- INVITATION RESPONSE ---

export async function respondToInvitation(candidateId: string, action: 'ACCEPT' | 'DECLINE') {
    const userId = await getCreatorId();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        // Verify the candidate exists and belongs to this creator
        const candidate = await db.campaignCandidate.findUnique({
            where: { id: candidateId },
            include: {
                campaign: {
                    include: {
                        brand: {
                            include: { user: true }
                        }
                    }
                },
                influencer: {
                    include: { user: true }
                }
            }
        });

        if (!candidate) {
            return { success: false, error: "Invitation not found" };
        }

        // Check ownership - verify this invitation belongs to the current user
        // The influencer.userId might be from different auth systems, so we check multiple ways
        const session = await getServerSession(authOptions);
        const isOwner = candidate.influencer.userId === userId ||
            candidate.influencer.user?.email === session?.user?.email;

        if (!isOwner) {
            return { success: false, error: "Unauthorized - This invitation doesn't belong to you" };
        }

        if (action === 'ACCEPT') {
            // 1. Update candidate status to IN_NEGOTIATION
            await db.campaignCandidate.update({
                where: { id: candidateId },
                data: { status: 'IN_NEGOTIATION' }
            });

            // 2. Create or get chat thread
            let thread = await db.chatThread.findUnique({
                where: { candidateId }
            });

            if (!thread) {
                const brandUserId = candidate.campaign.brand.userId;
                thread = await db.chatThread.create({
                    data: {
                        candidate: {
                            connect: { id: candidateId }
                        },
                        participants: `${brandUserId},${userId}`
                    }
                });
            }

            // 3. Send initial message from creator
            await db.message.create({
                data: {
                    threadId: thread.id,
                    senderId: userId,
                    content: `Hi! I'm excited about this collaboration opportunity. Let's discuss the details!`
                }
            });

            // 4. Notify brand
            if (candidate.campaign.brand.userId) {
                await db.notification.create({
                    data: {
                        userId: candidate.campaign.brand.userId,
                        type: 'MESSAGE',
                        title: 'Invitation Accepted',
                        message: `${candidate.influencer.user?.name || 'A creator'} has accepted your collaboration invitation for ${candidate.campaign.title}!`,
                        link: `/brand/messages?threadId=${thread.id}`
                    }
                });
            }

            revalidatePath('/creator/campaigns');
            revalidatePath('/creator/messages');
            return { success: true, threadId: thread.id };

        } else {
            // DECLINE
            await db.campaignCandidate.update({
                where: { id: candidateId },
                data: { status: 'REJECTED' }
            });

            // Notify brand
            if (candidate.campaign.brand.userId) {
                await db.notification.create({
                    data: {
                        userId: candidate.campaign.brand.userId,
                        type: 'SYSTEM',
                        title: 'Invitation Declined',
                        message: `${candidate.influencer.user?.name || 'A creator'} has declined your invitation for ${candidate.campaign.title}.`,
                        link: `/brand/campaigns`
                    }
                });
            }

            revalidatePath('/creator/campaigns');
            return { success: true };
        }

    } catch (error) {
        console.error("Failed to respond to invitation:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to process your response";
        return { success: false, error: errorMessage };
    }
}

