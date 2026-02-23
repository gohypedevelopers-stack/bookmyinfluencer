import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getManagerThreads, getManagerMessages } from "../actions";
import ManagerChatClient from "./ManagerChatClient";

export default async function ManagerChatPage({ searchParams }: { searchParams: Promise<{ threadId?: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user?.role as string)) {
        redirect("/");
    }

    const { threadId } = await searchParams;

    const threadsResult = await getManagerThreads();
    const threads = threadsResult.success && threadsResult.data ? (threadsResult.data as any[]) : [];

    let messages: any[] = [];
    if (threadId) {
        const messagesResult = await getManagerMessages(threadId);
        if (messagesResult.success && messagesResult.data) {
            messages = messagesResult.data;
        }
    }

    return (
        <ManagerChatClient
            threads={threads}
            selectedThreadId={threadId}
            messages={messages}
            currentUserId={session.user.id}
        />
    );
}
