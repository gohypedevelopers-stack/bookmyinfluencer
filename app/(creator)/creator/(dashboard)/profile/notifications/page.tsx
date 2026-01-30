"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
    Megaphone,
    CreditCard,
    Heart,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function NotificationsPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/creator/profile">
                        <button className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Notification Preferences</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium">
                        Reset to Default
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-lg px-6">
                        Save Preferences
                    </Button>
                </div>
            </div>

            <div className="max-w-3xl">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Manage Alerts</h2>
                    <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified about your campaign activity and account updates.</p>
                </div>

                <div className="space-y-5">
                    {/* Campaign Alerts */}
                    <NotificationCategoryCard
                        title="Campaign Alerts"
                        description="Updates on new deals, approvals, and deadlines"
                        icon={Megaphone}
                        iconColor="text-purple-600"
                        iconBg="bg-purple-50"
                        activeColor="bg-purple-500"
                    >
                        <NotificationRow
                            title="New Campaign Opportunities"
                            description="Be the first to see new brand deals matching your profile"
                            defaultValues={{ push: false, email: true, sms: false }}
                            activeColor="data-[state=checked]:bg-purple-500"
                        />
                        <NotificationRow
                            title="Submission Approvals"
                            description="Get notified when a brand approves your content or concept"
                            defaultValues={{ push: true, email: false, sms: false }}
                            activeColor="data-[state=checked]:bg-purple-500"
                        />
                    </NotificationCategoryCard>

                    {/* Payment Updates */}
                    <NotificationCategoryCard
                        title="Payment Updates"
                        description="Transactional emails and earnings milestones"
                        icon={CreditCard}
                        iconColor="text-blue-600"
                        iconBg="bg-blue-50"
                        activeColor="bg-blue-500"
                    >
                        <NotificationRow
                            title="Payment Processed"
                            description="Confirmation when funds are sent to your account"
                            defaultValues={{ push: true, email: true, sms: true }}
                            activeColor="data-[state=checked]:bg-blue-600"
                        />
                        <NotificationRow
                            title="Tax Documents"
                            description="Important yearly tax forms and compliance alerts"
                            defaultValues={{ push: false, email: true, sms: false }}
                            activeColor="data-[state=checked]:bg-blue-600"
                        />
                    </NotificationCategoryCard>

                    {/* Social Activity */}
                    <NotificationCategoryCard
                        title="Social Activity"
                        description="Interactions from other creators and brands"
                        icon={Heart}
                        iconColor="text-pink-600"
                        iconBg="bg-pink-50"
                        activeColor="bg-pink-500"
                    >
                        <NotificationRow
                            title="Profile Visits & Likes"
                            description="Weekly digest of brands who viewed your profile"
                            defaultValues={{ push: true, email: false, sms: false }}
                            activeColor="data-[state=checked]:bg-pink-500"
                        />
                        <NotificationRow
                            title="Messages & Direct Outreach"
                            description="Real-time alerts for brand chat messages"
                            defaultValues={{ push: true, email: true, sms: false }}
                            activeColor="data-[state=checked]:bg-pink-500"
                        />
                    </NotificationCategoryCard>
                </div>
            </div>
        </div>
    )
}

function NotificationCategoryCard({ title, description, icon: Icon, iconColor, iconBg, activeColor, children }: any) {
    return (
        <Card className="rounded-[1.5rem] border-gray-100 shadow-sm p-6 bg-white">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-base text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4 border-b border-gray-50 pb-2">
                    <div className="col-span-6"></div>
                    <div className="col-span-2 text-center text-[9px] font-bold text-gray-400 uppercase tracking-wider">Push</div>
                    <div className="col-span-2 text-center text-[9px] font-bold text-gray-400 uppercase tracking-wider">Email</div>
                    <div className="col-span-2 text-center text-[9px] font-bold text-gray-400 uppercase tracking-wider">SMS</div>
                </div>
                {children}
            </div>
        </Card>
    )
}

function NotificationRow({ title, description, defaultValues, activeColor }: any) {
    return (
        <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-6">
                <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <div className="col-span-2 flex justify-center">
                <Switch className={activeColor} defaultChecked={defaultValues.push} />
            </div>
            <div className="col-span-2 flex justify-center">
                <Switch className={activeColor} defaultChecked={defaultValues.email} />
            </div>
            <div className="col-span-2 flex justify-center">
                <Switch className={activeColor} defaultChecked={defaultValues.sms} />
            </div>
        </div>
    )
}
