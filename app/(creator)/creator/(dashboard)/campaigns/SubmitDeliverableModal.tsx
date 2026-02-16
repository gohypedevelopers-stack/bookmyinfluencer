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

    // Find pending deliverable or default to first one
    const deliverable = candidate.contract?.deliverables?.find((d: any) => d.status === 'PENDING')
        || candidate.contract?.deliverables?.[0];

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
            <DialogContent className="max-w-xl p-0 rounded-3xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 text-white/80 hover:bg-white/20 rounded-full"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Upload className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold">Submit Deliverable</h2>
                    </div>
                    <p className="text-white/80 text-sm ml-11">
                        Upload your content URL for review by the campaign manager.
                    </p>
                </div>

                <div className="p-6">
                    {deliverable ? (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-indigo-600" />
                                <h3 className="font-bold text-gray-900 text-sm">Required Deliverable</h3>
                            </div>
                            <p className="text-sm text-gray-600">{deliverable.title}</p>
                            {deliverable.description && (
                                <p className="text-xs text-gray-500 mt-1">{deliverable.description}</p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-sm text-amber-800">
                            No active deliverables found for this contract, but you can still submit a general update.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-gray-400" />
                                Content Link <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="url"
                                placeholder="https://instagram.com/p/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm font-bold text-gray-700">
                                Additional Notes <span className="text-gray-400 font-normal">(Optional)</span>
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Any context about this submission..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[100px] rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 resize-none"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose} className="border-gray-200 font-bold rounded-xl h-11 px-6">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !url.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-indigo-200 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
