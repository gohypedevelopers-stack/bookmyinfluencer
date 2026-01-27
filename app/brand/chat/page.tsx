
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
        return <div className="p-10 text-white">Brand profile not found.</div>;
    }

    const brandProfileId = user.brandProfile.id;

    // Fetch threads where:
    // 1. Thread follows Candidate -> Campaign -> Brand
    // 2. OR Thread participants contains user ID (SQLite string hack)
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
                    influencer: { include: { user: true } },
                    offer: true,
                    campaign: true,
                }
            },
            messages: {
                take: 50,
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    // Map to shape expected by ChatClient
    const threads = rawThreads.map((t: any) => ({
        ...t,
        influencer: t.candidate?.influencer,
        lastMessage: t.messages[t.messages.length - 1]
    })).filter((t: any) => t.influencer); // Ensure we have a counterpart to show

    const activeThread = threads.find((t: any) => t.id === threadId) || (threads.length > 0 ? threads[0] : null);

    return (
        <ChatClient
            threads={threads}
            selectedThreadId={activeThread?.id}
            messages={activeThread?.messages || []}
            currentUserId={session.user.id}
            brandProfileId={brandProfileId}
        />
    );
}
