'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Helper to get the actual Creator ID (Resolved to a User table ID)
// Helper to get the actual Creator ID (Resolved to a User table ID)
async function getCreatorId() {
    // 1. Try OTP Session Cookie first (Preferred for Creator App)
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const otpSession = cookieStore.get("session")?.value;

    if (otpSession) {
        try {
            const { verifySession } = await import("@/lib/session");
            const payload = await verifySession(otpSession);
            if (payload?.userId) {
                // Ensure shadow User exists for compatibility
                const otpUser = await db.otpUser.findUnique({
                    where: { id: payload.userId },
                    include: { creator: true }
                });

                if (otpUser) {
                    // Try to find existing shadow user
                    const existingUser = await db.user.findUnique({
                        where: { email: otpUser.email }
                    });

                    if (existingUser) return existingUser.id;

                    // Create shadow User if missing
                    const newUser = await db.user.create({
                        data: {
                            email: otpUser.email,
                            name: otpUser.creator?.displayName || otpUser.creator?.fullName || "Creator",
                            image: otpUser.creator?.profileImageUrl,
                            role: 'INFLUENCER'
                        }
                    });
                    return newUser.id;
                }
            }
        } catch (e) {
            // Invalid OTP session, fall through to NextAuth
        }
    }

    // 2. Try NextAuth Session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    // 3. Try finding existing User (NextAuth/Schema-compliant)
    let user = await db.user.findUnique({
        where: { email: session.user.email }
    });

    // 4. If no User, check OtpUser and create shadow User
    if (!user) {
        const otpUser = await db.otpUser.findUnique({
            where: { email: session.user.email },
            include: { creator: true }
        });

        if (otpUser) {
            // Create shadow User
            user = await db.user.create({
                data: {
                    email: otpUser.email,
                    name: otpUser.creator?.displayName || otpUser.creator?.fullName || "Creator",
                    image: otpUser.creator?.profileImageUrl,
                    role: 'INFLUENCER'
                }
            });
        }
    }

    return user?.id || null;
}

// --- NOTIFICATIONS ---

export async function getCreatorNotifications() {
    const userId = await getCreatorId();
    if (!userId) return { notifications: [], unreadMessageCount: 0 };

    try {
        const [notifications, unreadMessageCount] = await Promise.all([
            db.notification.findMany({
                where: {
                    userId: userId,
                    read: false
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            }),
            db.message.count({
                where: {
                    thread: { participants: { contains: userId } },
                    senderId: { not: userId },
                    read: false
                }
            })
        ]);


        return { notifications, unreadMessageCount };
    } catch (error) {
        console.error("Failed to fetch notifications", error);
        return { notifications: [], unreadMessageCount: 0 };
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
    console.log("getCreatorThreads userId:", userId);
    if (!userId) return [];

    try {
        const threads = await db.chatThread.findMany({
            where: {
                participants: {
                    contains: userId
                }
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { id: true, content: true, createdAt: true, senderId: true }
                },
                candidate: {
                    select: {
                        id: true,
                        contract: { select: { status: true } },
                        campaign: {
                            select: {
                                id: true, title: true,
                                brand: {
                                    select: { id: true, companyName: true, userId: true, user: { select: { id: true, name: true, image: true } } }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        console.log(`Found ${threads.length} threads for creator ${userId}`);

        // For direct messages, we need to fetch the other user (Brand User)
        // Identify direct threads (candidate is null)
        const directThreadIds = threads.filter(t => !t.candidate).map(t => t.id);

        let directUsersMap = new Map();
        if (directThreadIds.length > 0) {
            const directThreads = threads.filter(t => !t.candidate);
            const otherUserIds = directThreads.map(t => {
                const parts = t.participants.split(',');
                return parts.find(id => id !== userId);
            }).filter((id): id is string => !!id);

            if (otherUserIds.length > 0) {
                const users = await db.user.findMany({
                    where: { id: { in: otherUserIds } },
                    select: { id: true, name: true, image: true, brandProfile: { select: { id: true, companyName: true } } }
                });
                users.forEach(u => directUsersMap.set(u.id, u));
            }
        }

        // Format for UI
        return threads.map(thread => {
            let name = "Unknown Brand";
            let image = null;
            let brandProfileId = null;
            let brandUserId = null;

            if (thread.candidate) {
                const brand = thread.candidate.campaign.brand;
                name = brand?.companyName || "Unknown Brand";
                image = brand?.user?.image || null;
                brandProfileId = brand?.id || null;
                brandUserId = brand?.userId || null;
            } else {
                // Direct DM
                const otherParticipantId = thread.participants.split(',').map(p => p.trim()).find(id => id !== userId);
                if (otherParticipantId) {
                    const otherUser = directUsersMap.get(otherParticipantId);
                    if (otherUser) {
                        name = otherUser.brandProfile?.companyName || otherUser.name || "Brand";
                        image = otherUser.image || null;
                        brandProfileId = otherUser.brandProfile?.id || null;
                        brandUserId = otherUser.id;
                    }
                }
            }

            const lastMsg = thread.messages[0];

            return {
                id: thread.id,
                name,
                image,
                lastMessage: lastMsg?.content || "No messages yet",
                updatedAt: lastMsg?.createdAt || thread.updatedAt,
                unread: false,
                brandId: brandProfileId,
                brandUserId: brandUserId,
                isLastMessageMe: lastMsg?.senderId === userId,
                contractStatus: thread.candidate?.contract?.status || null,
                isCampaign: !!thread.candidate
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
            orderBy: { createdAt: 'desc' },
            take: 50,  // Most recent 50; older loaded on demand
            select: {
                id: true,
                content: true,
                senderId: true,
                createdAt: true,
                sender: { select: { id: true, name: true, image: true } }
            }
        });
        messages.reverse(); // restore chronological order

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

import { pusherServer } from "@/lib/pusher-server";

// ... (getCreatorThreads and getThreadMessages remain unchanged)

export async function markMessagesRead(threadId: string) {
    const userId = await getCreatorId();
    if (!userId) return { success: false };

    try {
        const result = await db.message.updateMany({
            where: {
                threadId,
                senderId: { not: userId },
                read: false
            },
            data: {
                read: true,
                status: "SEEN",
                seenAt: new Date()
            }
        });

        if (result.count > 0) {
            const thread = await db.chatThread.findUnique({
                where: { id: threadId }
            });
            if (thread) {
                const participants = thread.participants.split(',');
                const otherUserId = participants.find(p => p !== userId);
                if (otherUserId) {
                    await pusherServer.trigger(otherUserId, 'message:seen', {
                        threadId,
                        userId: userId
                    });
                }
            }
        }

        revalidatePath('/creator/messages');
        return { success: true };
    } catch (error) {
        console.error("Failed to mark messages read", error);
        return { success: false };
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
                content,
                status: "SENT"
            },
            include: {
                sender: {
                    select: { name: true, image: true, id: true }
                }
            }
        });

        const thread = await db.chatThread.findUnique({
            where: { id: threadId }
        });

        if (thread) {
            const participants = thread.participants.split(',');
            const recipientId = participants.find(p => p !== userId);

            if (recipientId) {
                await pusherServer.trigger(recipientId, 'message:new', message);
            }
        }

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

export async function notifyTyping(threadId: string, isTyping: boolean) {
    const userId = await getCreatorId();
    if (!userId) return { success: false };

    try {
        await pusherServer.trigger(`presence-thread-${threadId}`, isTyping ? 'typing:start' : 'typing:stop', {
            userId: userId
        });
        return { success: true };
    } catch (error) {
        return { success: false };
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
                        title: 'Collaboration accepted ✅',
                        message: `Your request was accepted. Pay the advance to start chat.`,
                        link: `/brand/chat?threadId=${thread.id}`
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

// --- CHAT ACTIONS ---

export async function deleteThread(threadId: string) {
    const userId = await getCreatorId();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        // Verify ownership/participation
        const thread = await db.chatThread.findUnique({
            where: { id: threadId },
            select: { participants: true }
        });

        if (!thread || !thread.participants.includes(userId)) {
            return { success: false, error: "Thread not found or unauthorized" };
        }

        // Hard delete for now, or could just hide it? 
        // Schema doesn't support soft delete yet. 
        // Brand action calls it deleteThread, let's assume it deletes.
        await db.chatThread.delete({
            where: { id: threadId }
        });

        revalidatePath('/creator/messages');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete thread", error);
        return { success: false, error: "Failed to delete conversation" };
    }
}

export async function blockBrand(brandUserId: string) {
    const userId = await getCreatorId();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        await db.block.create({
            data: {
                blockerId: userId,
                blockedId: brandUserId
            }
        });
        revalidatePath('/creator/messages');
        return { success: true };
    } catch (error) {
        console.error("Failed to block brand", error);
        return { success: false, error: "Failed to block" };
    }
}

export async function reportBrand(brandUserId: string, reason: string) {
    const userId = await getCreatorId();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        await db.report.create({
            data: {
                reporterId: userId,
                reportedId: brandUserId,
                reason: reason,
                status: 'PENDING'
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to report brand", error);
        return { success: false, error: "Failed to report" };
    }
}

// --- EARNINGS ---

export async function getCreatorEarnings() {
    const userId = await getCreatorId();
    if (!userId) return {
        availableBalance: 0,
        pendingEscrow: 0,
        lifetimeEarnings: 0,
        transactions: [],
        payoutMethods: []
    };

    try {
        const influencer = await db.influencerProfile.findUnique({
            where: { userId: userId },
            select: {
                id: true,
                user: { select: { email: true } }
            }
        });

        if (!influencer) return {
            availableBalance: 0,
            pendingEscrow: 0,
            lifetimeEarnings: 0,
            transactions: [],
            payoutMethods: []
        };

        const payoutRecords = await db.payoutRecord.findMany({
            where: { creatorId: influencer.id },
            select: {
                id: true, amount: true, paidAt: true, method: true, utr: true,
                campaign: { select: { title: true, brand: { select: { companyName: true } } } }
            },
            orderBy: { paidAt: 'desc' },
            take: 50
        });

        const contracts = await db.contract.findMany({
            where: { influencerId: influencer.id },
            select: {
                id: true,
                transactions: { select: { amount: true, status: true } }
            },
            take: 50
        });

        let lifetimeEarnings = 0;
        let pendingEscrow = 0;
        // let releasedEscrow = 0; // Not used for "Available" anymore since manual payout

        const transactionsList: any[] = [];

        // 1. Process PENDING ESCROW (Funded Contracts)
        contracts.forEach(contract => {
            contract.transactions.forEach(tx => {
                const amount = tx.amount;
                // PENDING ESCROW = FUNDED
                if (tx.status === 'FUNDED') {
                    pendingEscrow += amount;
                }
                // We IGNORE 'RELEASED' escrow here because we rely on PayoutRecord for actual earnings history now.
                // Unless we want to support both flows? 
                // User said "Creator earnings/wallet must show money ONLY after Manager/Admin marks payout as PAID".
                // So we strictly use PayoutRecord for earnings.
            });
        });

        // 2. Process PAYOUT RECORDS (Actual Earnings / Paid Out)
        if (payoutRecords.length > 0) {
            payoutRecords.forEach(record => {
                lifetimeEarnings += record.amount;

                transactionsList.push({
                    id: record.id,
                    brand: record.campaign.brand.companyName || "Brand",
                    date: record.paidAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    amount: `+₹${record.amount.toFixed(2)}`,
                    status: 'Paid', // Explicitly PAID
                    originalDate: record.paidAt,
                    method: record.method,
                    utr: record.utr
                });
            });
        }

        // 3. Process Old Witherswals (PayoutRequests) if any?
        // If we switched to manual payouts, maybe we hide old withdrawals or show them as history?
        // Let's keep them for history but they don't affect "Available Balance" calculation since Available Balance is now 0.
        // Actually, if we show "Paid" income, that money is with the creator.
        // "Available to Withdraw" implies checking wallet balance held by platform.
        // Since platform holds 0 (manager pays manually), availableBalance = 0.

        const availableBalance = 0;

        // Sort by date
        transactionsList.sort((a, b) => b.originalDate - a.originalDate);

        // Fetch Payout Methods (for display settings)
        let payoutMethods: any[] = [];
        if (influencer.user.email) {
            const otpUser = await db.otpUser.findUnique({
                where: { email: influencer.user.email },
                include: { creator: true }
            });
            if (otpUser?.creator?.payoutMethods) {
                try {
                    payoutMethods = JSON.parse(otpUser.creator.payoutMethods);
                } catch (e) {
                    console.error("Failed to parse payout methods", e);
                }
            }
        }

        return {
            availableBalance,
            pendingEscrow,
            lifetimeEarnings, // This now reflects total PayoutRecords
            transactions: transactionsList,
            payoutMethods
        };

    } catch (error) {
        console.error("Failed to fetch earnings", error);
        return { availableBalance: 0, pendingEscrow: 0, lifetimeEarnings: 0, transactions: [], payoutMethods: [] };
    }
}

export async function requestPayout(amount: number) {
    const userId = await getCreatorId();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const influencer = await db.influencerProfile.findUnique({
            where: { userId: userId }
        });

        if (!influencer) return { success: false, error: "Influencer profile not found" };

        // Double check balance
        const earnings = await getCreatorEarnings();
        if ((earnings.availableBalance || 0) < amount) {
            return { success: false, error: "Insufficient funds" };
        }

        await db.payoutRequest.create({
            data: {
                influencerId: influencer.id,
                amount: amount,
                status: 'REQUESTED'
            }
        });

        revalidatePath('/creator/earnings');
        return { success: true };
    } catch (error) {
        console.error("Failed to request payout", error);
        return { success: false, error: "Failed to request payout" };
    }
}

// --- ANALYTICS ---

export async function getCreatorAnalytics(provider?: string, days: number = 30) {
    const userId = await getCreatorId();
    if (!userId) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
        const creator = await db.creator.findUnique({
            where: { userId },
            include: {
                metrics: {
                    where: {
                        ...(provider ? { provider } : {}),
                        date: { gte: startDate }
                    },
                    orderBy: { date: 'asc' }
                }
            }
        });

        if (!creator) return null;

        // Process KPIs (Latest metric)
        const latestMetrics = creator.metrics.slice(-1)[0] || null;

        // Process Trend Data
        const trendData = creator.metrics.map(m => ({
            date: m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            engagement: m.followersCount > 0 ? (m.engagementRate || 0) * 100 : 0,
            followers: m.followersCount,
            originalDate: m.date
        }));

        // Process Top Content (from rawSocialData)
        let topContent: any[] = [];
        if (creator.rawSocialData) {
            try {
                const rawData = JSON.parse(creator.rawSocialData);
                // Assuming rawData is an array of posts from Apify
                const posts = Array.isArray(rawData) ? rawData : (rawData.posts || []);

                topContent = posts
                    .slice(0, 5)
                    .map((post: any) => ({
                        title: post.caption?.split('\n')[0] || "No title",
                        views: post.videoPlayCount ? (post.videoPlayCount > 1000 ? (post.videoPlayCount / 1000).toFixed(1) + 'K' : post.videoPlayCount) : null,
                        likes: post.likesCount > 1000 ? (post.likesCount / 1000).toFixed(1) + 'K' : post.likesCount,
                        image: post.displayUrl || post.thumbnailUrl || post.image
                    }));
            } catch (e) {
                console.error("Failed to parse rawSocialData", e);
            }
        }

        return {
            kpis: {
                avgLikes: latestMetrics?.avgLikes || 0,
                reach: latestMetrics?.followersCount || 0, // Simplified reach
                engagementRate: (latestMetrics?.engagementRate || 0) * 100,
                followersCount: latestMetrics?.followersCount || 0
            },
            trendData,
            topContent
        };

    } catch (error) {
        console.error("Failed to fetch analytics", error);
        return null;
    }
}

// --- DASHBOARD DATA ---

export async function getCreatorDashboardData(platform: string = "instagram", days: number = 30) {
    let email = null;

    // 1. Check NextAuth Session
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
        email = session.user.email;
    } else {
        // 2. Check OTP Session
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const otpSession = cookieStore.get("session")?.value;
        if (otpSession) {
            const { verifySession } = await import("@/lib/session");
            const payload = await verifySession(otpSession);
            if (payload?.userId) {
                const otpUser = await db.otpUser.findUnique({ where: { id: payload.userId } });
                email = otpUser?.email;
            }
        }
    }

    if (!email) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
        // Find OtpUser first, then Creator
        const otpUser = await db.otpUser.findUnique({
            where: { email: email },
            include: {
                creator: {
                    include: {
                        metrics: {
                            where: {
                                provider: platform,
                                date: { gte: startDate }
                            },
                            orderBy: { date: 'desc' },
                            take: 30
                        }
                    }
                }
            }
        });

        if (!otpUser?.creator) return null;

        const creator = otpUser.creator;
        const latestMetric = creator.metrics[0];

        // Calculate follower growth
        const latestFollowers = latestMetric?.followersCount || 0;
        const previousMetric = creator.metrics[1];
        const previousFollowers = previousMetric?.followersCount || latestFollowers;
        const followerGrowthRaw = previousFollowers > 0
            ? ((latestFollowers - previousFollowers) / previousFollowers) * 100
            : 0;

        // Get user to find influencer profile
        const user = await db.user.findUnique({
            where: { email: email }
        });

        // Calculate total revenue from escrow
        let totalRevenue = 0;
        let activeCollaborations = 0;

        if (user) {
            // Get influencer profile via userId
            const influencer = await db.influencerProfile.findUnique({
                where: { userId: user.id }
            });

            if (influencer) {
                // Sum released escrow via aggregate - much more efficient
                const revenueAgg = await db.escrowTransaction.aggregate({
                    where: {
                        contract: {
                            influencerId: influencer.id,
                            status: { in: ['ACTIVE', 'COMPLETED'] }
                        },
                        status: 'RELEASED',
                        createdAt: { gte: startDate }
                    },
                    _sum: { amount: true }
                });
                totalRevenue = revenueAgg._sum.amount || 0;

                // Count active contracts
                activeCollaborations = await db.contract.count({
                    where: {
                        influencerId: influencer.id,
                        status: 'ACTIVE'
                    }
                });
            }
        }

        return {
            userName: creator.fullName || creator.displayName || "Creator",
            totalRevenue: totalRevenue,
            activeCollaborations: activeCollaborations,
            followerGrowth: Math.floor(latestFollowers / 1000),
            followers: latestFollowers,
            engagementRate: Number((latestMetric?.engagementRate || 0) * 100).toFixed(1),
            platform: platform,
            platforms: (creator as any).platforms ? JSON.parse((creator as any).platforms) : ["Instagram", "YouTube"] // Default fallback
        };

    } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        return null;
    }
}






// --- BRAND PROFILE ---

export async function getPublicBrandById(id: string) {
    try {
        const brand = await db.brandProfile.findFirst({
            where: {
                OR: [
                    { id: id },
                    { userId: id }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        createdAt: true,
                    }
                },
                campaigns: {
                    where: {
                        status: 'ACTIVE'
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!brand) return { success: false, error: "Brand not found" };

        return { success: true, data: brand };
    } catch (error) {
        console.error("Error fetching brand:", error);
        return { success: false, error: "Failed to fetch brand" };
    }
}

// --- DELIVERABLES ---

export async function submitDeliverable(candidateId: string, url: string, notes?: string) {
    const userId = await getCreatorId();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const candidateResult = await db.campaignCandidate.findUnique({
            where: { id: candidateId },
            include: {
                campaign: { include: { brand: true, assignment: { select: { managerId: true } } } },
                contract: {
                    include: { deliverables: true }
                },
                influencer: { include: { user: { select: { name: true } } } }
            }
        });

        if (!candidateResult) {
            return { success: false, error: "Contract not found" };
        }

        type CandidateWithRelations = Prisma.CampaignCandidateGetPayload<{
            include: {
                campaign: { include: { brand: { select: { userId: true } }, assignment: { select: { managerId: true } } } };
                contract: { include: { deliverables: true } };
                influencer: { include: { user: { select: { name: true } } } };
            }
        }>;

        const candidate = candidateResult as unknown as CandidateWithRelations;

        if (!candidate.contract) {
            return { success: false, error: "Contract not found" };
        }

        // Find the pending deliverable
        const deliverable = candidate.contract.deliverables.find(d => d.status === 'PENDING')
            || candidate.contract.deliverables[0];

        if (!deliverable) {
            return { success: false, error: "No pending deliverables found" };
        }

        // Update Deliverable
        await db.deliverable.update({
            where: { id: deliverable.id },
            data: {
                status: 'SUBMITTED',
                submissionUrl: url,
                submissionNotes: notes,
                submittedAt: new Date()
            }
        });

        // Update Candidate Status if needed (e.g. to CONTENT_REVIEW)
        if (candidate.status !== 'CONTENT_REVIEW') {
            await db.campaignCandidate.update({
                where: { id: candidateId },
                data: { status: 'CONTENT_REVIEW' }
            });
        }

        // Create Audit Log
        await db.auditLog.create({
            data: {
                userId: userId,
                action: "DELIVERABLE_SUBMITTED",
                entity: "Deliverable",
                entityId: deliverable.id,
                details: `Submitted content for ${candidate.campaign.title}`
            }
        });

        // 5. Notify Manager & Brand
        const notificationsPool = [];

        if (candidate.campaign.assignment?.managerId) {
            notificationsPool.push(db.notification.create({
                data: {
                    userId: candidate.campaign.assignment.managerId,
                    type: "DELIVERABLE",
                    title: "Deliverable Submitted",
                    message: `${candidate.influencer.user?.name || "Creator"} submitted content for ${candidate.campaign.title}. Review required.`,
                    link: `/manager/campaigns/${candidate.campaignId}`
                }
            }));
        }

        if (candidate.campaign.brand?.userId) {
            notificationsPool.push(db.notification.create({
                data: {
                    userId: candidate.campaign.brand.userId,
                    type: "DELIVERABLE",
                    title: "Deliverable Submitted",
                    message: `Deliverable submitted. Review required.`,
                    link: `/brand/chat?threadId=${candidate.contract.id}`
                }
            }));
        }

        if (notificationsPool.length > 0) {
            await Promise.all(notificationsPool);
        }

        revalidatePath('/creator/campaigns');
        return { success: true };

    } catch (error) {
        console.error("Failed to submit deliverable", error);
        return { success: false, error: "Submission failed" };
    }
}
