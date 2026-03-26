'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { sendBrandManagerConversationMessage } from "@/app/brand/campaigns/flow-actions";

type ConversationMessage = {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    senderName: string;
    isMe: boolean;
};

type BrandManagerChatCardProps = {
    campaignId: string;
    currentUserId: string;
    managerName: string;
    locked: boolean;
    initialMessages: ConversationMessage[];
};

export default function BrandManagerChatCard({
    campaignId,
    currentUserId,
    managerName,
    locked,
    initialMessages,
}: BrandManagerChatCardProps) {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
    const [isPending, startTransition] = useTransition();

    const sendMessage = () => {
        const content = input.trim();
        if (!content || locked) return;

        startTransition(async () => {
            const result = await sendBrandManagerConversationMessage(campaignId, content);
            if (result.success) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `local-${Date.now()}`,
                        content,
                        createdAt: new Date().toISOString(),
                        senderId: currentUserId,
                        senderName: "You",
                        isMe: true,
                    },
                ]);
                setInput("");
                router.refresh();
            }
        });
    };

    return (
        <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Project Manager Chat</h3>
                <p className="text-sm text-gray-500">
                    Communication is manager-led. Direct brand-creator chat is disabled.
                </p>
            </div>

            {locked ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-3">
                    Make payment first to unlock manager chat for this campaign.
                </div>
            ) : (
                <>
                    <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                        {messages.length === 0 ? (
                            <p className="text-sm text-gray-500">No messages yet. Start with your campaign brief update.</p>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.senderId === currentUserId
                                        ? "ml-auto bg-indigo-600 text-white"
                                        : "bg-white border border-gray-200 text-gray-800"
                                        }`}
                                >
                                    {message.senderId !== currentUserId && (
                                        <p className="text-[11px] font-bold text-gray-500 mb-1">{message.senderName || managerName}</p>
                                    )}
                                    <p>{message.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder={`Message ${managerName}`}
                            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isPending || !input.trim()}
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                        >
                            <Send className="w-4 h-4" />
                            Send
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}

