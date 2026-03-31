'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    X,
    Upload,
    Link as LinkIcon,
    FileText,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SubmitDeliverableModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: any;
    onSubmit: (candidateId: string, url: string, notes: string) => Promise<any>;
}

export default function SubmitDeliverableModal({ isOpen, onClose, candidate, onSubmit }: SubmitDeliverableModalProps) {
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!candidate) return null;

    const hasSubmission = Boolean(candidate?.contentSubmissionUrl);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            toast.error("Link Required", {
                description: "Please provide a valid URL to your content."
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(candidate.id, url, notes);
            toast.success("Deliverable Submitted!", {
                description: "The manager has been notified and will review your submission shortly."
            });
            onClose();
        } catch (error) {
            toast.error("Submission Failed", {
                description: "Please try again later."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl overflow-hidden rounded-[34px] border-0 p-0 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.6)]">
                <DialogTitle className="sr-only">Submit deliverable for {candidate?.campaign?.title || "campaign"}</DialogTitle>
                <DialogDescription className="sr-only">
                    Share the final content link and optional notes for manager review.
                </DialogDescription>
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_50%,#7c3aed_100%)] p-7 text-white">
                    <div className="pointer-events-none absolute right-[-30px] top-[-30px] h-44 w-44 rounded-full bg-white/10 blur-3xl" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full text-white/80 hover:bg-white/20"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                            <Upload className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Submit Deliverable</h2>
                            <p className="mt-1 text-sm text-slate-200">Share one clean link for manager review and final approval.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-7">
                    <div className="mb-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Manager Submission</h3>
                        </div>
                        <p className="text-sm leading-6 text-slate-600">
                            Share the final content URL for manager review. Direct brand messaging is disabled in this workflow.
                        </p>
                        {hasSubmission && (
                            <p className="mt-3 text-xs font-semibold text-indigo-600">
                                Existing submission will be replaced by this new link.
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="url" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <LinkIcon className="h-4 w-4 text-slate-400" />
                                Content Link <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="url"
                                placeholder="https://instagram.com/p/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 focus:border-indigo-500 focus:ring-indigo-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm font-bold text-slate-700">
                                Additional Notes <span className="font-normal text-slate-400">(Optional)</span>
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Any context about this submission..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[120px] resize-none rounded-[24px] border-slate-200 bg-slate-50 px-4 py-4 focus:border-indigo-500 focus:ring-indigo-100"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="h-12 rounded-2xl border-slate-200 px-6 font-bold">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !url.trim()}
                                className="h-12 rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#4f46e5_100%)] px-8 font-bold text-white shadow-lg shadow-violet-200/60 hover:opacity-95 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit for Review
                                        <CheckCircle2 className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

