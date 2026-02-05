
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
    CheckCircle2,
    DollarSign,
    Briefcase,
    Globe,
    MapPin,
    Users,
    Calendar,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface CampaignDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: any;
    isVerified: boolean;
}

export default function CampaignDetailsModal({ isOpen, onClose, campaign, isVerified }: CampaignDetailsModalProps) {
    const [isApplying, setIsApplying] = useState(false);

    if (!campaign) return null;

    async function handleApply() {
        if (!isVerified) {
            toast.error("Verification Required", {
                description: "You must complete your profile verification before applying."
            });
            return;
        }

        setIsApplying(true);
        try {
            const response = await fetch('/api/creator/campaigns/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: campaign.id })
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || 'Failed to apply');
            }

            toast.success("Application Sent!", {
                description: "The brand has been notified of your interest."
            });
            onClose();
            // Ideally we should refresh the parent list here
            window.location.reload();
        } catch (error) {
            toast.error("Error", {
                description: "Something went wrong. Please try again."
            });
        } finally {
            setIsApplying(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-0">
                <DialogTitle className="sr-only">
                    Campaign Details: {campaign.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    View details and apply for the {campaign.title} campaign by {campaign.brand.companyName}.
                </DialogDescription>
                <div className="relative">
                    {/* Header Image/Gradient */}
                    <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 w-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Brand Info */}
                    <div className="px-8 -mt-10 relative flex justify-between items-end mb-6">
                        <div className="flex gap-5 items-end">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-lg border-4 border-white overflow-hidden">
                                {campaign.brand.user?.image ? (
                                    <img src={campaign.brand.user.image} alt={campaign.brand.companyName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-2xl">{campaign.brand.companyName.substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="pb-1">
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{campaign.brand.companyName}</h2>
                                <a href={campaign.brand.website} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                                    <Globe className="w-3.5 h-3.5" />
                                    Visit Website
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    {campaign.budget ? `Budget: ₹${campaign.budget.toLocaleString()}` : 'Budget: Negotiable'}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                    {campaign.paymentType}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    {campaign.location || 'Remote / Any'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Campaign Description</h4>
                                <p className="text-gray-700 leading-relaxed text-[15px]">
                                    {campaign.description}
                                </p>
                            </div>

                            {campaign.requirements && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Requirements</h4>
                                    <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                                        {campaign.requirements}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                            <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Influencer Criteria
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-indigo-400 font-bold uppercase mb-0.5">Min Followers</p>
                                    <p className="text-gray-900 font-semibold">{campaign.minFollowers?.toLocaleString() || 'Any'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-400 font-bold uppercase mb-0.5">Niche</p>
                                    <p className="text-gray-900 font-semibold">{campaign.niche || 'Open'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose} className="border-gray-200 font-bold rounded-xl h-12 px-6">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleApply}
                                disabled={isApplying || !isVerified}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 px-8 shadow-lg shadow-indigo-200"
                            >
                                {isApplying ? 'Sending Request...' : 'Request to Collab'}
                                {!isApplying && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
