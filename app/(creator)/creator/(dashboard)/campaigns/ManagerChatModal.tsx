'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { getThreadMessages, markMessagesRead, sendMessage } from '../../actions';
import {
    Loader2,
    MessageSquare,
    Send,
    Star,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface ManagerChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: any;
}

interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderImage?: string | null;
    createdAt: string | Date;
    isMe: boolean;
}

function formatMessageTime(value: string | Date) {
    return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function ManagerChatModal({ isOpen, onClose, candidate }: ManagerChatModalProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSending, startSending] = useTransition();
    const endRef = useRef<HTMLDivElement>(null);

    const threadId = candidate?.chatThread?.id || null;
    const managerName = candidate?.campaign?.assignment?.manager?.name || 'Project Manager';
    const campaignTitle = candidate?.campaign?.title || 'campaign';

    const canChat = useMemo(
        () =>
            Boolean(
                candidate &&
                candidate.creatorDecision === 'ACCEPTED' &&
                candidate.campaign?.paymentStatus === 'PAID' &&
                threadId
            ),
        [candidate, threadId]
    );

    useEffect(() => {
        if (!isOpen || !threadId || !canChat) {
            if (!isOpen) {
                setMessages([]);
                setDraft('');
            }
            return;
        }

        let cancelled = false;

        async function loadMessages() {
            setLoading(true);
            try {
                const nextMessages = await getThreadMessages(threadId);
                if (!cancelled) {
                    setMessages(nextMessages as ChatMessage[]);
                }
                await markMessagesRead(threadId);
            } catch (_error) {
                if (!cancelled) {
                    toast.error("Could not load manager chat.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadMessages();

        return () => {
            cancelled = true;
        };
    }, [isOpen, threadId, canChat]);

    useEffect(() => {
        if (!isOpen) return;
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async (event: React.FormEvent) => {
        event.preventDefault();
        const content = draft.trim();
        if (!content || !threadId) return;

        startSending(async () => {
            const tempMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                content,
                senderId: 'me',
                senderName: 'You',
                createdAt: new Date(),
                isMe: true,
            };

            setMessages((current) => [...current, tempMessage]);
            setDraft('');

            const result = await sendMessage(threadId, content);
            if (!result.success) {
                setMessages((current) => current.filter((message) => message.id !== tempMessage.id));
                toast.error(result.error || "Message could not be sent.");
                return;
            }

            const refreshedMessages = await getThreadMessages(threadId);
            setMessages(refreshedMessages as ChatMessage[]);
            router.refresh();
        });
    };

    if (!candidate) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl overflow-hidden rounded-[34px] border-0 p-0 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.6)]">
                <DialogTitle className="sr-only">Chat with {managerName}</DialogTitle>
                <DialogDescription className="sr-only">
                    Creator to project manager conversation for {campaignTitle}.
                </DialogDescription>

                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_50%,#7c3aed_100%)] p-7 text-white">
                    <div className="pointer-events-none absolute right-[-30px] top-[-30px] h-44 w-44 rounded-full bg-white/10 blur-3xl" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full text-white/80 hover:bg-white/20"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-100">Manager Chat</p>
                            <h2 className="mt-1 text-2xl font-black tracking-tight">{managerName}</h2>
                            <p className="mt-1 text-sm text-slate-200">
                                Campaign: {campaignTitle}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6">
                    {!canChat ? (
                        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                <Star className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-xl font-black tracking-tight text-slate-950">Manager room is not open yet</h3>
                            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                                Creator chat unlocks after payment, acceptance, and manager thread setup. Refresh once if payment just completed.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Thread status</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-700">Project manager coordination room</p>
                                    </div>
                                    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                                        Live
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 h-[380px] overflow-y-auto rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4">
                                {loading ? (
                                    <div className="flex h-full items-center justify-center text-slate-400">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="max-w-sm text-center">
                                            <p className="text-base font-bold text-slate-900">No messages yet</p>
                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                Start the conversation with your project manager here.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[78%] rounded-[24px] px-4 py-3 shadow-sm ${
                                                        message.isMe
                                                            ? 'bg-[linear-gradient(135deg,#7c3aed_0%,#4f46e5_100%)] text-white'
                                                            : 'border border-slate-200 bg-white text-slate-900'
                                                    }`}
                                                >
                                                    {!message.isMe && (
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                                            {message.senderName}
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">{message.content}</p>
                                                    <p className={`mt-2 text-[11px] ${message.isMe ? 'text-violet-100' : 'text-slate-400'}`}>
                                                        {formatMessageTime(message.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={endRef} />
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSend} className="mt-4 flex gap-3">
                                <Input
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value)}
                                    placeholder={`Message ${managerName}...`}
                                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 focus:border-violet-500 focus:ring-violet-100"
                                />
                                <Button
                                    type="submit"
                                    disabled={!draft.trim() || isSending}
                                    className="h-12 rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#4f46e5_100%)] px-5 font-bold text-white shadow-lg shadow-violet-200/60 hover:opacity-95 disabled:opacity-50"
                                >
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
