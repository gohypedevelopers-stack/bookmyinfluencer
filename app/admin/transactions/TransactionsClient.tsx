"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    ArrowUpRight,
    ArrowDownLeft,
    ShieldCheck,
    Wallet,
    ArrowLeftRight,
    Landmark,
    Search,
    Coins,
    Calendar,
    Filter,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Transaction {
    id: string;
    date: string | Date;
    type: string;
    amount: number;
    status: string;
    reference: string;
    desc: string;
    from: string;
    to: string;
}

interface TransactionsClientProps {
    initialTransactions: Transaction[];
    totalDeposits: number;
    totalEscrow: number;
    totalPayouts: number;
}

export default function TransactionsClient({
    initialTransactions,
    totalDeposits,
    totalEscrow,
    totalPayouts
}: TransactionsClientProps) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTab, setSelectedTab] = useState<"ALL" | "DEPOSIT" | "ESCROW" | "PAYOUT">("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Filter logic
    const filteredTransactions = transactions.filter(tx => {
        // Tab type filter
        if (selectedTab !== "ALL" && tx.type !== selectedTab) return false;

        // Status filter
        if (statusFilter !== "ALL") {
            const isCompleted = tx.status === 'COMPLETED' || tx.status === 'CAPTURED' || tx.status === 'SUCCESS' || tx.status === 'RELEASED';
            const isPending = tx.status === 'PENDING' || tx.status === 'HELD' || tx.status === 'CREATED';
            const isFailed = tx.status === 'FAILED' || tx.status === 'REFUNDED';

            if (statusFilter === 'COMPLETED' && !isCompleted) return false;
            if (statusFilter === 'PENDING' && !isPending) return false;
            if (statusFilter === 'FAILED' && !isFailed) return false;
        }

        // Search text filter
        const query = searchTerm.toLowerCase();
        return (
            tx.desc.toLowerCase().includes(query) ||
            tx.reference.toLowerCase().includes(query) ||
            tx.from.toLowerCase().includes(query) ||
            tx.to.toLowerCase().includes(query) ||
            tx.type.toLowerCase().includes(query) ||
            tx.status.toLowerCase().includes(query)
        );
    });

    const getStatusIcon = (status: string) => {
        const isCompleted = status === 'COMPLETED' || status === 'CAPTURED' || status === 'SUCCESS' || status === 'RELEASED';
        const isPending = status === 'PENDING' || status === 'HELD' || status === 'CREATED';
        
        if (isCompleted) return <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-1" />;
        if (isPending) return <Clock className="w-3.5 h-3.5 text-amber-500 mr-1" />;
        return <XCircle className="w-3.5 h-3.5 text-red-500 mr-1" />;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Financial Ledger</h1>
                <p className="text-gray-500 mt-1">Monitor all platform transactions, funding deposits, and influencer payouts.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Deposits */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Deposits (Razorpay)</span>
                        <h3 className="text-3xl font-black text-gray-900">₹{totalDeposits.toLocaleString('en-IN')}</h3>
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Gross Inflow
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                        <Wallet className="w-6 h-6" />
                    </div>
                </div>

                {/* Escrow */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Active Escrow (Held)</span>
                        <h3 className="text-3xl font-black text-gray-900">₹{totalEscrow.toLocaleString('en-IN')}</h3>
                        <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Secured Funds
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                        <ArrowLeftRight className="w-6 h-6" />
                    </div>
                </div>

                {/* Payouts */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Creator Payouts (UTR)</span>
                        <h3 className="text-3xl font-black text-gray-900">₹{totalPayouts.toLocaleString('en-IN')}</h3>
                        <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Distributed Earnings
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                        <Landmark className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Interactive Filters Panel */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                {/* Tabs */}
                <div className="flex bg-gray-100 p-1.5 rounded-xl self-start sm:self-auto">
                    <button
                        onClick={() => setSelectedTab("ALL")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            selectedTab === "ALL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setSelectedTab("DEPOSIT")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            selectedTab === "DEPOSIT" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        Deposits
                    </button>
                    <button
                        onClick={() => setSelectedTab("ESCROW")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            selectedTab === "ESCROW" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        Escrows
                    </button>
                    <button
                        onClick={() => setSelectedTab("PAYOUT")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            selectedTab === "PAYOUT" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        Payouts
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-1 sm:flex-none w-full sm:w-auto items-center gap-3">
                    {/* Dropdown status */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer text-gray-600"
                        >
                            <option value="ALL">Status: All</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending / Held</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reference, campaign, name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Transaction Details</th>
                                <th className="px-6 py-4">Parties</th>
                                <th className="px-6 py-4">UTR/Gateway Ref</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                                tx.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' :
                                                tx.type === 'ESCROW' ? 'bg-blue-50 text-blue-600' :
                                                'bg-indigo-50 text-indigo-600'
                                            }`}>
                                                {tx.type === 'DEPOSIT' ? <Wallet className="w-4.5 h-4.5" /> :
                                                 tx.type === 'ESCROW' ? <ArrowLeftRight className="w-4.5 h-4.5" /> :
                                                 <Landmark className="w-4.5 h-4.5" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{tx.desc}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{tx.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-600 font-medium">
                                            <span className="font-bold text-gray-900">From:</span> {tx.from}
                                        </div>
                                        <div className="text-xs text-gray-600 font-medium mt-0.5">
                                            <span className="font-bold text-gray-900">To:</span> {tx.to}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-xs font-mono bg-gray-50 px-2.5 py-1 rounded border border-gray-100 text-gray-700">
                                            {tx.reference}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                                        {format(new Date(tx.date), "MMM d, yyyy HH:mm")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                                            tx.status === 'COMPLETED' || tx.status === 'CAPTURED' || tx.status === 'SUCCESS' || tx.status === 'RELEASED' ? 'bg-green-50 text-green-700' :
                                            tx.status === 'PENDING' || tx.status === 'HELD' || tx.status === 'CREATED' ? 'bg-amber-50 text-amber-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>
                                            {getStatusIcon(tx.status)}
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-black text-base ${
                                        tx.type === 'DEPOSIT' ? 'text-emerald-600' :
                                        tx.type === 'ESCROW' ? 'text-blue-600' :
                                        'text-indigo-600'
                                    }`}>
                                        {tx.type === 'DEPOSIT' ? '+' : tx.type === 'ESCROW' ? '🔒' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                                        <Coins className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                        No transactions found matching "{searchTerm || selectedTab || statusFilter}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
