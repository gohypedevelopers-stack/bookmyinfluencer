"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, ExternalLink, MessageSquareWarning, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { reviewCandidateSubmission } from "../../actions";

export default function ManagerCampaignDetailsClient({ campaign, auditLogs }: { campaign: any, auditLogs: any[] }) {
    const router = useRouter();
    const [busyId, setBusyId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

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
                                        {candidate.influencer?.niche || "General"} • {candidate.influencer?.location || "Any location"}
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

