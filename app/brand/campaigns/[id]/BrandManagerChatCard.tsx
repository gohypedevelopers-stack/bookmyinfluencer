'use client';

import { useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, SendHorizontal, ShieldCheck, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
    compact?: boolean;
};

export default function BrandManagerChatCard({
    campaignId,
    currentUserId,
    managerName,
    locked,
    initialMessages,
    compact = false,
}: BrandManagerChatCardProps) {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
    const [isPending, startTransition] = useTransition();
    const initials = managerName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "PM";

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

    const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const formatMessageTime = (createdAt: string) =>
        new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
        }).format(new Date(createdAt));

    return (
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
            <div className="pointer-events-none absolute left-0 top-0 h-48 w-48 rounded-full bg-cyan-100/70 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full bg-indigo-100/70 blur-3xl" />

            <div className="relative border-b border-slate-100 px-6 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_100%)] text-lg font-black text-white shadow-lg shadow-blue-200/60">
                            {initials}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-2xl font-black tracking-tight text-slate-950">Project Manager Chat</h3>
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Manager-Led
                                </span>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm text-slate-500">
                                {compact
                                    ? "Latest campaign updates stay here so the brand can respond fast."
                                    : "All campaign coordination stays routed through the manager. Direct brand-creator chat remains disabled to keep execution structured."}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Primary Contact</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{managerName}</p>
                    </div>
                </div>

                {!compact && (
                    <div className="mt-5 rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Structured communication lane</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Share approvals, feedback, creative asks, and deadlines here. The manager coordinates the creator side separately.
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                High Signal Updates
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {locked ? (
                <div className="relative px-6 py-6">
                    <div className="rounded-[28px] border border-amber-200 bg-[linear-gradient(135deg,#fffaf0_0%,#fffbeb_48%,#fef3c7_100%)] p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-amber-950">Unlock manager chat after payment</h4>
                                    <p className="mt-2 max-w-2xl text-sm text-amber-800">
                                        This conversation opens once campaign payment is completed. That keeps execution, creator coordination, and delivery timelines tied to a funded workflow.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={`/brand/campaigns/${campaignId}/payment`}
                                className="inline-flex h-11 items-center justify-center rounded-full bg-amber-500 px-5 text-sm font-bold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600"
                            >
                                Complete Payment
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`grid gap-6 px-6 py-6 ${compact ? '' : 'lg:grid-cols-[minmax(0,1fr)_320px]'}`}>
                    <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-inner shadow-slate-100/70">
                        <div className={`${compact ? 'max-h-[520px]' : 'max-h-[460px]'} space-y-4 overflow-y-auto pr-1`}>
                            {messages.length === 0 ? (
                                <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                                    <div className="max-w-sm">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                                            <SendHorizontal className="h-6 w-6" />
                                        </div>
                                        <h4 className="mt-4 text-xl font-black text-slate-950">Start the execution thread</h4>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Share your latest brief, approval note, deadline, or revision request. The manager will handle the creator coordination from here.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isMine = message.senderId === currentUserId;

                                    return (
                                        <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                            <div className={`flex max-w-[88%] flex-col ${isMine ? "items-end" : "items-start"}`}>
                                                {!isMine && (
                                                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                                                            {initials}
                                                        </span>
                                                        {message.senderName || managerName}
                                                    </div>
                                                )}

                                                <div
                                                    className={`rounded-[24px] px-4 py-3 shadow-sm ${isMine
                                                        ? "bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_100%)] text-white"
                                                        : "border border-slate-200 bg-white text-slate-800"
                                                        }`}
                                                >
                                                    <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                                                </div>

                                                <p className={`mt-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isMine ? "text-blue-500" : "text-slate-400"}`}>
                                                    {formatMessageTime(message.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {!compact && (
                            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-200/40">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Workflow Guardrails</p>
                                <div className="mt-4 space-y-3 text-sm text-slate-200">
                                    <p>Approvals, feedback, and timeline shifts should be posted here so the manager can track them against campaign progress.</p>
                                    <p>Keep asks specific: deliverable, creator, revision, due date, and any must-follow brand note.</p>
                                    <p>Use this thread for decisions, not scattered follow-ups. It keeps execution clean and auditable.</p>
                                </div>
                            </div>
                        )}

                        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Send Update</p>
                            <Textarea
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={handleComposerKeyDown}
                                placeholder={`Message ${managerName} with approvals, revisions, or timing updates...`}
                                className={`mt-4 ${compact ? 'min-h-[120px]' : 'min-h-[140px]'} rounded-[22px] border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-inner shadow-slate-100 focus-visible:ring-2 focus-visible:ring-blue-300`}
                            />
                            <div className="mt-4 flex items-center justify-between gap-3">
                                <p className="text-xs font-medium text-slate-400">{compact ? 'Fast updates to manager.' : 'Press Enter to send. Shift + Enter for a new line.'}</p>
                                <button
                                    onClick={sendMessage}
                                    disabled={isPending || !input.trim()}
                                    className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <SendHorizontal className="h-4 w-4" />
                                    {isPending ? "Sending..." : "Send Update"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
