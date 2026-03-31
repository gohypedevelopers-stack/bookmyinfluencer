"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Bell,
    BriefcaseBusiness,
    ChevronRight,
    CreditCard,
    FileText,
    LayoutDashboard,
    LogOut,
    Sparkles,
} from 'lucide-react';
import { signOut } from "next-auth/react"

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const navItems = [
        { href: "/manager", label: "Dashboard", icon: LayoutDashboard },
        { href: "/manager/campaigns", label: "Campaigns", icon: FileText },
        { href: "/manager/payouts", label: "Payouts", icon: CreditCard },
    ];

    const sectionTitle = pathname.startsWith('/manager/payouts')
        ? 'Payout Oversight'
        : pathname.startsWith('/manager/campaigns')
            ? 'Campaign Execution'
            : 'Manager Dashboard';

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eff4ff_45%,#f8fafc_100%)] font-sans text-slate-900">
            <aside className="fixed inset-y-0 z-50 flex w-72 flex-col border-r border-white/70 bg-white/88 px-5 py-6 backdrop-blur-xl">
                <div className="flex items-center gap-4 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_48%,#4f46e5_100%)] p-5 text-white shadow-[0_28px_80px_-48px_rgba(79,70,229,0.9)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                        <BriefcaseBusiness className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black leading-tight">Manager Hub</h1>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100">Execution Desk</p>
                    </div>
                </div>

                <div className="mt-8">
                    <p className="px-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Workspace</p>
                </div>

                <nav className="mt-3 flex-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || (item.href !== '/manager' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center justify-between rounded-[22px] px-4 py-3.5 transition-all ${
                                    active
                                        ? 'bg-[linear-gradient(135deg,#eef2ff_0%,#ede9fe_100%)] text-indigo-700 shadow-[0_16px_40px_-28px_rgba(99,102,241,0.65)]'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <span className="flex items-center gap-3 text-sm font-bold">
                                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-white'}`}>
                                        <Icon className="h-4.5 w-4.5" />
                                    </span>
                                    {item.label}
                                </span>
                                <ChevronRight className={`h-4 w-4 transition ${active ? 'opacity-100 text-indigo-500' : 'opacity-0 group-hover:opacity-100'}`} />
                            </Link>
                        );
                    })}
                </nav>

                <div className="rounded-[28px] border border-indigo-100 bg-[linear-gradient(180deg,#f8faff_0%,#eef2ff_100%)] p-4 shadow-[0_20px_50px_-42px_rgba(79,70,229,0.75)]">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-2xl bg-indigo-500/10 p-2 text-indigo-600">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Ops Note</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Manager keeps brand and creator channels separate while delivery stays on track.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-3 rounded-[24px] bg-slate-50 px-4 py-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4f46e5_0%,#7c3aed_100%)] text-lg font-black text-white shadow-[0_18px_32px_-18px_rgba(79,70,229,0.75)]">
                            M
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-black text-slate-900">Project Manager</div>
                            <div className="text-xs font-medium text-slate-500">Manager-led operations</div>
                        </div>
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="mt-3 flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </button>
                </div>
            </aside>

            <div className="ml-72 flex min-h-screen min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-40 border-b border-white/70 bg-white/78 px-8 py-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-6">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Manager Workspace</p>
                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{sectionTitle}</h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 lg:block">
                                Separate brand and creator rooms
                            </div>
                            <button className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:text-slate-800">
                                <Bell className="h-5 w-5" />
                                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500"></span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
