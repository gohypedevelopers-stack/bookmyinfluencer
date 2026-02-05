
import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { CandidateStatus } from "@prisma/client"
import {
    Filter,
    Plus,
    FileText,
    Video,
    MessageSquare as ChatIcon,
    MoreHorizontal,
    Compass,
    DollarSign,
    PlaySquare,
    Images as ImagesIcon,
    Clock,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default async function CreatorCampaignsPage() {
    const creatorId = await getAuthenticatedCreatorId()

    let ongoing = [] as any[]
    let invitations = [] as any[]

    if (creatorId) {
        const otpUser = await db.otpUser.findUnique({ where: { id: creatorId } })

        if (otpUser?.email) {
            const legacyUser = await db.user.findUnique({
                where: { email: otpUser.email },
                include: { influencerProfile: true }
            })

            if (legacyUser?.influencerProfile) {
                const profileId = legacyUser.influencerProfile.id

                // Fetch Ongoing (HIRED, CONTENT_REVIEW)
                ongoing = await db.campaignCandidate.findMany({
                    where: {
                        influencerId: profileId,
                        status: { in: [CandidateStatus.HIRED, CandidateStatus.CONTENT_REVIEW] }
                    },
                    include: {
                        campaign: {
                            include: {
                                brand: {
                                    include: { user: true }
                                }
                            }
                        },
                        contract: {
                            include: {
                                deliverables: true
                            }
                        }
                    },
                    orderBy: { updatedAt: 'desc' }
                })

                // Fetch Invitations (CONTACTED, IN_NEGOTIATION)
                invitations = await db.campaignCandidate.findMany({
                    where: {
                        influencerId: profileId,
                        status: { in: [CandidateStatus.CONTACTED, CandidateStatus.IN_NEGOTIATION] }
                    },
                    include: {
                        campaign: {
                            include: {
                                brand: {
                                    include: { user: true }
                                }
                            }
                        },
                        offer: true
                    },
                    orderBy: { updatedAt: 'desc' }
                })
            }
        }
    }

    // Helper to calculate progress
    const getProgress = (candidate: any) => {
        if (!candidate.contract?.deliverables?.length) return 0;
        const total = candidate.contract.deliverables.length;
        const completed = candidate.contract.deliverables.filter((d: any) => d.status === 'APPROVED').length;
        return Math.round((completed / total) * 100);
    }

    // Helper to get next deliverable
    const getNextDeliverable = (candidate: any) => {
        if (!candidate.contract?.deliverables) return null;
        return candidate.contract.deliverables.find((d: any) => d.status === 'PENDING') || null;
    }

    return (
        <div className="h-full overflow-y-auto p-8 md:p-10 bg-gray-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">My Campaigns</h1>
                    <p className="text-gray-500 font-medium">Manage your active collaborations and discover new opportunities.</p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 gap-2 h-11 px-5 rounded-xl font-semibold transition-all">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>

                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-11 px-6 shadow-lg shadow-indigo-200 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-4 h-4" />
                        New Pitch
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-10">
                <div className="flex gap-8">
                    <button className="pb-4 border-b-2 border-indigo-600 text-indigo-600 font-bold text-sm tracking-wide">
                        Ongoing ({ongoing.length})
                    </button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-800 font-semibold text-sm transition-all">
                        Invitations ({invitations.length})
                    </button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-800 font-semibold text-sm transition-all">
                        Completed
                    </button>
                </div>
            </div>

            {/* Ongoing Campaigns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {ongoing.length > 0 ? (
                    ongoing.map((item) => {
                        const progress = getProgress(item);
                        const nextItem = getNextDeliverable(item);
                        return (
                            <Card key={item.id} className="rounded-[2rem] border-gray-100 shadow-sm hover:shadow-md transition-all p-8 bg-white group">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex gap-5">
                                        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-inner">
                                            {item.campaign.brand.user?.image ? (
                                                <img src={item.campaign.brand.user.image} alt={item.campaign.brand.companyName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-xl">{item.campaign.brand.companyName.substring(0, 2).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 mb-1">{item.campaign.brand.companyName}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 text-sm font-medium">{item.campaign.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider ${item.status === 'HIRED' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {item.status === 'HIRED' ? 'Active' : 'Review'}
                                    </span>
                                </div>

                                <div className="mb-8">
                                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        <span>Campaign Progress</span>
                                        <span className="text-gray-900">{progress}%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {nextItem ? (
                                    <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-5 flex items-center justify-between mb-8 group-hover:bg-orange-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm ring-1 ring-orange-100">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-0.5">NEXT DELIVERABLE</p>
                                                <p className="font-bold text-sm text-gray-900">{nextItem.title}</p>
                                            </div>
                                        </div>
                                        {nextItem.dueDate && (
                                            <span className="text-orange-600 text-xs font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-orange-100">
                                                {new Date(nextItem.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-2xl p-5 flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">All deliverables completed!</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 h-12 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                        <ChatIcon className="w-4 h-4 mr-2" />
                                        Team Chat
                                    </Button>
                                    <Button variant="outline" className="w-12 border-gray-200 text-gray-400 h-12 rounded-xl hover:bg-gray-50 hover:text-gray-900 px-0 transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </div>
                            </Card>
                        )
                    })
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border border-gray-100 border-dashed">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ImagesIcon className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Campaigns</h3>
                        <p className="text-gray-500 max-w-sm mb-6">You don't have any ongoing campaigns yet. Check your invitations or discover new opportunities.</p>
                        <Button variant="outline">Discover Campaigns</Button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">New Invitations</h2>
                {invitations.length > 0 && (
                    <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2.5 py-1 rounded-full">{invitations.length}</span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitations.length > 0 ? (
                    invitations.map((item) => (
                        <Card key={item.id} className="rounded-3xl border-gray-100 shadow-sm p-6 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow">
                                    {item.campaign.brand.user?.image ? (
                                        <img src={item.campaign.brand.user.image} alt={item.campaign.brand.companyName} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        item.campaign.brand.companyName.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{item.campaign.brand.companyName}</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{item.campaign.niche || 'General'}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <DollarSign className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    ₹{item.campaign.budget?.toLocaleString() || 'Negotiable'}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <Compass className="w-3.5 h-3.5 text-blue-600" />
                                    </div>
                                    {item.campaign.title}
                                </div>
                            </div>

                            <Button variant="outline" className="w-full border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 h-12 rounded-xl font-bold tracking-wide transition-colors">
                                Review Brief
                            </Button>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-8 text-center text-gray-400 text-sm font-medium">
                        No pending invitations.
                    </div>
                )}

                {/* Discover More Card */}
                <div className="rounded-3xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group h-full min-h-[280px]">
                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-5 group-hover:bg-white group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                        <Compass className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-indigo-700 transition-colors">Discover More</h3>
                    <p className="text-xs text-gray-500 leading-relaxed px-4 font-medium">Browse hundreds of active brand opportunities in the marketplace</p>
                </div>
            </div>
        </div>
    )
}
