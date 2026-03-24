'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import { Briefcase, CheckCircle2, Globe, MapPin, ShieldCheck, Users, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { respondToInvitation } from '@/app/(creator)/creator/actions';
import { useRouter } from 'next/navigation';

interface InvitationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invitation: any;
}

export default function InvitationDetailsModal({ isOpen, onClose, invitation }: InvitationDetailsModalProps) {
    const router = useRouter();
    const [busy, setBusy] = useState<null | 'ACCEPT' | 'DECLINE'>(null);

    if (!invitation) return null;

    const campaign = invitation.campaign;
    const brand = campaign.brand;

    const handleAction = async (action: 'ACCEPT' | 'DECLINE') => {
        setBusy(action);
        const result = await respondToInvitation(invitation.id, action);
        if (result.success) {
            toast.success(action === 'ACCEPT' ? 'Invitation accepted' : 'Invitation declined');
            onClose();
            router.refresh();
        } else {
            toast.error(result.error || 'Unable to update invitation');
        }
        setBusy(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 rounded-3xl border-0 overflow-hidden [&>button]:hidden">
                <DialogTitle className="sr-only">{campaign.title}</DialogTitle>
                <DialogDescription className="sr-only">Review this campaign invitation.</DialogDescription>

                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="px-8 pb-8 -mt-10">
                    <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center font-bold text-lg mb-4">
                        {brand.companyName?.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">{campaign.title}</h2>
                        <p className="text-sm text-gray-600">
                            Invitation from <span className="font-semibold">{brand.companyName}</span>. Communication and execution are handled by the internal project manager.
                        </p>

                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                Upfront payment confirmed
                            </span>
                            {campaign.location && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
                                    <MapPin className="w-4 h-4 text-rose-500" />
                                    {campaign.location}
                                </span>
                            )}
                            {campaign.platform && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
                                    <Globe className="w-4 h-4 text-indigo-500" />
                                    {campaign.platform}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
                                <Users className="w-4 h-4 text-emerald-600" />
                                {campaign.niche || 'General niche'}
                            </span>
                        </div>

                        {campaign.description && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                                {campaign.description}
                            </div>
                        )}

                        {campaign.requirements && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900 whitespace-pre-wrap">
                                <p className="font-semibold mb-1">Deliverable notes</p>
                                {campaign.requirements}
                            </div>
                        )}

                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Accept to start creation. You will submit only the content link for manager review.
                        </div>

                        <div className="pt-2 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => handleAction('DECLINE')}
                                disabled={busy !== null}
                            >
                                {busy === 'DECLINE' ? 'Declining...' : <><XCircle className="w-4 h-4 mr-2" />Decline</>}
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleAction('ACCEPT')}
                                disabled={busy !== null}
                            >
                                {busy === 'ACCEPT' ? 'Accepting...' : <><CheckCircle2 className="w-4 h-4 mr-2" />Accept</>}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

