"use client"

import {
    Wallet,
    History,
    Landmark,
    TrendingUp,
    Filter,
    Plus,
    CreditCard,
    Loader2,
    ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getBrandWalletData, createWalletRechargeOrder, verifyWalletRecharge } from "../wallet-actions"
import Script from "next/script"

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function BrandWalletPage() {
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [walletData, setWalletData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingFunds, setIsAddingFunds] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    async function fetchWalletData() {
        setIsLoading(true);
        const result = await getBrandWalletData();
        if (result.success) {
            setWalletData(result.data);
        } else {
            toast.error(result.error || "Failed to load wallet data");
        }
        setIsLoading(false);
    }

    async function handleAddFunds() {
        if (!amountToAdd || isNaN(Number(amountToAdd)) || Number(amountToAdd) < 1) {
            toast.error("Please enter a valid amount (min ₹1)");
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Create Order
            const orderRes = await createWalletRechargeOrder(Number(amountToAdd));
            if (!orderRes.success || !orderRes.orderId) {
                throw new Error(orderRes.error || "Failed to create order");
            }

            // 2. Open Razorpay
            const options = {
                key: orderRes.key, // Enter the Key ID generated from the Dashboard
                amount: orderRes.amount * 100, // Amount is in currency subunits. Default currency is INR.
                currency: "INR",
                name: "BookMyInfluencers",
                description: "Wallet Recharge",
                order_id: orderRes.orderId, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                handler: async function (response: any) {
                    // 3. Verify Payment
                    toast.loading("Verifying payment...");
                    const verifyRes = await verifyWalletRecharge(
                        orderRes.orderId,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    );

                    if (verifyRes.success) {
                        toast.dismiss();
                        toast.success("Wallet recharged successfully!");
                        setIsAddingFunds(false);
                        setAmountToAdd("");
                        fetchWalletData();
                    } else {
                        toast.dismiss();
                        toast.error(verifyRes.error || "Verification failed");
                    }
                },
                prefill: {
                    name: "Brand User",
                    email: "brand@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#2563EB"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                toast.error(response.error.description || "Payment failed");
            });
            rzp1.open();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsProcessing(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const data = walletData || {
        walletBalance: 0,
        totalSpent: 0,
        inEscrow: 0,
        transactions: []
    };

    return (
        <div className="min-h-full p-10 bg-gray-50">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
                        <p className="text-gray-500">Manage your campaign budget and transactions.</p>
                    </div>
                    <Dialog open={isAddingFunds} onOpenChange={setIsAddingFunds}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Add Funds
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Funds to Wallet</DialogTitle>
                                <DialogDescription>
                                    Enter the amount you'd like to add to your available budget.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount (INR)</Label>
                                    <Input
                                        id="amount"
                                        placeholder="5000"
                                        type="number"
                                        value={amountToAdd}
                                        onChange={(e) => setAmountToAdd(e.target.value)}
                                        disabled={isProcessing}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddingFunds(false)} disabled={isProcessing}>Cancel</Button>
                                <Button onClick={handleAddFunds} className="bg-blue-600" disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Proceed to Pay"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 mb-8 text-white shadow-xl shadow-blue-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-blue-100 font-medium text-sm mb-2">
                            <Wallet className="w-4 h-4" />
                            Total Available Budget
                        </div>
                        <h1 className="text-5xl font-bold mb-4">₹{data.walletBalance.toLocaleString()}</h1>
                        <div className="flex items-center gap-4 text-blue-100 text-sm">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4" />
                                Secure Wallet
                            </span>
                            <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                            <span>Powered by Razorpay</span>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 flex items-center gap-6 bg-white">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">TOTAL SPENT</p>
                            <h2 className="text-3xl font-bold text-gray-900 mb-1">₹{data.totalSpent.toLocaleString()}</h2>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 flex items-center gap-6 bg-white">
                        <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
                            <Landmark className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">LOCKED</p>
                            <h2 className="text-3xl font-bold text-gray-900 mb-1">₹{data.inEscrow.toLocaleString()}</h2>
                            <p className="text-gray-400 text-sm">Active campaigns</p>
                        </div>
                    </Card>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h3 className="font-bold text-xl text-gray-900">Recent Transactions</h3>
                    </div>
                    {data.transactions.length > 0 ? (
                        <>
                            <div className="grid grid-cols-4 px-8 py-5 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <span>Date</span>
                                <span>Type</span>
                                <span>Reference</span>
                                <span className="text-right">Amount</span>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {data.transactions.map((tx: any, i: number) => (
                                    <div key={i} className="grid grid-cols-4 px-8 py-6 hover:bg-gray-50 transition-colors items-center">
                                        <span className="text-sm text-gray-500">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {tx.type.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {tx.reference || "-"}
                                        </span>
                                        <div className="text-right">
                                            <span className={`font-bold ${tx.type.includes('RECHARGE') ? 'text-green-600' : 'text-gray-900'
                                                }`}>
                                                {tx.type.includes('RECHARGE') ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                            <History className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium">No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
