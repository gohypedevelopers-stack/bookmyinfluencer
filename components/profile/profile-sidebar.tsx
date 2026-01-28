"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
    User,
    Share2,
    CreditCard,
    Shield,
    Bell,
    LogOut
} from "lucide-react"

export function CreatorProfileSidebar() {
    const pathname = usePathname()

    const navItems = [
        {
            name: "Personal Info",
            href: "/creator/profile",
            icon: User
        },
        {
            name: "Social Accounts",
            href: "/creator/profile/social-accounts",
            icon: Share2
        },
        {
            name: "Pricing & Payouts",
            href: "/creator/profile/pricing",
            icon: CreditCard
        },
        {
            name: "Security",
            href: "/creator/profile/security",
            icon: Shield
        },
        {
            name: "Notifications",
            href: "/creator/profile/notifications",
            icon: Bell
        }
    ]

    return (
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
            {/* Branding */}
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        E
                    </div>
                    <span className="text-xl font-bold text-gray-900">Elite Hub</span>
                </div>
            </div>

            <div className="flex-1 px-4 py-4">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account Settings</p>
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href

                        return (
                            <Link href={item.href} key={item.href}>
                                <div
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                                    {item.name}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Bottom User Profile */}
            <div className="p-6 border-t border-gray-100 mb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                            <Image
                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100"
                                alt="User"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-gray-900">Alex Sterling</div>
                            <div className="text-xs text-gray-500">Pro Plan</div>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
