"use client"

import { useState } from "react";
import {
    CheckCircle,
    XCircle,
    DollarSign,
    Lock,
    MessageSquare,
    ExternalLink,
    FileText,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { updateDeliverableStatus } from "../../actions";
import { manualPayout, approveDeliverableAndLock } from "@/app/brand/wallet-actions";
import { useRouter } from "next/navigation";

export default function ManagerCampaignDetailsClient({ campaign }: { campaign: any }) {
    const router = useRouter();
    const [selectedContract, setSelectedContract] = useState<any>(null);
    const [isPayoutOpen, setIsPayoutOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState("");
    const [payoutMethod, setPayoutMethod] = useState<"UPI" | "BANK">("UPI");
    const [utr, setUtr] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLocking, setIsLocking] = useState(false);

    async function handleApproveDeliverable(id: string) {
        if (!confirm("Approve this deliverable?")) return;
        const result = await updateDeliverableStatus(id, "APPROVED");
        if (result.success) {
            toast.success("Deliverable Approved");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to approve");
        }
    }

    async function handleRejectDeliverable(id: string) {
        const feedback = prompt("Enter feedback for rejection:");
        if (!feedback) return;
        const result = await updateDeliverableStatus(id, "REJECTED", feedback);
        if (result.success) {
            toast.success("Deliverable Rejected");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to reject");
        }
    }

    async function handleFinalLock(contractId: string) {
        if (!confirm("This will lock the remaining amount from Brand Wallet and complete the contract. Proceed?")) return;
        setIsLocking(true);
        try {
            const result = await approveDeliverableAndLock(contractId);
            if (result.success) {
                toast.success("Final amount locked & Contract completed!");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to lock final amount");
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsLocking(false);
        }
    }

    async function handleManualPayout() {
        if (!selectedContract) return;
        setIsProcessing(true);
        try {
            const result = await manualPayout(
                campaign.id,
                selectedContract.influencerId,
                Number(payoutAmount),
                payoutMethod,
                utr
            );
            if (result.success) {
                toast.success("Payout recorded successfully!");
                setIsPayoutOpen(false);
                setPayoutAmount("");
                setUtr("");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to record payout");
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                    <p className="text-gray-500">Brand: {campaign.brand.companyName}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-bold rounded-full uppercase ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {campaign.status}
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Candidates & Contracts</h2>

                {campaign.candidates.map((candidate: any) => {
                    const contract = candidate.contract;
                    if (!contract) return null; // Should have contract if assigned

                    return (
                        <Card key={candidate.id} className="p-6 rounded-2xl border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                        {candidate.influencer.user.image && <img src={candidate.influencer.user.image} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{candidate.influencer.user.name}</h3>
                                        <p className="text-sm text-gray-500 font-mono">{contract.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => router.push(`/manager/chat?contract=${contract.id}`)}>
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Chat
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Total Deal</p>
                                    <p className="text-lg font-bold text-gray-900">₹{contract.totalAmount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                                    <p className="text-sm font-bold text-indigo-600">{contract.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Actions</p>
                                    <div className="flex gap-2 mt-1">
                                        {contract.status === "ACTIVE" && (
                                            <Button size="xs" onClick={() => handleFinalLock(contract.id)} disabled={isLocking}>
                                                <Lock className="w-3 h-3 mr-1" />
                                                Final Lock
                                            </Button>
                                        )}
                                        {contract.status === "COMPLETED" && (
                                            <Button size="xs" variant="outline" onClick={() => {
                                                setSelectedContract(contract);
                                                setIsPayoutOpen(true);
                                            }}>
                                                <DollarSign className="w-3 h-3 mr-1" />
                                                Record Payout
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-sm text-gray-700 uppercase">Deliverables</h4>
                                {contract.deliverables.length > 0 ? (
                                    contract.deliverables.map((d: any) => (
                                        <div key={d.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-white">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{d.type}</p>
                                                    <a href={d.url} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center">
                                                        View Link <ExternalLink className="w-3 h-3 ml-1" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${d.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        d.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {d.status}
                                                </span>
                                                {d.status === 'SUBMITTED' && (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleApproveDeliverable(d.id)}>
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleRejectDeliverable(d.id)}>
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No deliverables yet.</p>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isPayoutOpen} onOpenChange={setIsPayoutOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Manual Payout</DialogTitle>
                        <DialogDescription>
                            Record a manual transfer made to the influencer. Ensure the payment is already completed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                value={payoutAmount}
                                onChange={(e) => setPayoutAmount(e.target.value)}
                                placeholder="Amount Paid"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Method</Label>
                            <Select value={payoutMethod} onValueChange={(v: any) => setPayoutMethod(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>UTR / Reference ID</Label>
                            <Input
                                value={utr}
                                onChange={(e) => setUtr(e.target.value)}
                                placeholder="Details of transaction"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPayoutOpen(false)}>Cancel</Button>
                        <Button onClick={handleManualPayout} disabled={isProcessing}>
                            {isProcessing ? "Recording..." : "Confirm Payment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
