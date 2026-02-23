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
    AlertCircle,
    History,
    CreditCard,
    CheckSquare
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

// Formatter
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export default function ManagerCampaignDetailsClient({ campaign, auditLogs }: { campaign: any, auditLogs: any[] }) {
    const router = useRouter();
    const [selectedContract, setSelectedContract] = useState<any>(null);
    const [isPayoutOpen, setIsPayoutOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState("");
    const [payoutMethod, setPayoutMethod] = useState<"UPI" | "BANK">("UPI");
    const [utr, setUtr] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLocking, setIsLocking] = useState(false);

    // --- Action Handlers ---

    async function handleApproveDeliverable(id: string, contractId: string) {
        if (!confirm("Approve this deliverable? This will also lock the remaining contract amount.")) return;
        const result = await updateDeliverableStatus(id, "APPROVED");
        if (result.success) {
            toast.success("Deliverable Approved");

            // Trigger Final Lock automatically
            setIsLocking(true);
            try {
                const lockResult = await approveDeliverableAndLock(contractId);
                if (lockResult.success) {
                    toast.success("Final amount locked & Contract marked as Completed");
                } else {
                    toast.error("Deliverable approved but failed to lock funds: " + (lockResult as any).error);
                }
            } catch (e: any) {
                toast.error("Lock error: " + e.message);
            } finally {
                setIsLocking(false);
                router.refresh();
            }
        } else {
            toast.error((result as any).error || "Failed to approve");
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
            toast.error((result as any).error || "Failed to reject");
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
                toast.error((result as any).error || "Failed to lock final amount");
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
                toast.error((result as any).error || "Failed to record payout");
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                        Brand: <span className="font-semibold text-gray-700">{campaign.brand.companyName}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-4 py-1.5 text-sm font-bold rounded-full uppercase border ${campaign.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                        campaign.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                        {campaign.status}
                    </span>
                    <div className="bg-purple-50 text-purple-700 font-bold px-4 py-1.5 rounded-full border border-purple-200 text-sm flex items-center gap-2">
                        Assigned Manager
                    </div>
                </div>
            </div>

            {/* Candidates Section */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Candidates & Contracts
                    <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">{campaign.candidates.length}</span>
                </h2>

                {campaign.candidates.length > 0 ? (
                    campaign.candidates.map((candidate: any) => {
                        const contract = candidate.contract;
                        const hasContract = !!contract;

                        // Derived Payment Status
                        let paymentStatus = "Pending";
                        let hasAdvance = false;
                        let isCompleted = false;

                        if (hasContract) {
                            hasAdvance = contract.transactions?.some((t: any) =>
                                (t.type === 'ESCROW_FUNDING' || t.type === 'DEPOSIT') && (t.status === 'FUNDED' || t.status === 'SUCCESS')
                            );
                            isCompleted = contract.status === 'COMPLETED';

                            if (isCompleted) paymentStatus = "Fully Paid";
                            else if (hasAdvance) paymentStatus = "Advance Paid";
                            else paymentStatus = "Not Funded";
                        }

                        // Checklist Data
                        const steps = [
                            { label: "Advance Paid", active: hasAdvance },
                            { label: "Chat Started", active: !!candidate.chatThread },
                            { label: "Submitted", active: contract?.deliverables?.some((d: any) => d.submissionUrl) },
                            { label: "Approved", active: contract?.deliverables?.some((d: any) => d.status === 'APPROVED') },
                            { label: "Locked", active: isCompleted },
                            { label: "Paid", active: paymentStatus === 'Fully Paid' || (campaign.payouts && campaign.payouts.some((p: any) => p.creatorId === candidate.influencer?.id)) }
                        ];

                        return (
                            <Card key={candidate.id} className="p-6 rounded-2xl border-gray-200 shadow-sm transition-all hover:shadow-md">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden shrink-0 border border-gray-100">
                                            {candidate.influencer?.user?.image ? (
                                                <img src={candidate.influencer.user.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xl">
                                                    {candidate.influencer?.user?.name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{candidate.influencer?.user?.name || "Unknown Creator"}</h3>
                                            <p className="text-sm text-gray-500">{candidate.influencer?.user?.email}</p>

                                            {hasContract ? (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 truncate max-w-[150px]">
                                                        {contract.id}
                                                    </span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${contract.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                        contract.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {contract.status}
                                                    </span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${paymentStatus === 'Fully Paid' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        paymentStatus === 'Advance Paid' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                            'bg-red-50 text-red-700 border-red-100'
                                                        }`}>
                                                        {paymentStatus}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-block mt-2 text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase">
                                                    No Contract
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Checklist */}
                                    <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                                        {steps.map((step, i) => (
                                            <div key={i} className="flex flex-col items-center group relative cursor-default">
                                                <div className={`w-2 h-2 rounded-full mb-1 ${step.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <span className="text-[10px] text-gray-400 uppercase hidden group-hover:block absolute top-4 whitespace-nowrap bg-gray-800 text-white px-1 py-0.5 rounded z-10">
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                        <span className="text-xs text-gray-400 ml-1 font-mono">{steps.filter(s => s.active).length}/6</span>
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 md:flex-none"
                                            onClick={() => candidate.chatThread?.id ? router.push(`/manager/chat?threadId=${candidate.chatThread.id}`) : toast.info("No chat thread initialized yet")}
                                            disabled={!candidate.chatThread}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Open Chat
                                        </Button>
                                    </div>
                                </div>

                                {hasContract ? (
                                    <>
                                        {/* Financials */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Contract Value</p>
                                                <p className="text-lg font-bold text-gray-900">{formatCurrency(contract.totalAmount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Platform Fee</p>
                                                <p className="text-lg font-bold text-gray-700">{formatCurrency(contract.platformFee)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Creator Take</p>
                                                <p className="text-lg font-bold text-green-700">{formatCurrency(contract.totalAmount - contract.platformFee)}</p>
                                            </div>
                                            <div className="flex items-center justify-end">
                                                {contract.status === "ACTIVE" && (
                                                    <Button size="sm" className="w-full text-xs" onClick={() => handleFinalLock(contract.id)} disabled={isLocking}>
                                                        <Lock className="w-3 h-3 mr-1" />
                                                        Final Lock
                                                    </Button>
                                                )}
                                                {contract.status === "COMPLETED" && (
                                                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => {
                                                        setSelectedContract(contract);
                                                        setIsPayoutOpen(true);
                                                    }}>
                                                        <DollarSign className="w-3 h-3 mr-1" />
                                                        Record Payout
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Deliverables */}
                                        <div className="space-y-3">
                                            <h4 className="font-bold text-sm text-gray-700 uppercase flex items-center gap-2">
                                                <FileText className="w-4 h-4" /> Deliverables
                                            </h4>

                                            {contract.deliverables && contract.deliverables.length > 0 ? (
                                                <div className="space-y-2">
                                                    {contract.deliverables.map((d: any) => (
                                                        <div key={d.id} className="flex flex-col md:flex-row justify-between p-3 border border-gray-200 rounded-lg bg-white gap-3 transition-colors hover:border-gray-300">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`w-2 h-2 rounded-full ${d.status === 'APPROVED' ? 'bg-green-500' :
                                                                        d.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                                                                        }`} />
                                                                    <p className="text-sm font-bold text-gray-900">{d.title}</p>
                                                                </div>

                                                                {d.submissionUrl ? (
                                                                    <a href={d.submissionUrl} target="_blank" className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium mt-1">
                                                                        <ExternalLink className="w-3 h-3" /> View Work
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400 italic flex items-center gap-1 mt-1">
                                                                        <AlertCircle className="w-3 h-3" /> Pending Submission
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2 mt-2 md:mt-0">
                                                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${d.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                                    d.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {d.status}
                                                                </span>

                                                                {d.status === 'SUBMITTED' && (
                                                                    <div className="flex gap-1 ml-2">
                                                                        <Button size="icon" variant="ghost" className="w-8 h-8 text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleApproveDeliverable(d.id, contract.id)}>
                                                                            <CheckCircle className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button size="icon" variant="ghost" className="w-8 h-8 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleRejectDeliverable(d.id)}>
                                                                            <XCircle className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">
                                                    No deliverables configured for this contract.
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-orange-50 border border-orange-100 text-orange-800 p-4 rounded-xl text-center text-sm">
                                        <AlertCircle className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                                        <p className="font-bold">No Active Contract</p>
                                        <p className="text-xs mt-1 text-orange-700">Waiting for brand to initiate offer or negotiation.</p>
                                    </div>
                                )}
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No candidates assigned to this campaign yet.</p>
                    </div>
                )}
            </div>

            {/* Activity Timeline Section - Using Audit Logs */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5" /> Recent Activity
                </h3>
                <Card className="p-0 overflow-hidden border-gray-200">
                    <div className="divide-y divide-gray-100">
                        {auditLogs && auditLogs.length > 0 ? (
                            auditLogs.map((log: any) => (
                                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{log.action.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(log.createdAt).toLocaleString()}</p>
                                            <p className="text-xs text-gray-600 font-mono mt-1 break-all max-w-full overflow-hidden text-ellipsis line-clamp-2">{log.details}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-400 italic text-sm">
                                No recent activity logged.
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Payout Dialog */}
            <Dialog open={isPayoutOpen} onOpenChange={setIsPayoutOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Manual Payout</DialogTitle>
                        <DialogDescription>
                            Record a manual transfer made to the influencer outside the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Amount (INR)</Label>
                            <Input
                                type="number"
                                value={payoutAmount}
                                onChange={(e) => setPayoutAmount(e.target.value)}
                                placeholder="e.g. 50000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Method</Label>
                            <Select value={payoutMethod} onValueChange={(v: any) => setPayoutMethod(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Method" />
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
                                placeholder="Transaction Ref ID"
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
