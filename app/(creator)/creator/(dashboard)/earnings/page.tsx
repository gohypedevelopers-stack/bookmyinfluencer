"use client"

import Link from "next/link"
import Image from "next/image"
import {
    BarChart3,
    LayoutDashboard,
    Megaphone,
    Wallet,
    MessageSquare,
    Settings,
    Download,
    History,
    Landmark,
    Hourglass,
    TrendingUp,
    Filter,
    FileText,
    Loader2,
    Check,
    QrCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCreatorEarnings, requestPayout } from "@/app/(creator)/creator/actions"

export default function CreatorEarningsPage() {
    const [earnings, setEarnings] = useState<{
        availableBalance: number;
        pendingEscrow: number;
        lifetimeEarnings: number;
        transactions: any[];
        payoutMethods: any[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // Filter State
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    useEffect(() => {
        fetchEarnings();
    }, []);

    async function fetchEarnings() {
        try {
            const data = await getCreatorEarnings();
            setEarnings(data);
        } catch (error) {
            toast.error("Failed to fetch earnings");
        } finally {
            setLoading(false);
        }
    }

    async function handleWithdraw() {
        if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
            toast.error("Please enter a valid amount");
            return;
        }

        const amount = Number(withdrawAmount);
        if (amount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        if (earnings && amount > earnings.availableBalance) {
            toast.error("Insufficient funds");
            return;
        }

        setIsWithdrawing(true);
        try {
            const result = await requestPayout(amount);
            if (result.success) {
                toast.success("Withdrawal requested successfully");
                setIsWithdrawOpen(false);
                setWithdrawAmount("");
                fetchEarnings();
            } else {
                toast.error(result.error || "Failed to request withdrawal");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsWithdrawing(false);
        }
    }

    // Export Functionality
    const handleExport = () => {
        if (!earnings?.transactions || earnings.transactions.length === 0) {
            toast.error("No transactions to export");
            return;
        }

        const headers = ["Brand", "Date", "Amount", "Status"];
        const csvContent = [
            headers.join(","),
            ...earnings.transactions.map(tx => {
                return [
                    `"${tx.brand}"`,
                    `"${tx.date}"`,
                    `"${tx.amount}"`,
                    `"${tx.status}"`
                ].join(",")
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `earnings_transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter Logic
    const filteredTransactions = earnings?.transactions.filter(tx => {
        if (filterStatus === "ALL") return true;
        if (filterStatus === "COMPLETED") return tx.status === 'Completed' || tx.status === 'PAID';
        if (filterStatus === "PENDING") return tx.status === 'PROCESSING' || tx.status === 'REQUESTED' || tx.status === 'FUNDED';
        if (filterStatus === "WITHDRAWAL") return tx.brand === 'Withdrawal';
        return true;
    }) || [];

    if (loading) {
        return <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>;
    }

    return (
        <div className="h-full overflow-y-auto p-10 bg-gray-50">

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] p-10 mb-8 border border-blue-100 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
                        <Wallet className="w-4 h-4" />
                        Available to Withdraw
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-2">
                        {earnings ? `₹${earnings.availableBalance.toFixed(2)}` : "₹0.00"}
                    </h1>
                    <p className="text-gray-400 text-sm">Automatic transfer scheduled for Oct 24, 2024</p>
                </div>

                <div className="flex gap-4">
                    <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                        <DialogTrigger asChild>
                            <Button
                                disabled
                                className="bg-gray-300 text-gray-500 cursor-not-allowed h-14 px-8 rounded-2xl shadow-none text-base font-bold"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Withdrawals Paused
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Withdrawals Paused</DialogTitle>
                                <DialogDescription>
                                    As per new policy, payouts are processed manually by the manager upon campaign completion. You do not need to request withdrawals manually.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button onClick={() => setIsWithdrawOpen(false)}>Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Link href="/creator/profile/pricing">
                        <Button variant="outline" className="bg-white border-none text-gray-900 h-14 px-8 rounded-2xl shadow-sm hover:bg-gray-50 text-base font-bold">
                            <History className="w-5 h-5 mr-2" />
                            Payout Settings
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 flex items-center gap-6">
                    <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
                        <Hourglass className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">PENDING ESCROW</p>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">
                            {earnings ? `₹${earnings.pendingEscrow.toFixed(2)}` : "₹0.00"}
                        </h2>
                        <p className="text-gray-400 text-sm">Locked for active campaigns</p>
                    </div>
                </Card>

                <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">LIFETIME EARNINGS</p>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">
                            {earnings ? `₹${earnings.lifetimeEarnings.toFixed(2)}` : "₹0.00"}
                        </h2>
                        <p className="text-green-500 text-xs font-bold">+22% from last year</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-12 gap-8 mb-8">
                {/* Income Trends Chart */}
                <Card className="col-span-8 rounded-[2rem] border-gray-100 shadow-sm p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Income Trends</h3>
                            <p className="text-gray-400 text-sm">Earnings performance over 6 months</p>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-1 flex text-xs font-bold">
                            <button className="px-3 py-1 bg-white rounded shadow-sm text-gray-900">6M</button>
                            <button className="px-3 py-1 text-gray-400 hover:text-gray-600">1Y</button>
                        </div>
                    </div>

                    {/* Bar Chart Placeholder */}
                    <div className="h-64 w-full flex items-end justify-between px-4 pb-2 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-full h-px bg-gray-50"></div>
                            ))}
                        </div>

                        {/* Bars */}
                        <div className="w-16 bg-blue-50 rounded-t-xl h-[30%] relative z-10 hover:bg-blue-100 transition-colors group"></div>
                        <div className="w-16 bg-blue-50 rounded-t-xl h-[45%] relative z-10 hover:bg-blue-100 transition-colors group"></div>
                        <div className="w-16 bg-blue-50 rounded-t-xl h-[40%] relative z-10 hover:bg-blue-100 transition-colors group"></div>
                        <div className="w-16 bg-blue-50 rounded-t-xl h-[60%] relative z-10 hover:bg-blue-100 transition-colors group"></div>
                        <div className="w-16 bg-blue-50 rounded-t-xl h-[55%] relative z-10 hover:bg-blue-100 transition-colors group"></div>
                        <div className="w-16 bg-blue-200 rounded-t-xl h-[80%] relative z-10 hover:bg-blue-300 transition-colors group border-t-4 border-blue-500 shadow-lg shadow-blue-100"></div>
                    </div>
                    <div className="flex justify-between px-6 pt-4 text-xs font-bold text-gray-400 uppercase">
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                        <span className="text-blue-600">Oct</span>
                    </div>
                </Card>

                {/* Payout Method */}
                <Card className="col-span-4 rounded-[2rem] border-gray-100 shadow-sm p-8">
                    <h3 className="font-bold text-lg text-gray-900 mb-6">Payout Method</h3>

                    {earnings?.payoutMethods && earnings.payoutMethods.length > 0 ? (
                        <div className="border border-gray-100 rounded-2xl p-6 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600">
                                    {earnings.payoutMethods[0].type === 'BANK' ? <Landmark className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">
                                        {earnings.payoutMethods[0].type === 'BANK' ? earnings.payoutMethods[0].bankName : 'UPI ID'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {earnings.payoutMethods[0].type === 'BANK'
                                            ? `Ending in •••• ${earnings.payoutMethods[0].accountLast4}`
                                            : earnings.payoutMethods[0].upiId}
                                    </p>
                                </div>
                            </div>
                            <Link href="/creator/profile/pricing">
                                <button className="text-blue-500 text-xs font-bold hover:underline">Edit</button>
                            </Link>
                        </div>
                    ) : (
                        <div className="border border-dashed border-gray-200 rounded-2xl p-6 mb-6 text-center">
                            <p className="text-xs text-gray-400 mb-3">No payout method connected</p>
                            <Link href="/creator/profile/pricing">
                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold">Connect Now</Button>
                            </Link>
                        </div>
                    )}

                    <div className="space-y-4 mb-6 pt-2 border-t border-gray-50">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Service Fee (2%)</span>
                            <span className="font-bold text-gray-900">-₹{((earnings?.availableBalance || 0) * 0.02).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Platform Tax</span>
                            <span className="font-bold text-gray-900">-₹0.00</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                        <span className="font-bold text-gray-500 text-sm">Net Available</span>
                        <span className="font-bold text-2xl text-gray-900">
                            ₹{((earnings?.availableBalance || 0) * 0.98).toFixed(2)}
                        </span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900">Transaction History</h3>
                        <div className="flex gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-9 text-xs font-bold border-gray-200 text-gray-600">
                                        <Filter className="w-3 h-3 mr-2" />
                                        {filterStatus === 'ALL' ? 'Filter' : filterStatus}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setFilterStatus("ALL")}>
                                        <div className="flex items-center justify-between w-full">
                                            All {filterStatus === "ALL" && <Check className="w-3 h-3 ml-2" />}
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterStatus("COMPLETED")}>
                                        <div className="flex items-center justify-between w-full">
                                            Completed {filterStatus === "COMPLETED" && <Check className="w-3 h-3 ml-2" />}
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterStatus("PENDING")}>
                                        <div className="flex items-center justify-between w-full">
                                            Pending {filterStatus === "PENDING" && <Check className="w-3 h-3 ml-2" />}
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterStatus("WITHDRAWAL")}>
                                        <div className="flex items-center justify-between w-full">
                                            WithdrawalsOnly {filterStatus === "WITHDRAWAL" && <Check className="w-3 h-3 ml-2" />}
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                className="h-9 text-xs font-bold border-gray-200 text-gray-600"
                                onClick={handleExport}
                            >
                                <Download className="w-3 h-3 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-4 px-8 py-4 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                            <span>Brand</span>
                            <span>Date</span>
                            <span>Amount</span>
                            <span className="text-right">Status</span>
                        </div>
                        {isWithdrawOpen && <div className="hidden">Hack to prevent unused var warning if I don't use it in JSX yet</div>}
                        {filteredTransactions.map((tx, i) => (
                            <div key={i} className="grid grid-cols-4 px-8 py-5 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center text-sm">
                                <span className="font-bold text-gray-900">{tx.brand}</span>
                                <span className="text-gray-500">{tx.date}</span>
                                <span className={`font-bold ${tx.isDebit ? 'text-red-500' : 'text-green-600'}`}>{tx.amount}</span>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${tx.status === 'Completed' || tx.status === 'PAID'
                                        ? 'bg-green-50 text-green-600'
                                        : tx.status === 'PROCESSING' || tx.status === 'REQUESTED'
                                            ? 'bg-yellow-50 text-yellow-600'
                                            : 'bg-gray-50 text-gray-600'
                                        }`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <div className="p-8 text-center text-gray-400">No transactions found.</div>
                        )}
                        <div className="p-4 text-center">
                            <button className="text-sm font-bold text-gray-400 hover:text-gray-600">View All Transactions</button>
                        </div>
                    </div>
                </div>

                <div className="col-span-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-6">Tax Documents</h3>
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 space-y-4">
                        {[2023, 2022, 2021].map((year) => (
                            <div key={year} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">1099-NEC</p>
                                        <p className="text-xs text-gray-400">{year} Tax Year</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    )
}
