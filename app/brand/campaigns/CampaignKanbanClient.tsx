'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    LayoutDashboard,
    Search,
    Plus,
    Settings,
    Bell,
    Filter,
    Kanban,
    List,
    MoreHorizontal,
    GalleryVerticalEnd,
    Video,
    Timer,
    Youtube,
    Tv,
    FileSearch,
    CheckCircle2,
    ChevronDown,
    X,
    MessageCircle
} from 'lucide-react';
import { CampaignCandidate, InfluencerProfile, User, CandidateStatus, Offer } from '@prisma/client';
import { updateCandidateStatus } from '../actions';

type CandidateWithDetails = CampaignCandidate & {
    influencer: InfluencerProfile & { user: User };
    offer: Offer | null;
};

interface CampaignKanbanClientProps {
    candidates: CandidateWithDetails[];
}

const STATUS_COLUMNS = [
    { id: 'CONTACTED', title: 'Contacted', color: 'text-gray-500', borderColor: 'border-transparent' },
    { id: 'IN_NEGOTIATION', title: 'In Negotiation', color: 'text-orange-600', borderColor: 'border-orange-100' },
    { id: 'HIRED', title: 'Hired/Paid', color: 'text-teal-600', borderColor: 'border-teal-100' },
    { id: 'CONTENT_REVIEW', title: 'Content Review', color: 'text-purple-600', borderColor: 'border-purple-100' },
    { id: 'COMPLETED', title: 'Completed', color: 'text-green-600', borderColor: 'border-green-100' }
];

export default function CampaignKanbanClient({ candidates }: CampaignKanbanClientProps) {

    // Group candidates by status
    const getCandidatesByStatus = (status: string) => {
        return candidates.filter(c => c.status === status);
    };

    const handleStatusMove = async (id: string, currentStatus: string) => {
        const statuses = STATUS_COLUMNS.map(c => c.id);
        const currentIndex = statuses.indexOf(currentStatus);
        if (currentIndex < statuses.length - 1) {
            const nextStatus = statuses[currentIndex + 1];
            await updateCandidateStatus(id, nextStatus as CandidateStatus);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
            {/* Top Header */}
            <header className="flex-none flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 z-20">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold leading-tight">Campaign Manager</h2>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex w-96 h-10">
                        <div className="flex w-full items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 ring-teal-500/50 transition-all">
                            <div className="text-teal-600 pl-4">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm placeholder-gray-400 text-gray-900"
                                placeholder="Search influencers, campaigns..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex gap-3">
                        <Link href="/brand/campaigns/new">
                            <button className="flex items-center justify-center gap-2 h-10 px-4 bg-teal-600 text-white hover:bg-teal-700 transition-colors text-sm font-bold rounded-xl shadow-lg shadow-teal-600/20">
                                <Plus className="w-5 h-5" />
                                Create Campaign
                            </button>
                        </Link>
                        <button className="hidden lg:flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-700">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button className="hidden lg:flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-700">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div className="w-10 h-10 rounded-xl border-2 border-teal-600 overflow-hidden cursor-pointer">
                        <Image
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
                            alt="Profile"
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Filters Toolbar */}
                <div className="px-8 py-4 flex-none border-b border-gray-200 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-3 flex-wrap">
                            <button className="flex h-9 items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 hover:border-teal-200 transition-colors pl-4 pr-3 text-sm font-medium text-gray-700">
                                Category: All
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button className="flex h-9 items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 hover:border-teal-200 transition-colors pl-4 pr-3 text-sm font-medium text-gray-700">
                                Budget: Any
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button className="flex h-9 items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 hover:border-teal-200 transition-colors pl-4 pr-3 text-sm font-medium text-gray-700">
                                Platform: Instagram
                                <X className="w-4 h-4" />
                            </button>
                            <div className="h-9 w-px bg-gray-200 mx-1"></div>
                            <button className="flex h-9 items-center gap-2 rounded-lg text-teal-600 hover:bg-teal-50 pl-3 pr-3 transition-colors text-sm font-medium">
                                <Filter className="w-4 h-4" />
                                More Filters
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                            <button className="p-1.5 rounded bg-white shadow-sm text-teal-600">
                                <Kanban className="w-5 h-5" />
                            </button>
                            <button className="p-1.5 rounded text-gray-400 hover:text-gray-600 transition-colors">
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Kanban Board Container */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-gray-50">
                    <div className="flex h-full gap-6 min-w-max pb-4">
                        {STATUS_COLUMNS.map((column) => {
                            const columnCards = getCandidatesByStatus(column.id);
                            return (
                                <div key={column.id} className="flex flex-col w-[340px] h-full rounded-2xl bg-gray-100 border border-transparent">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between p-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-extrabold text-gray-900">{column.title}</h3>
                                            <span className={`flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-bold rounded-full bg-white border border-gray-200 ${column.color}`}>
                                                {columnCards.length}
                                            </span>
                                        </div>
                                        <button className="text-gray-400 hover:text-teal-600 transition-colors">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Column Content */}
                                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                                        {columnCards.map((card) => (
                                            <div
                                                key={card.id}
                                                className="group relative flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border-l-4 border-l-transparent hover:border-l-teal-600 cursor-grab active:cursor-grabbing"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="w-10 h-10 rounded-full relative overflow-hidden">
                                                                <Image src={card.influencer.user.image || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150'} alt={card.influencer.user.name || 'User'} fill className="object-cover" />
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                                                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white bg-purple-700">
                                                                    {/* Icon placeholder */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-900 leading-tight">{card.influencer.user.name}</h4>
                                                            <p className="text-xs text-gray-500 mt-0.5">{card.influencer.instagramHandle}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleStatusMove(card.id, card.status)}
                                                        className="text-gray-300 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-teal-50 rounded"
                                                        title="Move to Next Stage"
                                                    >
                                                        <ChevronDown className="w-5 h-5 -rotate-90" />
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                        <GalleryVerticalEnd className="w-4 h-4 text-teal-600" />
                                                        {card.offer ? card.offer.deliverablesDescription : 'No deliverables set'}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-sm font-bold text-gray-900">${card.offer ? card.offer.amount : '-'}</span>
                                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-500 bg-gray-100`}>
                                                        {/* Status Badge */}
                                                        {card.status}
                                                    </div>
                                                </div>

                                                {/* Progress Bar (Mock for now or derived from deliverable status) */}
                                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full bg-teal-600" style={{ width: '25%' }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Mobile Floating Button */}
            <div className="fixed bottom-6 right-6 md:hidden">
                <Link href="/brand/campaigns/new" className="bg-teal-600 hover:bg-teal-700 text-white rounded-full p-4 shadow-lg shadow-teal-600/40 flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                </Link>
            </div>
        </div>
    );
}
