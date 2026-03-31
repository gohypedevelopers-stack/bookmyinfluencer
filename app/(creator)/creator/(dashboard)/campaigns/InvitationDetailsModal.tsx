'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import {
    BriefcaseBusiness,
    CheckCircle2,
    Globe,
    MapPin,
    ShieldCheck,
    Sparkles,
    Users,
    X,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { respondToInvitation } from '@/app/(creator)/creator/actions';
import { useRouter } from 'next/navigation';

interface InvitationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invitation: any;
}

function formatPlatformLabel(value: unknown) {
    if (!value) return 'Multi-platform';
    if (Array.isArray(value)) return value.join(' | ');
    if (typeof value !== 'string') return String(value);

    const raw = value.trim();
    if (!raw) return 'Multi-platform';

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.join(' | ');
    } catch (_error) {
        // Keep fallback below.
    }

    return raw.replace(/[\[\]"]/g, '');
}

export default function InvitationDetailsModal({ isOpen, onClose, invitation }: InvitationDetailsModalProps) {
    const router = useRouter();
    const [busy, setBusy] = useState<null | 'ACCEPT' | 'DECLINE'>(null);

    if (!invitation) return null;

    const campaign = invitation.campaign;
    const brand = campaign.brand;
    const paymentPending = campaign.paymentStatus !== 'PAID';
    const platformLabel = formatPlatformLabel(campaign.platform);

    const handleAction = async (action: 'ACCEPT' | 'DECLINE') => {
        setBusy(action);
        const result = await respondToInvitation(invitation.id, action);
        if (result.success) {
            toast.success(action === 'ACCEPT' ? 'Request accepted' : 'Request declined');
            onClose();
            router.refresh();
        } else {
            toast.error(result.error || 'Unable to update invitation');
        }
        setBusy(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl overflow-hidden rounded-[34px] border-0 p-0 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.6)] [&>button]:hidden">
                <DialogTitle className="sr-only">{campaign.title}</DialogTitle>
                <DialogDescription className="sr-only">Review this campaign request from {brand.companyName}.</DialogDescription>

                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_50%,#7c3aed_100%)] px-8 pb-10 pt-8 text-white">
                    <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-52 w-52 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-[-70px] left-[-20px] h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />

                    <Button variant="ghost" size="icon" className="absolute right-5 top-5 rounded-full text-white/80 hover:bg-white/15" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>

                    <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-100">
                                <Sparkles className="h-4 w-4" />
                                Campaign Request
                            </div>
                            <h2 className="mt-5 text-4xl font-black tracking-tight">{campaign.title}</h2>
                            <p className="mt-3 text-base leading-7 text-slate-200">
                                Request from <span className="font-bold text-white">{brand.companyName}</span>. Project communication stays manager-led throughout the workflow.
                            </p>
                        </div>

                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-2xl font-black text-slate-950 shadow-xl shadow-slate-950/15">
                            {(brand.companyName || 'BR').slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8">
                    <div className="flex flex-wrap gap-2">
                        <DetailChip icon={BriefcaseBusiness} label={paymentPending ? 'Awaiting brand payment' : 'Payment confirmed'} />
                        <DetailChip icon={MapPin} label={campaign.location || 'Any location'} />
                        <DetailChip icon={Globe} label={platformLabel} />
                        <DetailChip icon={Users} label={campaign.niche || 'General niche'} />
                    </div>

                    {campaign.description && (
                        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Campaign Overview</p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{campaign.description}</p>
                        </div>
                    )}

                    {campaign.requirements && (
                        <div className="mt-5 rounded-[24px] border border-violet-100 bg-violet-50 p-5">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-500">Deliverable Notes</p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-violet-950">{campaign.requirements}</p>
                        </div>
                    )}

                    <div className="mt-5 rounded-[24px] border border-emerald-100 bg-emerald-50 p-5 text-sm leading-7 text-emerald-900">
                        <ShieldCheck className="mr-2 inline h-4 w-4" />
                        {paymentPending
                            ? 'Accept to reserve this request. Work starts after brand payment clears and the manager activates execution.'
                            : 'Accept to begin work. You will submit only the content link for manager review.'}
                    </div>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            className="h-12 flex-1 rounded-2xl border-red-200 text-red-700 hover:bg-red-50"
                            onClick={() => handleAction('DECLINE')}
                            disabled={busy !== null}
                        >
                            {busy === 'DECLINE' ? 'Declining...' : <><XCircle className="mr-2 h-4 w-4" />Decline</>}
                        </Button>
                        <Button
                            className="h-12 flex-1 rounded-2xl bg-[linear-gradient(135deg,#16a34a_0%,#16a34a_100%)] text-white shadow-lg shadow-emerald-200 hover:opacity-95"
                            onClick={() => handleAction('ACCEPT')}
                            disabled={busy !== null}
                        >
                            {busy === 'ACCEPT' ? 'Accepting...' : <><CheckCircle2 className="mr-2 h-4 w-4" />Accept Request</>}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailChip({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
            <Icon className="h-4 w-4 text-slate-400" />
            <span>{label}</span>
        </div>
    );
}
