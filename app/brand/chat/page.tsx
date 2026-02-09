
import { db } from "@/lib/db";
import ChatClient from "./ChatClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChatPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user.role !== 'BRAND' && session.user.role !== 'ADMIN')) {
        redirect('/login');
    }

    const params = await searchParams;
    const threadId = params.threadId as string;

    // Get Brand Profile ID
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { brandProfile: true }
    });

    if (!user?.brandProfile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand Profile Not Found</h1>
                    <p className="text-gray-500 mb-4">You need to complete your brand profile to use messaging.</p>
                    <a href="/brand/settings" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                        Go to Settings
                    </a>
                </div>
            </div>
        );
    }

    const brandProfileId = user.brandProfile.id;

    // Fetch threads where:
    // 1. Thread follows Candidate -> Campaign -> Brand
    // 2. OR Thread participants contains user ID (Direct DMs)
    // Optimized query
    const rawThreads = await db.chatThread.findMany({
        where: {
            OR: [
                {
                    candidate: {
                        campaign: { brandId: brandProfileId }
                    }
                },
                {
                    participants: {
                        contains: session.user.id
                    }
                }
            ]
        },
        include: {
            candidate: {
                include: {
                    influencer: {
                        include: {
                            user: { select: { id: true, name: true, image: true } }
                        }
                    },
                    offer: true,
                    campaign: { select: { id: true, title: true } },
                }
            },
            messages: {
                take: 1, // We only need the last message for the list
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: { select: { id: true, name: true, image: true } }
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    // If a specific thread is selected, fetch its full details (messages)
    let activeThreadMessages: any[] = [];
    if (threadId) {
        const threadMessages = await db.message.findMany({
            where: { threadId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true, image: true } }
            }
        });
        activeThreadMessages = threadMessages;

        // Mark as read if not sent by current user
        // We can do this asynchronously or in a separate action to not block rendering
        // keeping it simple for now, maybe client side effect
    }

    // Map to shape expected by ChatClient
    // We need to fetch creator details for direct DMs where candidate is null
    // This is tricky because participants string is "userId1,userId2".
    // For direct DMs, we need to find the OTHER user.

    // Extract other user IDs from direct threads
    const directThreadUserIds = rawThreads
        .filter(t => !t.candidateId)
        .map(t => {
            const parts = t.participants.split(',');
            return parts.find(id => id !== session.user.id);
        })
        .filter((id): id is string => !!id);

    // Bulk fetch users for direct threads
    const directUsers = await db.user.findMany({
        where: { id: { in: directThreadUserIds } },
        include: { influencerProfile: true }
    });

    const directUsersMap = new Map(directUsers.map(u => [u.id, u]));

    const threads = rawThreads.map((t) => {
        let influencer = null;
        let title = 'Conversation';

        if (t.candidate) {
            influencer = t.candidate.influencer;
            title = t.candidate.campaign.title;
        } else {
            // Direct DM
            const otherUserId = t.participants.split(',').find(id => id !== session.user.id);
            if (otherUserId) {
                const otherUser = directUsersMap.get(otherUserId);
                if (otherUser && otherUser.influencerProfile) {
                    influencer = {
                        ...otherUser.influencerProfile,
                        user: otherUser
                    };
                    title = otherUser.name || 'Influencer';
                }
            }
        }

        return {
            ...t,
            influencer, // Can be null if data consistency issue, filtered below
            title,
            lastMessage: t.messages[0] // Since we ordered by desc and took 1
        };
    }).filter((t) => t.influencer) as any[];

    const activeThread = threads.find((t) => t.id === threadId) || (threads.length > 0 ? threads[0] : null);

    // If we defaulted to the first thread but didn't fetch its messages yet
    if (activeThread && !threadId && activeThreadMessages.length === 0) {
        const threadMessages = await db.message.findMany({
            where: { threadId: activeThread.id },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true, image: true } }
            }
        });
        activeThreadMessages = threadMessages;
    }

    return (
        <ChatClient
            threads={threads}
            selectedThreadId={activeThread?.id}
            messages={activeThreadMessages}
            currentUserId={session.user.id}
            brandProfileId={brandProfileId}
        />
    );
}
