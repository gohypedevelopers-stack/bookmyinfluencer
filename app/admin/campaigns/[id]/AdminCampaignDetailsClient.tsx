"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    User,
    DollarSign,
    CheckCircle,
    XCircle,
    MessageSquare,
    FileText,
    ExternalLink,
    Lock,
    Building,
    Calendar,
    AlertCircle,
    Send,
    CreditCard,
    History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { assignManagerToCampaign, recordManualPayout, sendAdminSystemMessage } from "../../actions";
import { updateDeliverableStatus } from "@/app/manager/actions";

// Formatter
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export default function AdminCampaignDetailsClient({ data, managers }: { data: any, managers: any[] }) {
    const { campaign, auditLogs, payoutRecords } = data;
    const router = useRouter();

    // State
    const [isAssigning, setIsAssigning] = useState(false);
    const [payoutOpen, setPayoutOpen] = useState(false);
    // Removed Chat Input State

    // Pick first active candidate for main view context (Chat/Contract)
    // In future, adding a selector for multiple candidates would be good.
    const activeCandidate = campaign.candidates?.[0] || null;
    const contract = activeCandidate?.contract;
    const chatThread = activeCandidate?.chatThread;

    // Derived Payment State
    const hasAdvanceTx = contract?.transactions?.some((t: any) => t.type === 'DEPOSIT' && t.status === 'SUCCESS');
    const hasFinalTx = contract?.transactions?.some((t: any) => t.type === 'FINAL_PAYMENT' && t.status === 'SUCCESS');
    const isFunded = hasAdvanceTx;
    const paymentState = isFunded ? (hasFinalTx ? "Fully Funded" : "Partially Funded") : "Not Funded";

    // --- ACTIONS ---

    const handleAssignManager = async (managerId: string) => {
        setIsAssigning(true);
        try {
            const result = await assignManagerToCampaign(campaign.id, managerId);
            if (result.success) {
                toast.success("Manager assigned successfully");
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (e) {
            toast.error("Error signing manager");
        } finally {
            setIsAssigning(false);
        }
    };

    // Removed handleSendSystemMessage

    // Removed handleApproveDeliverable / handleRejectDeliverable (Read-Only)

    // Manual Payout Form State
    const [payoutAmount, setPayoutAmount] = useState("");
    const [payoutRef, setPayoutRef] = useState("");
    const [payoutMethod, setPayoutMethod] = useState("BANK_TRANSFER");

    const handleManualPayout = async () => {
        if (!activeCandidate?.influencer?.id) return toast.error("No candidate linked");

        try {
            const res = await recordManualPayout({
                campaignId: campaign.id,
                creatorId: activeCandidate.influencer.id,
                amount: parseFloat(payoutAmount),
                transactionReference: payoutRef,
                paymentMethod: payoutMethod
            });
            if (res.success) {
                toast.success("Payout recorded");
                setPayoutOpen(false);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (e) {
            toast.error("Error recording payout");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/campaigns')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {campaign.title}
                            <span className={`px-2.5 py-0.5 text-xs rounded-full uppercase tracking-wide border ${campaign.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                                'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>
                                {campaign.status}
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {campaign.brand.companyName}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {activeCandidate?.influencer?.user?.name || "No Creator"}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Card className="px-4 py-2 bg-blue-50 border-blue-100 flex items-center gap-3">
                        <div className="text-xs text-blue-600 uppercase font-bold">Payment State</div>
                        <div className="text-sm font-bold text-blue-900">{paymentState}</div>
                    </Card>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="chat" className="flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Chat</TabsTrigger>
                    <TabsTrigger value="payments" className="flex items-center gap-2"><DollarSign className="w-3 h-3" /> Payments</TabsTrigger>
                    <TabsTrigger value="deliverables" className="flex items-center gap-2"><FileText className="w-3 h-3" /> Deliverables</TabsTrigger>
                    <TabsTrigger value="timeline" className="flex items-center gap-2"><History className="w-3 h-3" /> Timeline</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Manager Assignments */}
                        <Card className="p-6 space-y-4 md:col-span-1">
                            <h3 className="font-bold text-gray-900 text-sm uppercase mb-2">Assigned Manager</h3>
                            {campaign.assignment?.manager ? (
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700">
                                        {campaign.assignment.manager.name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-purple-900">{campaign.assignment.manager.name}</p>
                                        <p className="text-xs text-purple-600">{campaign.assignment.manager.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm italic">
                                    No manager assigned yet
                                </div>
                            )}

                            <div className="space-y-2 pt-2">
                                <Label className="text-xs">Reassign Manager</Label>
                                <Select onValueChange={handleAssignManager} disabled={isAssigning}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.name || m.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>

                        {/* Contract Summary */}
                        <Card className="p-6 space-y-4 md:col-span-2">
                            <h3 className="font-bold text-gray-900 text-sm uppercase mb-2">Contract & Financials</h3>
                            {contract ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Total Value</p>
                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(contract.totalAmount)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Platform Fee</p>
                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(contract.platformFee)}</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                        <p className="text-xs text-green-600 uppercase">Creator Earnings</p>
                                        <p className="text-lg font-bold text-green-900">{formatCurrency(contract.totalAmount - contract.platformFee)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg flex flex-col justify-center">
                                        <Button size="sm" variant="outline" onClick={() => document.getElementById('tab-payments')?.click()}>
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
                                    No contract active
                                </div>
                            )}
                        </Card>

                        {/* Candidates List */}
                        <Card className="p-6 space-y-4 md:col-span-3">
                            <h3 className="font-bold text-gray-900 text-sm uppercase mb-2">Candidates</h3>
                            {campaign.candidates && campaign.candidates.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {campaign.candidates.map((cand: any) => (
                                        <div key={cand.id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                                    {cand.influencer?.user?.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{cand.influencer?.user?.name}</p>
                                                    <p className="text-xs text-gray-500">{cand.influencer?.user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded uppercase ${cand.contract?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                        cand.contract?.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {cand.contract?.status || "Draft"}
                                                </span>
                                                {cand.chatThread && (
                                                    <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No candidates assigned.</p>
                            )}
                        </Card>

                    </div>
                </TabsContent>

                {/* CHAT TAB */}
                <TabsContent value="chat">
                    <Card className="h-[600px] flex flex-col">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Trio Chat Log
                            </h3>
                            <span className="text-xs text-gray-500">
                                Participants: Brand, Creator, Manager
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                            {chatThread?.messages?.length > 0 ? (
                                chatThread.messages.map((msg: any) => {
                                    const isSystem = msg.content?.startsWith("[ADMIN]") || msg.content?.startsWith("System:");
                                    const isBrand = msg.senderId === campaign.brand.user.id;
                                    const isCreator = msg.senderId === activeCandidate?.influencer?.user?.id;
                                    const isManager = campaign.assignment?.managerId === msg.senderId;

                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isSystem ? 'items-center' : 'items-start'}`}>
                                            {isSystem ? (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full my-2">
                                                    {msg.content}
                                                </span>
                                            ) : (
                                                <div className="flex gap-3 max-w-[80%]">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isBrand ? 'bg-blue-100 text-blue-700' :
                                                        isCreator ? 'bg-pink-100 text-pink-700' :
                                                            'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {msg.sender?.name?.[0] || "?"}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold text-gray-900">{msg.sender?.name}</span>
                                                            <span className="text-[10px] text-gray-400">
                                                                {isBrand && "(Brand)"}
                                                                {isCreator && "(Creator)"}
                                                                {isManager && "(Manager)"}
                                                            </span>
                                                            <span className="text-[10px] text-gray-300" suppressHydrationWarning>
                                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-800 border border-gray-100">
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center text-gray-400 mt-20">No messages yet</div>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {/* PAYMENTS TAB */}
                <TabsContent value="payments" className="space-y-6">
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Calculated Payment State</h3>
                            <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm"><CreditCard className="w-4 h-4 mr-2" /> Record Manual Payout</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Record Manual Payout</DialogTitle>
                                        <DialogDescription>
                                            Manually record a payment made outside the platform (e.g. UPI/Bank Transfer).
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Amount (INR)</Label>
                                            <Input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>UTR / Reference ID</Label>
                                            <Input value={payoutRef} onChange={e => setPayoutRef(e.target.value)} placeholder="e.g. UPI123456789" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Method</Label>
                                            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                                    <SelectItem value="UPI">UPI</SelectItem>
                                                    <SelectItem value="CASH">Cash/Cheque</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleManualPayout}>Record Payout</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Transactions List */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase">Incoming Transactions (Brand -&gt; Wallet/Escrow)</h4>
                            {contract?.transactions?.length > 0 ? (
                                <div className="space-y-2">
                                    {contract.transactions.map((tx: any) => (
                                        <div key={tx.id} className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 items-center">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{tx.type.replace(/_/g, ' ')}</p>
                                                <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-bold">{formatCurrency(tx.amount)}</p>
                                                <span className="text-xs text-green-600 font-bold">{tx.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No incoming transactions yet.</p>
                            )}
                        </div>

                        <div className="space-y-4 mt-8">
                            <h4 className="text-sm font-bold text-gray-500 uppercase">Outgoing Payouts (Platform -&gt; Creator)</h4>
                            {payoutRecords?.length > 0 ? (
                                <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Amount</th>
                                            <th className="p-3">Reference (UTR)</th>
                                            <th className="p-3">Method</th>
                                            <th className="p-3">Processed By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payoutRecords.map((p: any) => (
                                            <tr key={p.id} className="border-t border-gray-100">
                                                <td className="p-3" suppressHydrationWarning>{new Date(p.paidAt).toLocaleDateString()}</td>
                                                <td className="p-3 font-mono font-bold">{formatCurrency(p.amount)}</td>
                                                <td className="p-3 font-mono text-xs">{p.utr}</td>
                                                <td className="p-3">{p.method}</td>
                                                <td className="p-3 text-xs text-gray-500">{p.processedBy ? 'Admin/Manager' : 'System'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No payouts made yet.</p>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {/* DELIVERABLES TAB */}
                <TabsContent value="deliverables" className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Submission Status</h3>
                        {contract?.deliverables?.length > 0 ? (
                            <div className="space-y-3">
                                {contract.deliverables.map((d: any) => (
                                    <div key={d.id} className="flex flex-col md:flex-row justify-between p-4 border border-gray-200 rounded-lg bg-white gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${d.status === 'APPROVED' ? 'bg-green-500' :
                                                    d.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                                                    }`} />
                                                <h4 className="font-bold text-gray-900">{d.title}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{d.description}</p>
                                            {d.submissionUrl && (
                                                <a href={d.submissionUrl} target="_blank" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3" /> View Work
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 self-start md:self-center">
                                            <div className="text-right mr-4">
                                                <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                                                <p className={`text-sm font-bold ${d.status === 'APPROVED' ? 'text-green-600' :
                                                    d.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'
                                                    }`}>{d.status}</p>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No deliverables configured.</p>
                        )}
                    </Card>
                </TabsContent>

                {/* TIMELINE TAB */}
                <TabsContent value="timeline">
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <History className="w-4 h-4" /> Activity Log
                        </h3>
                        <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-4">
                            {auditLogs?.map((log: any) => (
                                <div key={log.id} className="ml-6 relative">
                                    <div className="absolute -left-[31px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-gray-500 mb-1" suppressHydrationWarning>{new Date(log.createdAt).toLocaleString()} • User: {log.userId || 'System'}</p>
                                        <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-600 break-all">
                                            {log.details}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
