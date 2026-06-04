'use client';

import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    ArrowUpRight,
    BriefcaseBusiness,
    CheckCircle2,
    ClipboardCheck,
    FileUp,
    Inbox,
    MapPin,
    MessageSquareMore,
    Sparkles,
    ShieldCheck,
    Users,
    Workflow,
} from "lucide-react";
import { submitDeliverable } from '../../actions';
import InvitationDetailsModal from './InvitationDetailsModal';
import ManagerChatModal from './ManagerChatModal';
import SubmitDeliverableModal from './SubmitDeliverableModal';

interface CreatorCampaignsClientProps {
    candidates: any[];
    followerCount: number;
}

function formatPlatformLabel(value: unknown) {
    if (!value) return 'Multi-platform';
    if (Array.isArray(value)) return value.join(' | ');
    if (typeof value !== 'string') return String(value);

    const raw = value.trim();
    if (!raw) return 'Multi-platform';

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.join(' | ');
        }
    } catch (_error) {
        // Keep raw string fallback.
    }

    return raw.replace(/[\[\]"]/g, '');
}

function formatManagerStatus(value: string | null | undefined) {
    if (!value) return 'Pending';
    return value.replaceAll('_', ' ').toLowerCase();
}

function getEmptyIcon(tab: 'INVITATIONS' | 'ACTIVE' | 'COMPLETED') {
    if (tab === 'INVITATIONS') return Inbox;
    if (tab === 'ACTIVE') return ClipboardCheck;
    return CheckCircle2;
}

function getTabDescription(tab: 'INVITATIONS' | 'ACTIVE' | 'COMPLETED') {
    if (tab === 'INVITATIONS') return 'Fresh requests from brands and project managers will appear here.';
    if (tab === 'ACTIVE') return 'Accepted work in progress, submissions, and manager review live here.';
    return 'Completed work and ready-for-brand-review items collect here.';
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15
        }
    }
};

export default function CreatorCampaignsClient({ candidates, followerCount }: CreatorCampaignsClientProps) {
    const [selectedTab, setSelectedTab] = useState<'INVITATIONS' | 'ACTIVE' | 'COMPLETED'>('INVITATIONS');
    const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
    const [submitCandidate, setSubmitCandidate] = useState<any>(null);
    const [chatCandidate, setChatCandidate] = useState<any>(null);

    const invitations = useMemo(
        () => candidates.filter((candidate) => candidate.creatorDecision === 'PENDING'),
        [candidates]
    );
    const active = useMemo(
        () =>
            candidates.filter(
                (candidate) =>
                    candidate.creatorDecision === 'ACCEPTED' &&
                    candidate.managerReviewStatus !== 'READY_FOR_BRAND_REVIEW'
            ),
        [candidates]
    );
    const completed = useMemo(
        () =>
            candidates.filter(
                (candidate) =>
                    candidate.managerReviewStatus === 'READY_FOR_BRAND_REVIEW' ||
                    candidate.status === 'COMPLETED'
            ),
        [candidates]
    );

    const list = selectedTab === 'INVITATIONS' ? invitations : selectedTab === 'ACTIVE' ? active : completed;

    const onSubmitDeliverable = async (candidateId: string, url: string, notes: string) => {
        return submitDeliverable(candidateId, url, notes);
    };

    const stats = [
        {
            label: 'Invitations',
            value: invitations.length,
            note: invitations.length > 0 ? 'Requests waiting for your response' : 'No new requests right now',
            tone: 'from-violet-500/18 via-fuchsia-500/10 to-white',
            iconWrap: 'bg-violet-500/12 text-violet-600',
            icon: Inbox,
        },
        {
            label: 'Active',
            value: active.length,
            note: active.length > 0 ? 'Accepted campaigns in motion' : 'Accepted work will show here',
            tone: 'from-sky-500/18 via-cyan-500/10 to-white',
            iconWrap: 'bg-sky-500/12 text-sky-600',
            icon: Workflow,
        },
        {
            label: 'Completed',
            value: completed.length,
            note: completed.length > 0 ? 'Finished work and review-ready items' : 'Completed campaigns collect here',
            tone: 'from-emerald-500/18 via-teal-500/10 to-white',
            iconWrap: 'bg-emerald-500/12 text-emerald-600',
            icon: CheckCircle2,
        },
    ];

    return (
        <div className="min-h-full px-6 py-8">
            <div className="mx-auto max-w-[1400px]">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 85, damping: 15 }}
                    className="group relative overflow-hidden rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_48%,#7c3aed_100%)] p-7 text-white shadow-[0_35px_90px_-45px_rgba(79,70,229,0.75)]"
                >
                    <div className="pointer-events-none absolute right-[-40px] top-[-60px] h-56 w-56 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-110" />
                    <div className="pointer-events-none absolute bottom-[-70px] left-[-30px] h-52 w-52 rounded-full bg-fuchsia-400/15 blur-3xl transition-transform duration-500 group-hover:scale-110" />
                    
                    {/* Shimmer line */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-100 transition-all duration-300 hover:bg-white/15">
                                <Sparkles className="h-4 w-4 text-violet-300 animate-pulse" />
                                Creator Workflow
                            </div>
                            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Campaign requests, submissions, and review flow</h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                                A cleaner queue for manager-led work. Review requests fast, submit links cleanly, and keep every campaign state obvious.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                            <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/15">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200">Follower Base</p>
                                <p className="mt-2 text-3xl font-black tracking-tight">{new Intl.NumberFormat('en-IN').format(followerCount || 0)}</p>
                            </div>
                            <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/15">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200">Queue Depth</p>
                                <p className="mt-2 text-3xl font-black tracking-tight">{candidates.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* KPI Metrics Stats Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="mt-8 grid gap-5 md:grid-cols-3"
                >
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                variants={itemVariants}
                                whileHover={{
                                    y: -6,
                                    boxShadow: "0 30px 60px -20px rgba(15, 23, 42, 0.15)",
                                    borderColor: "rgba(124, 58, 237, 0.18)"
                                }}
                                className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.92)),linear-gradient(135deg,var(--tw-gradient-stops))] ${stat.tone} p-6 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.35)] transition-all duration-300`}
                            >
                                {/* Soft glow accent */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconWrap} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-md`}>
                                    <Icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{stat.value}</p>
                                <p className="mt-3 text-sm leading-6 text-slate-500 transition-colors duration-300 group-hover:text-slate-600">{stat.note}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Sliding Pill Tab Switcher */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, type: "spring", stiffness: 100, damping: 15 }}
                    className="mt-8 rounded-[32px] border border-white/80 bg-white/90 p-3 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.3)] backdrop-blur-md"
                >
                    <div className="flex flex-wrap gap-2 relative">
                        {[
                            { key: 'INVITATIONS', label: `Invitations`, count: invitations.length },
                            { key: 'ACTIVE', label: `Active`, count: active.length },
                            { key: 'COMPLETED', label: `Completed`, count: completed.length },
                        ].map((tab) => {
                            const isActive = selectedTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setSelectedTab(tab.key as any)}
                                    className="relative rounded-2xl px-6 py-3.5 text-sm font-bold transition-all duration-300 ease-out focus:outline-none"
                                    style={{
                                        WebkitTapHighlightColor: 'transparent',
                                    }}
                                >
                                    {/* Bouncy Spring Pill Sliding Background */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeCampaignTab"
                                            className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#4f46e5_100%)] shadow-lg shadow-violet-200/80"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <span className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${
                                        isActive ? 'text-white' : 'text-slate-500 hover:text-slate-950'
                                    }`}>
                                        {tab.label}
                                        <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors duration-300 ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Campaign Grid & List */}
                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        {list.length === 0 ? (
                            <motion.div
                                key={`empty-${selectedTab}`}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.22, ease: "easeInOut" }}
                            >
                                <Card className="relative overflow-hidden rounded-[32px] border border-dashed border-slate-300 bg-white/90 p-12 text-center shadow-[0_24px_50px_-40px_rgba(15,23,42,0.25)] group">
                                    <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-slate-50/50 blur-xl pointer-events-none" />
                                    <div className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-slate-50/50 blur-xl pointer-events-none" />

                                    {/* Animated floating/pulse icon wrap */}
                                    <motion.div 
                                        animate={{ 
                                            y: [-4, 4, -4],
                                            boxShadow: [
                                                "0 10px 25px -5px rgba(124, 58, 237, 0.08)",
                                                "0 15px 30px -5px rgba(124, 58, 237, 0.14)",
                                                "0 10px 25px -5px rgba(124, 58, 237, 0.08)"
                                            ]
                                        }}
                                        transition={{ 
                                            repeat: Infinity, 
                                            duration: 3.2, 
                                            ease: "easeInOut" 
                                        }}
                                        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 border border-violet-100 shadow-md"
                                    >
                                        {(() => {
                                            const Icon = getEmptyIcon(selectedTab);
                                            return <Icon className="h-7 w-7 text-violet-600" />;
                                        })()}
                                    </motion.div>
                                    <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-950">Nothing in {selectedTab.toLowerCase()} right now</h3>
                                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">{getTabDescription(selectedTab)}</p>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`list-${selectedTab}`}
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                exit="hidden"
                                className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3"
                            >
                                {list.map((candidate) => {
                                    const platformLabel = formatPlatformLabel(candidate.campaign.platform);
                                    const managerStatus = formatManagerStatus(candidate.managerReviewStatus);
                                    const paymentPending = candidate.campaign.paymentStatus !== 'PAID';
                                    const chatReady =
                                        candidate.creatorDecision === 'ACCEPTED' &&
                                        candidate.campaign.paymentStatus === 'PAID' &&
                                        candidate.chatThread?.id;

                                    return (
                                        <motion.div
                                            key={candidate.id}
                                            variants={itemVariants}
                                            whileHover={{
                                                y: -5,
                                                boxShadow: "0 30px 60px -25px rgba(15, 23, 42, 0.18)",
                                                borderColor: "rgba(124, 58, 237, 0.15)"
                                            }}
                                            className="flex flex-col h-full overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-[0_28px_60px_-42px_rgba(15, 23, 42, 0.35)] transition-all duration-300"
                                        >
                                            {/* Header Section inside Card */}
                                            <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#f8fbff_0%,#f8fafc_42%,#eef2ff_100%)] p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 gap-4">
                                                        {candidate.campaign.brand.user?.image ? (
                                                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_8px_16px_-6px_rgba(15,23,42,0.1)] transition-transform duration-300 hover:scale-105">
                                                                <img
                                                                    src={candidate.campaign.brand.user.image}
                                                                    alt={candidate.campaign.brand.companyName}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#4f46e5_100%)] text-lg font-black text-white shadow-[0_18px_32px_-18px_rgba(79,70,229,0.65)] transition-transform duration-300 hover:scale-105">
                                                                {(candidate.campaign.brand.companyName || 'BR').slice(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{candidate.campaign.brand.companyName}</p>
                                                            <h3 className="mt-2 line-clamp-2 text-2xl font-black tracking-tight text-slate-950 leading-tight">{candidate.campaign.title}</h3>
                                                        </div>
                                                    </div>
                                                    <span className="shrink-0 rounded-full border border-violet-200 bg-violet-50/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-700">
                                                        {managerStatus}
                                                    </span>
                                                </div>

                                                <div className="mt-5 flex flex-wrap gap-2">
                                                    <MetaChip icon={BriefcaseBusiness} label={paymentPending ? 'Awaiting payment' : 'Paid and active'} />
                                                    <MetaChip icon={MapPin} label={candidate.campaign.location || 'Any location'} />
                                                    <MetaChip icon={Users} label={platformLabel} />
                                                </div>
                                            </div>

                                            {/* Body & Actions Section inside Card */}
                                            <div className="p-5 flex flex-col justify-between flex-grow">
                                                <div className="space-y-4">
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <InfoTile label="Niche" value={candidate.campaign.niche || 'General'} />
                                                        <InfoTile label="Manager" value={candidate.campaign.assignment?.manager?.name || 'Assigned internally'} />
                                                    </div>

                                                    {paymentPending && (
                                                        <div className="rounded-[22px] border border-amber-200 bg-amber-50/50 p-4 text-xs leading-5 text-amber-800 font-medium">
                                                            Brand shortlisted you. Accept now to reserve your spot. Work starts after brand payment clears.
                                                        </div>
                                                    )}

                                                    {candidate.chatThread?.messages?.[0]?.content && (
                                                        <div className="rounded-[22px] border border-indigo-100 bg-indigo-50/50 p-4">
                                                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500 flex items-center gap-1.5">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                                Latest manager update
                                                            </p>
                                                            <p className="mt-2 text-xs leading-5 text-indigo-900 font-medium line-clamp-2">{candidate.chatThread.messages[0].content}</p>
                                                        </div>
                                                    )}

                                                    {candidate.managerReviewStatus === 'CHANGES_REQUESTED' && (
                                                        <div className="rounded-[22px] border border-amber-200 bg-amber-50/50 p-4 text-xs leading-5 text-amber-800 font-medium">
                                                            <ShieldCheck className="mr-2 inline h-4 w-4 text-amber-600 align-text-bottom" />
                                                            {candidate.managerReviewNotes || 'Changes requested. Please revise and resubmit.'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-slate-100">
                                                    {selectedTab === 'INVITATIONS' && (
                                                        <Button
                                                            className="group relative h-12 w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#4f46e5_100%)] text-white shadow-lg shadow-violet-200/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-violet-300/90 font-bold text-sm"
                                                            onClick={() => setSelectedInvitation(candidate)}
                                                        >
                                                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                                                            <span className="relative z-10 flex items-center justify-center gap-1.5">
                                                                Review Request
                                                                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
                                                            </span>
                                                        </Button>
                                                    )}
                                                    {selectedTab === 'ACTIVE' && (
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {chatReady ? (
                                                                <Button
                                                                    variant="outline"
                                                                    className="group h-12 rounded-2xl border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-bold text-xs"
                                                                    onClick={() => setChatCandidate(candidate)}
                                                                >
                                                                    <MessageSquareMore className="mr-2 h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:rotate-12 group-hover:text-indigo-600" />
                                                                    Message Manager
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    disabled
                                                                    className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 text-slate-400 font-medium text-[11px]"
                                                                >
                                                                    <MessageSquareMore className="mr-1.5 h-3.5 w-3.5 text-slate-300" />
                                                                    Chat unlocks after payment
                                                                </Button>
                                                            )}
                                                            <Button
                                                                className="group h-12 rounded-2xl bg-slate-950 text-white shadow-md shadow-slate-200 hover:bg-slate-900 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-bold text-xs"
                                                                onClick={() => setSubmitCandidate(candidate)}
                                                            >
                                                                <FileUp className="mr-2 h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-white" />
                                                                Submit Link
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {selectedTab === 'COMPLETED' && (
                                                        <Button className="h-12 w-full rounded-2xl border-slate-100 bg-slate-50 text-slate-400 font-bold text-sm cursor-not-allowed" variant="outline" disabled>
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                                            Ready for brand review
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <InvitationDetailsModal
                isOpen={!!selectedInvitation}
                invitation={selectedInvitation}
                onClose={() => setSelectedInvitation(null)}
            />

            <SubmitDeliverableModal
                isOpen={!!submitCandidate}
                candidate={submitCandidate}
                onClose={() => setSubmitCandidate(null)}
                onSubmit={onSubmitDeliverable}
            />

            <ManagerChatModal
                isOpen={!!chatCandidate}
                candidate={chatCandidate}
                onClose={() => setChatCandidate(null)}
            />
        </div>
    );
}

function MetaChip({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-bold text-slate-600 transition-all duration-300 hover:border-violet-200 hover:bg-white hover:text-slate-900 shadow-sm">
            <Icon className="h-3.5 w-3.5 text-slate-400 transition-colors duration-300 hover:text-violet-500" />
            <span>{label}</span>
        </div>
    );
}

function InfoTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[22px] border border-slate-200/60 bg-slate-50/50 p-4 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300/80 hover:shadow-inner">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-1.5 text-sm font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    );
}
