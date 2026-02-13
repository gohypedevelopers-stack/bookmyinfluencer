"use client"

import {
    Wallet,
    Download,
    History,
    Landmark,
    TrendingUp,
    Filter,
    FileText,
    Plus,
    CreditCard,
    Trash2,
    CheckCircle2,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { getBrandWallet, addFundsToWallet, savePaymentMethod, deletePaymentMethod } from "../actions"

export default function BrandWalletPage() {
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [walletData, setWalletData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingFunds, setIsAddingFunds] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState("");

    // Add Method State
    const [isAddingMethod, setIsAddingMethod] = useState(false);
    const [newMethod, setNewMethod] = useState({
        type: "Visa",
        last4: "",
        expiry: "",
        isDefault: false
    });

    useEffect(() => {
        fetchWalletData();
    }, []);

    async function fetchWalletData() {
        setIsLoading(true);
        const result = await getBrandWallet();
        if (result.success) {
            setWalletData(result.data);
        } else {
            toast.error(result.error || "Failed to load wallet data");
        }
        setIsLoading(false);
    }

    async function handleAddFunds() {
        if (!amountToAdd || isNaN(Number(amountToAdd))) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsAddingFunds(true);
        const result = await addFundsToWallet(Number(amountToAdd));
        if (result.success) {
            toast.success(`Successfully added ₹${amountToAdd} to wallet`);
            setIsAddingFunds(false);
            setAmountToAdd("");
            fetchWalletData();
        } else {
            toast.error(result.error || "Failed to add funds");
            setIsAddingFunds(false);
        }
    }

    async function handleAddMethod() {
        if (newMethod.last4.length !== 4 || !newMethod.expiry) {
            toast.error("Please provide valid card details");
            return;
        }

        const result = await savePaymentMethod(newMethod);
        if (result.success) {
            toast.success("Payment method added");
            setIsAddingMethod(false);
            setNewMethod({ type: "Visa", last4: "", expiry: "", isDefault: false });
            fetchWalletData();
        } else {
            toast.error(result.error || "Failed to save method");
        }
    }

    async function handleDeleteMethod(id: string) {
        if (!confirm("Are you sure you want to remove this payment method?")) return;

        const result = await deletePaymentMethod(id);
        if (result.success) {
            toast.success("Payment method removed");
            fetchWalletData();
        } else {
            toast.error(result.error || "Failed to remove method");
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
        transactions: [],
        paymentMethods: []
    };

    return (
        <div className="min-h-full p-10 bg-gray-50">
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
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddingFunds(false)}>Cancel</Button>
                                <Button onClick={handleAddFunds} className="bg-blue-600">Add Now</Button>
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
                            {data.paymentMethods.length > 0 ? (
                                <span className="flex items-center gap-1">
                                    <CreditCard className="w-4 h-4" />
                                    {data.paymentMethods.find((m: any) => m.isDefault)?.type || data.paymentMethods[0].type} •••• {data.paymentMethods.find((m: any) => m.isDefault)?.last4 || data.paymentMethods[0].last4}
                                </span>
                            ) : (
                                <span>No payment methods added</span>
                            )}
                            <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                            <span>Secure Powered by Razorpay</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-14 px-8 rounded-2xl text-base font-bold">
                            <History className="w-5 h-5 mr-2" />
                            Transaction History
                        </Button>
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
                            <p className="text-green-500 text-xs font-bold">+0% this month</p>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 flex items-center gap-6 bg-white">
                        <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
                            <Landmark className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">IN ESCROW</p>
                            <h2 className="text-3xl font-bold text-gray-900 mb-1">₹{data.inEscrow.toLocaleString()}</h2>
                            <p className="text-gray-400 text-sm">Active campaign funds</p>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 flex items-center gap-6 bg-white">
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">WALLET STATUS</p>
                            <h2 className="text-3xl font-bold text-gray-900 mb-1">Active</h2>
                            <p className="text-gray-400 text-sm">Ready for campaigns</p>
                        </div>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-8">
                    {/* Recent Transactions */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl text-gray-900">Recent Transactions</h3>
                            <div className="flex gap-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-10 text-sm font-semibold border-gray-200 text-gray-600 rounded-xl px-4">
                                            <Filter className="w-4 h-4 mr-2" />
                                            {filterStatus === 'ALL' ? 'All Transactions' : filterStatus}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setFilterStatus("ALL")}>All Transactions</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilterStatus("DEBIT")}>Payments</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilterStatus("CREDIT")}>Deposits</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button variant="outline" className="h-10 text-sm font-semibold border-gray-200 text-gray-600 rounded-xl px-4">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                            {data.transactions.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-4 px-8 py-5 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <span>Influencer / Source</span>
                                        <span>Campaign</span>
                                        <span>Amount</span>
                                        <span className="text-right">Status</span>
                                    </div>

                                    <div className="divide-y divide-gray-50">
                                        {data.transactions
                                            .filter((tx: any) => filterStatus === 'ALL' || tx.type.toUpperCase() === filterStatus)
                                            .map((tx: any, i: number) => (
                                                <div key={i} className="grid grid-cols-4 px-8 py-6 hover:bg-gray-50 transition-colors items-center">
                                                    <div>
                                                        <p className="font-bold text-gray-900 truncate">{tx.influencer}</p>
                                                        <p className="text-xs text-gray-500">{tx.date}</p>
                                                    </div>
                                                    <span className="text-sm text-gray-600">{tx.campaign}</span>
                                                    <span className={`font-bold ${tx.type === 'Debit' ? 'text-gray-900' : 'text-green-600'}`}>
                                                        {tx.type === 'Debit' ? '-' : '+'}{tx.amount}
                                                    </span>
                                                    <div className="text-right">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${tx.status === 'Paid' || tx.status === 'Completed' || tx.status === 'RELEASED'
                                                            ? 'bg-green-50 text-green-600'
                                                            : tx.status === 'Escrow' || tx.status === 'FUNDED'
                                                                ? 'bg-yellow-50 text-yellow-600'
                                                                : 'bg-gray-50 text-gray-600'
                                                            }`}>
                                                            {tx.status}
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

                            <div className="p-6 text-center bg-gray-50/30">
                                <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                    View Detailed Statement
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 mb-6">Payment Methods</h3>
                            <Card className="rounded-[2.5rem] border-none shadow-sm p-6 bg-white">
                                <div className="space-y-4">
                                    {data.paymentMethods.length > 0 ? (
                                        data.paymentMethods.map((method: any) => (
                                            <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-blue-50 hover:bg-blue-50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm transition-colors">
                                                        <CreditCard className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{method.type} •••• {method.last4}</p>
                                                        <p className="text-xs text-gray-400">Expires {method.expiry}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {method.isDefault && (
                                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">DEFAULT</span>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteMethod(method.id)}
                                                        className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm">
                                            No payment methods saved.
                                        </div>
                                    )}

                                    <Dialog open={isAddingMethod} onOpenChange={setIsAddingMethod}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-bold border-dashed border-gray-200 hover:border-blue-500 hover:text-blue-600">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add New Method
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Payment Method</DialogTitle>
                                                <DialogDescription>
                                                    Securely add your credit or debit card for faster payments.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label>Card Type</Label>
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            value={newMethod.type}
                                                            onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                                                        >
                                                            <option>Visa</option>
                                                            <option>Mastercard</option>
                                                            <option>RuPay</option>
                                                            <option>Amex</option>
                                                        </select>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Last 4 Digits</Label>
                                                        <Input
                                                            maxLength={4}
                                                            placeholder="4242"
                                                            value={newMethod.last4}
                                                            onChange={(e) => setNewMethod({ ...newMethod, last4: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Expiry Date (MM/YY)</Label>
                                                    <Input
                                                        placeholder="12/26"
                                                        value={newMethod.expiry}
                                                        onChange={(e) => setNewMethod({ ...newMethod, expiry: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="default"
                                                        checked={newMethod.isDefault}
                                                        onChange={(e) => setNewMethod({ ...newMethod, isDefault: e.target.checked })}
                                                    />
                                                    <Label htmlFor="default" className="text-sm">Set as default payment method</Label>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddingMethod(false)}>Cancel</Button>
                                                <Button onClick={handleAddMethod} className="bg-blue-600">Save Method</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </Card>
                        </div>

                        <div>
                            <h3 className="font-bold text-xl text-gray-900 mb-6">Billing Info</h3>
                            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">GST Invoice Details</p>
                                        <p className="text-xs text-gray-400">Not provided</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full rounded-xl text-sm font-bold h-12">
                                    Update Billing Info
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
