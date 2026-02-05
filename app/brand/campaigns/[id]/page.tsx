
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Calendar, DollarSign, MapPin, Users, Target, Clock, Edit, ArrowLeft } from "lucide-react";

export default async function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'BRAND') {
        redirect('/login?role=brand');
    }

    const { id } = await params;

    const brand = await db.brandProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!brand) {
        redirect('/brand/onboarding');
    }

    const campaign = await db.campaign.findFirst({
        where: {
            id: id,
            brandId: brand.id
        }
    });

    if (!campaign) {
        notFound();
    }

    const formatDate = (date: Date | null) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Link href="/brand/campaigns" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Campaigns
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{campaign.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                    campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <p className="text-gray-500 font-medium">Created on {formatDate(campaign.createdAt)}</p>
                        </div>

                        <Link
                            href={`/brand/campaigns/${campaign.id}/edit`}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all shadow-sm"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Campaign
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                About the Campaign
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {campaign.description || "No description provided."}
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements & Brief</h2>
                            <div className="bg-gray-50/50 rounded-lg p-6 border border-gray-100">
                                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                                    {campaign.requirements || "No specific requirements listed."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar Stats */}
                    <div className="space-y-6">
                        {/* Budget & Payment */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Budget & Compensation</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">₹{campaign.budget?.toLocaleString() || 0}</div>
                                        <div className="text-xs text-gray-500 font-medium">{campaign.paymentType}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Targeting */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Targeting</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Target className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">Niche</span>
                                        <span className="text-sm text-gray-600 capitalize">{campaign.niche || 'Any'}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">Location</span>
                                        <span className="text-sm text-gray-600">{campaign.location || 'Global'}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">Min. Followers</span>
                                        <span className="text-sm text-gray-600">{campaign.minFollowers?.toLocaleString() || 0}+</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Timeline</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">Duration</span>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                                                Start: {formatDate(campaign.startDate)}
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                                                End: {formatDate(campaign.endDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
