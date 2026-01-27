import Link from 'next/link';
import {
    Users,
    ShieldCheck,
    DollarSign,
    LayoutDashboard,
    LogOut,
    FileText
} from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-100 font-sans flex text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 z-50">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-tight">AdminPanel</h1>
                    <p className="text-xs text-slate-400 mt-1">Marketplace Control</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin/kyc" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
                        <ShieldCheck className="w-5 h-5 text-teal-400" />
                        KYC Verification
                    </Link>
                    <Link href="/admin/transactions" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        Transactions
                    </Link>
                    <Link href="/admin/payouts" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
                        <FileText className="w-5 h-5 text-yellow-400" />
                        Payout Requests
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
                        <Users className="w-5 h-5 text-blue-400" />
                        User Management
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
