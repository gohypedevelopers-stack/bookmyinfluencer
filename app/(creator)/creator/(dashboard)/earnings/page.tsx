"use client"

import Link from "next/link"
import {
    Wallet,
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
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence, type Variants } from "framer-motion"
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
import { getCreatorEarnings, requestPayout } from "@/app/(creator)/creator/actions"

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15
        }
    }
};

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

    const filteredTransactions = earnings?.transactions.filter(tx => {
        if (filterStatus === "ALL") return true;
        if (filterStatus === "COMPLETED") return tx.status === 'Completed' || tx.status === 'PAID';
        if (filterStatus === "PENDING") return tx.status === 'PROCESSING' || tx.status === 'REQUESTED' || tx.status === 'FUNDED';
        if (filterStatus === "WITHDRAWAL") return tx.brand === 'Withdrawal';
        return true;
    }) || [];

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50/50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 md:p-10 bg-slate-50/40">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-w-[1400px] mx-auto"
            >
                {/* Balance Card */}
                <motion.div
                    variants={itemVariants}
                    className="group relative overflow-hidden bg-[linear-gradient(135deg,rgba(99,102,241,0.06)_0%,rgba(167,139,250,0.04)_50%,rgba(255,255,255,0.95)_100%)] rounded-[2.5rem] p-6 md:p-10 mb-8 border border-indigo-100 shadow-[0_20px_50px_-25px_rgba(79,70,229,0.12)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 transition-all duration-300 hover:shadow-[0_28px_60px_-20px_rgba(79,70,229,0.18)]"
                >
                    <div className="pointer-events-none absolute right-[-40px] top-[-60px] h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                    <div>
                        <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.16em] mb-4 bg-indigo-100/60 px-3.5 py-1.5 rounded-full border border-indigo-200/40 shadow-sm transition-all duration-300 hover:bg-indigo-100 hover:border-indigo-300">
                            {/* Upgraded Wallet Icon Badge */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.12, 1],
                                    rotate: [0, 6, -6, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: "easeInOut",
                                }}
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm"
                            >
                                <Wallet className="w-2.5 h-2.5" />
                            </motion.div>
                            Available to Withdraw
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">
                            {earnings ? `₹${earnings.availableBalance.toFixed(2)}` : "₹0.00"}
                        </h1>
                        <p className="text-slate-400 text-sm font-semibold flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Automatic transfer scheduled for Oct 24, 2024
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    disabled
                                    className="bg-slate-200 text-slate-400 cursor-not-allowed h-14 px-8 rounded-2xl shadow-none text-base font-bold transition-all duration-300 hover:bg-slate-200/80"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Withdrawals Paused
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[2rem] border-0 p-6 shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-slate-900">Withdrawals Paused</DialogTitle>
                                    <DialogDescription className="text-sm leading-6 text-slate-500 mt-2">
                                        As per new policy, payouts are processed manually by the manager upon campaign completion. You do not need to request withdrawals manually.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="mt-4">
                                    <Button onClick={() => setIsWithdrawOpen(false)} className="rounded-xl font-bold bg-slate-950 text-white hover:bg-slate-900">Close</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Link href="/creator/profile/pricing">
                            <Button variant="outline" className="group bg-white border border-slate-200 text-slate-900 h-14 px-8 rounded-2xl shadow-sm hover:bg-slate-50 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md">
                                {/* Swing watch history icon */}
                                <motion.div
                                    animate={{ rotate: [-10, 10, -10] }}
                                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                                    className="mr-2 origin-center"
                                >
                                    <History className="w-5 h-5 text-slate-600 transition-colors duration-300 group-hover:text-indigo-600" />
                                </motion.div>
                                Payout Settings
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
                    {/* Pending Escrow */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{
                            y: -6,
                            boxShadow: "0 30px 60px -20px rgba(217, 119, 6, 0.15)",
                            borderColor: "rgba(245, 158, 11, 0.3)"
                        }}
                        className="group relative overflow-hidden rounded-[2.2rem] border border-amber-100 bg-[linear-gradient(135deg,rgba(254,243,199,0.2)_0%,rgba(255,255,255,0.95)_100%)] p-8 flex items-center gap-6 shadow-[0_15px_30px_-15px_rgba(217,119,6,0.08)] transition-all duration-300"
                    >
                        <div className="pointer-events-none absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-amber-500/5 blur-2xl group-hover:scale-115 transition-transform duration-500" />
                        
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-amber-500/15">
                            {/* Slow Flip Hourglass */}
                            <motion.div
                                animate={{
                                    rotate: [0, 180, 180, 360, 360],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 5,
                                    ease: "easeInOut",
                                    times: [0, 0.4, 0.5, 0.9, 1]
                                }}
                            >
                                <Hourglass className="w-8 h-8" />
                            </motion.div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-600/80 uppercase tracking-[0.16em] mb-1">PENDING ESCROW</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                                {earnings ? `₹${earnings.pendingEscrow.toFixed(2)}` : "₹0.00"}
                            </h2>
                            <p className="text-slate-400 text-sm font-semibold flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Locked for active campaigns
                            </p>
                        </div>
                    </motion.div>

                    {/* Lifetime Earnings */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{
                            y: -6,
                            boxShadow: "0 30px 60px -20px rgba(79, 70, 229, 0.15)",
                            borderColor: "rgba(99, 102, 241, 0.3)"
                        }}
                        className="group relative overflow-hidden rounded-[2.2rem] border border-blue-100 bg-[linear-gradient(135deg,rgba(219,234,254,0.2)_0%,rgba(255,255,255,0.95)_100%)] p-8 flex items-center gap-6 shadow-[0_15px_30px_-15px_rgba(79,70,229,0.08)] transition-all duration-300"
                    >
                        <div className="pointer-events-none absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-blue-500/5 blur-2xl group-hover:scale-115 transition-transform duration-500" />

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-500/15">
                            {/* Floating Up Trending Icon */}
                            <motion.div
                                animate={{
                                    y: [-2, 2, -2],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2.5,
                                    ease: "easeInOut"
                                }}
                            >
                                <TrendingUp className="w-8 h-8" />
                            </motion.div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-600/80 uppercase tracking-[0.16em] mb-1">LIFETIME EARNINGS</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                                {earnings ? `₹${earnings.lifetimeEarnings.toFixed(2)}` : "₹0.00"}
                            </h2>
                            <motion.span
                                animate={{
                                    scale: [1, 1.02, 1],
                                    opacity: [0.9, 1, 0.9],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "easeInOut"
                                }}
                                className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                +22% from last year
                            </motion.span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    {/* Income Trends Chart */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-8 rounded-[1.5rem] md:rounded-[2rem] border-gray-100 shadow-sm p-6 md:p-8 bg-white"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="font-bold text-slate-950 text-lg">Income Trends</h3>
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
                    </motion.div>

                    {/* Payout Method */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-4 rounded-[2rem] border border-slate-200/60 shadow-[0_15px_35px_-20px_rgba(15,23,42,0.1)] p-6 md:p-8 bg-white transition-all duration-300 hover:shadow-[0_20px_45px_-15px_rgba(15,23,42,0.14)] flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                Payout Method
                            </h3>

                            {earnings?.payoutMethods && earnings.payoutMethods.length > 0 ? (
                                <div className="border border-indigo-100 bg-indigo-50/10 rounded-2xl p-5 mb-6 flex items-center justify-between transition-all duration-300 hover:bg-indigo-50/30 hover:border-indigo-200 hover:shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                            {earnings.payoutMethods[0].type === 'BANK' ? <Landmark className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-sm text-slate-900">
                                                {earnings.payoutMethods[0].type === 'BANK' ? earnings.payoutMethods[0].bankName : 'UPI ID'}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium">
                                                {earnings.payoutMethods[0].type === 'BANK'
                                                    ? `Ending in •••• ${earnings.payoutMethods[0].accountLast4}`
                                                    : earnings.payoutMethods[0].upiId}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href="/creator/profile/pricing">
                                        <button className="text-indigo-600 text-xs font-black hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/50">Edit</button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="border border-dashed border-slate-200 rounded-2xl p-6 mb-6 text-center bg-slate-50/30">
                                    <p className="text-xs text-slate-400 font-medium mb-3">No payout method connected</p>
                                    <Link href="/creator/profile/pricing">
                                        <Button variant="outline" size="sm" className="h-8 px-4 text-xs font-extrabold border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">Connect Now</Button>
                                    </Link>
                                </div>
                            )}

                            <div className="space-y-4 mb-6 pt-4 border-t border-slate-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">Service Fee (2%)</span>
                                    <span className="font-bold text-slate-800">-₹{((earnings?.availableBalance || 0) * 0.02).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">Platform Tax</span>
                                    <span className="font-bold text-slate-800">-₹0.00</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                            <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Net Available</span>
                            <span className="font-black text-2xl text-slate-900 tracking-tight">
                                ₹{((earnings?.availableBalance || 0) * 0.98).toFixed(2)}
                            </span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Transaction History */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                                Transaction History
                            </h3>
                            <div className="flex gap-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="group h-9 text-xs font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                                            <Filter className="w-3.5 h-3.5 mr-2 text-slate-400 transition-colors group-hover:text-indigo-600" />
                                            {filterStatus === 'ALL' ? 'Filter' : filterStatus}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                                        <DropdownMenuLabel className="font-bold text-slate-900 text-xs">Filter by Status</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-slate-50" />
                                        <DropdownMenuItem onClick={() => setFilterStatus("ALL")} className="font-semibold text-xs py-2 rounded-lg cursor-pointer">
                                            <div className="flex items-center justify-between w-full">
                                                All {filterStatus === "ALL" && <Check className="w-3 h-3 ml-2 text-indigo-600" />}
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilterStatus("COMPLETED")} className="font-semibold text-xs py-2 rounded-lg cursor-pointer">
                                            <div className="flex items-center justify-between w-full">
                                                Completed {filterStatus === "COMPLETED" && <Check className="w-3 h-3 ml-2 text-indigo-600" />}
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilterStatus("PENDING")} className="font-semibold text-xs py-2 rounded-lg cursor-pointer">
                                            <div className="flex items-center justify-between w-full">
                                                Pending {filterStatus === "PENDING" && <Check className="w-3 h-3 ml-2 text-indigo-600" />}
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilterStatus("WITHDRAWAL")} className="font-semibold text-xs py-2 rounded-lg cursor-pointer">
                                            <div className="flex items-center justify-between w-full">
                                                Withdrawals {filterStatus === "WITHDRAWAL" && <Check className="w-3 h-3 ml-2 text-indigo-600" />}
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    variant="outline"
                                    className="group h-9 text-xs font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleExport}
                                >
                                    <Download className="w-3.5 h-3.5 mr-2 text-slate-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-indigo-600" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_15px_35px_-20px_rgba(15,23,42,0.1)] overflow-hidden overflow-x-auto transition-all duration-300 hover:shadow-[0_20px_45px_-15px_rgba(15,23,42,0.14)]">
                            <div className="min-w-[600px]">
                                <div className="grid grid-cols-4 px-6 md:px-8 py-4 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                                    <span>Brand</span>
                                    <span>Date</span>
                                    <span>Amount</span>
                                    <span className="text-right">Status</span>
                                </div>
                                
                                {filteredTransactions.map((tx, i) => (
                                    <div key={i} className="grid grid-cols-4 px-6 md:px-8 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center text-sm font-semibold">
                                        <span className="font-black text-slate-900">{tx.brand}</span>
                                        <span className="text-slate-400 text-xs">{tx.date}</span>
                                        <span className={`font-black ${tx.isDebit ? 'text-rose-500' : 'text-emerald-600'}`}>{tx.amount}</span>
                                        <div className="text-right">
                                            <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${
                                                tx.status === 'Completed' || tx.status === 'PAID'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : tx.status === 'PROCESSING' || tx.status === 'REQUESTED' || tx.status === 'FUNDED'
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {filteredTransactions.length === 0 && (
                                    <div className="p-12 text-center text-slate-400 font-semibold text-sm">No transactions found.</div>
                                )}

                                <div className="p-4 text-center border-t border-slate-50">
                                    <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors tracking-wide uppercase">View All Transactions</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tax Documents */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-4"
                    >
                        <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                            Tax Documents
                        </h3>
                        <Card className="rounded-[1.5rem] md:rounded-[2rem] border-slate-200/60 shadow-[0_15px_35px_-20px_rgba(15,23,42,0.1)] p-6 space-y-4 hover:shadow-[0_20px_45px_-15px_rgba(15,23,42,0.14)] transition-all duration-300">
                            {[2023, 2022, 2021].map((year) => (
                                <div key={year} className="flex items-center justify-between p-4 bg-slate-50/60 border border-slate-100 rounded-xl hover:bg-indigo-50/30 hover:border-indigo-100 cursor-pointer transition-all duration-300 group hover:scale-[1.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 shadow-sm transition-all duration-300 group-hover:border-indigo-200 group-hover:text-indigo-600">
                                            <FileText className="w-5 h-5 transition-transform duration-300 group-hover:scale-105" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-slate-900">1099-NEC</p>
                                            <p className="text-xs text-slate-400 font-medium">{year} Tax Year</p>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-300 transition-all duration-300 group-hover:text-indigo-600 group-hover:translate-y-[-1px]" />
                                </div>
                            ))}
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
