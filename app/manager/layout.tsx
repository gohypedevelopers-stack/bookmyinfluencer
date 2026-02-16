"use client"

import Link from 'next/link';
import {
    LayoutDashboard,
    LogOut,
    Search,
    Bell,
    Users,
    FileText,
    CreditCard
} from 'lucide-react';
import { signOut } from "next-auth/react"

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-50">
                <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 leading-tight">Manager Portal</h1>
                        <p className="text-[10px] text-gray-500 font-medium">Campaign Management</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/manager" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 transition-colors text-sm font-medium">
                        <LayoutDashboard className="w-4.5 h-4.5" />
                        Dashboard
                    </Link>
                    <Link href="/manager/campaigns" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 transition-colors text-sm font-medium">
                        <FileText className="w-4.5 h-4.5" />
                        Campaigns
                    </Link>
                    <Link href="/manager/payouts" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 transition-colors text-sm font-medium">
                        <CreditCard className="w-4.5 h-4.5" />
                        Payouts
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2 text-sm font-medium transition-colors w-full"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none text-gray-900 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-gray-900">Manager</div>
                                <div className="text-xs text-gray-500">Campaign Manager</div>
                            </div>
                            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold border-2 border-white shadow-sm ring-1 ring-gray-100">
                                M
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
