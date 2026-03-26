"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, ExternalLink, MessageSquareWarning, RefreshCw, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { reviewCandidateSubmission, sendManagerBrandMessage, sendManagerCreatorMessage } from "../../actions";

type BrandConversationMessage = {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
};

export default function ManagerCampaignDetailsClient({
    campaign,
    auditLogs,
    brandConversation,
}: {
    campaign: any,
    auditLogs: any[],
    brandConversation: { threadId: string | null; messages: BrandConversationMessage[] }
}) {
    const router = useRouter();
    const [busyId, setBusyId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [activeChannel, setActiveChannel] = useState<"BRAND" | "INFLUENCER">("INFLUENCER");
    const [brandInput, setBrandInput] = useState("");
    const [sendingBrandMsg, setSendingBrandMsg] = useState(false);
    const [creatorInputs, setCreatorInputs] = useState<Record<string, string>>({});
    const [sendingCreatorId, setSendingCreatorId] = useState<string | null>(null);

    const submitted = useMemo(
        () => campaign.candidates.filter((candidate: any) => candidate.managerReviewStatus === "SUBMITTED"),
        [campaign.candidates]
    );

    const ready = useMemo(
        () => campaign.candidates.filter((candidate: any) => candidate.managerReviewStatus === "READY_FOR_BRAND_REVIEW"),
        [campaign.candidates]
    );

    const changesRequested = useMemo(
        () => campaign.candidates.filter((candidate: any) => candidate.managerReviewStatus === "CHANGES_REQUESTED"),
        [campaign.candidates]
    );

    const handleReview = async (candidateId: string, decision: "APPROVE" | "CHANGES_REQUESTED") => {
        setBusyId(candidateId);
        const result = await reviewCandidateSubmission(candidateId, decision, notes[candidateId]);
        if (result.success) {
            toast.success(decision === "APPROVE" ? "Submission approved" : "Changes requested");
            router.refresh();
        } else {
            toast.error((result as any).error || "Failed to update submission");
        }
        setBusyId(null);
    };

    const handleSendBrandMessage = async () => {
        const content = brandInput.trim();
        if (!content) return;

        setSendingBrandMsg(true);
        const result = await sendManagerBrandMessage(campaign.id, content);
        if (result.success) {
            setBrandInput("");
            toast.success("Message sent to brand");
            router.refresh();
        } else {
            toast.error((result as any).error || "Failed to send message");
        }
        setSendingBrandMsg(false);
    };

    const handleSendCreatorMessage = async (candidateId: string) => {
        const content = (creatorInputs[candidateId] || "").trim();
        if (!content) return;
        setSendingCreatorId(candidateId);
        const result = await sendManagerCreatorMessage(candidateId, content);
        if (result.success) {
            toast.success("Message sent to creator");
            setCreatorInputs((prev) => ({ ...prev, [candidateId]: "" }));
            router.refresh();
        } else {
            toast.error((result as any).error || "Failed to send creator message");
        }
        setSendingCreatorId(null);
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                    <p className="text-gray-500 mt-1">Brand: <span className="font-semibold text-gray-700">{campaign.brand.companyName}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {campaign.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-50 text-green-700 border border-green-100">
                        {campaign.paymentStatus}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-gray-200">
                    <p className="text-xs uppercase font-semibold text-gray-400">Pending Review</p>
                    <p className="text-2xl font-black text-gray-900">{submitted.length}</p>
                </Card>
                <Card className="p-4 border-gray-200">
                    <p className="text-xs uppercase font-semibold text-gray-400">Ready For Brand</p>
                    <p className="text-2xl font-black text-gray-900">{ready.length}</p>
                </Card>
                <Card className="p-4 border-gray-200">
                    <p className="text-xs uppercase font-semibold text-gray-400">Changes Requested</p>
                    <p className="text-2xl font-black text-gray-900">{changesRequested.length}</p>
                </Card>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <button
                    onClick={() => setActiveChannel("INFLUENCER")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${activeChannel === "INFLUENCER" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                    Influencer Channel
                </button>
                <button
                    onClick={() => setActiveChannel("BRAND")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${activeChannel === "BRAND" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                    Brand Channel
                </button>
            </div>

            {activeChannel === "BRAND" ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Brand Conversation</h2>
                    <Card className="p-4 border-gray-200 space-y-3">
                        <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                            {brandConversation?.messages?.length ? (
                                brandConversation.messages.map((message) => (
                                    <div key={message.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                                        <p className="text-[11px] font-bold text-gray-500">{message.senderName}</p>
                                        <p className="text-sm text-gray-800">{message.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No brand messages yet.</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Textarea
                                value={brandInput}
                                onChange={(event) => setBrandInput(event.target.value)}
                                placeholder="Share update with brand"
                                className="min-h-[70px]"
                            />
                            <Button
                                onClick={handleSendBrandMessage}
                                disabled={sendingBrandMsg || !brandInput.trim()}
                                className="self-end bg-gray-900 hover:bg-gray-800"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Send
                            </Button>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Creator Submissions</h2>
                    {campaign.candidates.length === 0 ? (
                        <Card className="p-8 text-center text-gray-500">No creators assigned yet.</Card>
                    ) : (
                        campaign.candidates.map((candidate: any) => (
                            <Card key={candidate.id} className="p-5 border-gray-200 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{candidate.influencer?.user?.name || "Creator"}</h3>
                                        <p className="text-xs text-gray-500">
                                            {candidate.influencer?.niche || "General"} - {candidate.influencer?.location || "Any location"}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 uppercase">
                                        {candidate.managerReviewStatus?.replaceAll("_", " ")}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-semibold">Followers:</span> {Number(candidate.influencer?.followers || 0).toLocaleString()}</p>
                                    <p><span className="font-semibold">Engagement:</span> {Number(candidate.influencer?.engagementRate || 0).toFixed(1)}%</p>
                                </div>

                                {candidate.contentSubmissionUrl ? (
                                    <a
                                        href={candidate.contentSubmissionUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        View submitted content
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                ) : (
                                    <div className="inline-flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                                        <Clock3 className="w-4 h-4" />
                                        Waiting for creator submission
                                    </div>
                                )}

                                {candidate.managerReviewStatus === "CHANGES_REQUESTED" && candidate.managerReviewNotes && (
                                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                        <MessageSquareWarning className="w-3.5 h-3.5 inline mr-1" />
                                        {candidate.managerReviewNotes}
                                    </div>
                                )}

                                <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Influencer Chat</p>
                                    {candidate.chatThread?.messages?.length ? (
                                        <div className="space-y-1 max-h-28 overflow-y-auto">
                                            {candidate.chatThread.messages.slice(0, 3).map((message: any) => (
                                                <div key={message.id} className="text-xs rounded-lg border border-gray-200 bg-white px-2 py-1.5">
                                                    <span className="font-semibold text-gray-700">{message.sender?.name || "User"}:</span> {message.content}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500">No creator messages yet.</p>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            value={creatorInputs[candidate.id] || ""}
                                            onChange={(event) => setCreatorInputs((prev) => ({ ...prev, [candidate.id]: event.target.value }))}
                                            placeholder="Send update to creator"
                                            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                        <Button
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                            onClick={() => handleSendCreatorMessage(candidate.id)}
                                            disabled={sendingCreatorId === candidate.id || !(creatorInputs[candidate.id] || "").trim()}
                                        >
                                            <Send className="w-3.5 h-3.5 mr-1" />
                                            Send
                                        </Button>
                                    </div>
                                </div>

                                {candidate.managerReviewStatus === "SUBMITTED" && (
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Optional feedback for creator"
                                            value={notes[candidate.id] || ""}
                                            onChange={(event) => setNotes((prev) => ({ ...prev, [candidate.id]: event.target.value }))}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="border-amber-200 text-amber-700 hover:bg-amber-50"
                                                onClick={() => handleReview(candidate.id, "CHANGES_REQUESTED")}
                                                disabled={busyId === candidate.id}
                                            >
                                                <ShieldAlert className="w-4 h-4 mr-2" />
                                                Request Changes
                                            </Button>
                                            <Button
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleReview(candidate.id, "APPROVE")}
                                                disabled={busyId === candidate.id}
                                            >
                                                {busyId === candidate.id ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                                Approve Submission
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <Card className="p-0 overflow-hidden border-gray-200">
                    <div className="divide-y divide-gray-100">
                        {auditLogs && auditLogs.length > 0 ? (
                            auditLogs.map((log: any) => (
                                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <p className="font-bold text-gray-900 text-sm">{String(log.action || "").replace(/_/g, " ")}</p>
                                    <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(log.createdAt).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-400 italic text-sm">No recent activity logged.</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
