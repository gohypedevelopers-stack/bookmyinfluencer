'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {
    X,
    DollarSign,
    Briefcase,
    Globe,
    MapPin,
    Users,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { toast } from "sonner";
import { respondToInvitation } from '@/app/(creator)/creator/actions';
import { useRouter } from 'next/navigation';

interface InvitationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invitation: any; // CampaignCandidate with campaign included
}

export default function InvitationDetailsModal({ isOpen, onClose, invitation }: InvitationDetailsModalProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const router = useRouter();

    if (!invitation) return null;

    const campaign = invitation.campaign;
    const brand = campaign.brand;
    const offerAmount = invitation.offer?.amount || campaign.budget;

    async function handleAccept() {
        setIsAccepting(true);
        try {
            const result = await respondToInvitation(invitation.id, 'ACCEPT');

            if (result.success) {
                toast.success("Invitation Accepted!", {
                    description: "You can now start chatting with the brand in your Messages."
                });
                onClose();
                // Refresh the page to show updated status
                router.refresh();
                // Optionally redirect to messages
                // router.push('/creator/messages');
            } else {
                toast.error("Error", {
                    description: result.error || "Failed to accept invitation"
                });
            }
        } catch (error) {
            toast.error("Error", {
                description: "Something went wrong. Please try again."
            });
        } finally {
            setIsAccepting(false);
        }
    }

    async function handleDecline() {
        setIsDeclining(true);
        try {
            const result = await respondToInvitation(invitation.id, 'DECLINE');

            if (result.success) {
                toast.success("Invitation Declined", {
                    description: "The brand has been notified."
                });
                onClose();
                router.refresh();
            } else {
                toast.error("Error", {
                    description: result.error || "Failed to decline invitation"
                });
            }
        } catch (error) {
            toast.error("Error", {
                description: "Something went wrong. Please try again."
            });
        } finally {
            setIsDeclining(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-0 [&>button]:hidden">
                <DialogTitle className="sr-only">
                    Invitation from {brand.companyName}: {campaign.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Review and respond to the collaboration invitation from {brand.companyName}.
                </DialogDescription>
                <div className="relative">
                    {/* Header Image/Gradient */}
                    <div className="h-32 w-full relative overflow-hidden bg-gray-900">
                        {brand.user?.image ? (
                            <img
                                src={brand.user.image}
                                alt="Cover"
                                className="w-full h-full object-cover opacity-60 blur-sm scale-110"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        )}
                        <div className="absolute inset-0 bg-black/10"></div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full z-10"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Brand Info */}
                    <div className="px-8 -mt-10 relative flex justify-between items-end mb-6">
                        <div className="flex gap-5 items-end">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-lg border-4 border-white overflow-hidden">
                                {brand.user?.image ? (
                                    <img src={brand.user.image} alt={brand.companyName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-2xl">{brand.companyName.substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="pb-1">
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{brand.companyName}</h2>
                                {brand.website && (
                                    <a href={brand.website} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                                        <Globe className="w-3.5 h-3.5" />
                                        Visit Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 space-y-6">
                        {/* Invitation Notice */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-indigo-900 text-sm">You've Been Invited!</p>
                                <p className="text-xs text-indigo-700">{brand.companyName} wants to collaborate with you on this campaign.</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    {offerAmount ? `Offer: ₹${offerAmount.toLocaleString()}` : 'Budget: Negotiable'}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                    {campaign.paymentType || 'Fixed'}
                                </div>
                                {campaign.location && (
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        {campaign.location}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Campaign Description</h4>
                                <p className="text-gray-700 leading-relaxed text-[15px]">
                                    {campaign.description || 'No description provided.'}
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

                        {campaign.minFollowers && (
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
                        )}

                        {/* Action Buttons */}
                        <div className="pt-4 flex gap-3">
                            <Button
                                onClick={handleDecline}
                                disabled={isAccepting || isDeclining}
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold rounded-xl h-12 disabled:opacity-50"
                            >
                                {isDeclining ? (
                                    <>
                                        <XCircle className="w-4 h-4 mr-2 animate-spin" />
                                        Declining...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Decline
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleAccept}
                                disabled={isAccepting || isDeclining}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-green-200 disabled:opacity-50"
                            >
                                {isAccepting ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2 animate-spin" />
                                        Accepting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Accept Invitation
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
