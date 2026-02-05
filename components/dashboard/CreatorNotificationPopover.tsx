"use client"

import { useState, useEffect } from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, Check, X, Loader2 } from "lucide-react"
import { getCreatorNotifications, markCreatorNotificationRead } from "@/app/(creator)/creator/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link?: string
    createdAt: Date
    read: boolean
}

export function CreatorNotificationPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const unreadCount = notifications.filter(n => !n.read).length

    async function fetchNotifications() {
        setIsLoading(true)
        const data = await getCreatorNotifications()
        setNotifications(data as Notification[])
        setIsLoading(false)
    }

    useEffect(() => {
        // Initial fetch
        fetchNotifications()

        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    async function handleMarkRead(notificationId: string) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        await markCreatorNotificationRead(notificationId)
    }

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (open) fetchNotifications()
        }}>
            <PopoverTrigger asChild>
                <button className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-xl shadow-xl mr-4" align="end">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <h4 className="font-bold text-sm text-gray-900">Notifications</h4>
                    {unreadCount > 0 && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} New
                        </span>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-8 flex justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-top-1 duration-200 relative group">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h5 className="font-bold text-sm text-gray-800">{notification.title}</h5>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleMarkRead(notification.id);
                                            }}
                                            className="text-gray-300 hover:text-gray-500 p-1"
                                            title="Dismiss"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div onClick={() => handleMarkRead(notification.id)}>
                                        {notification.link ? (
                                            <Link href={notification.link} className="block">
                                                <p className="text-xs text-gray-500 leading-relaxed hover:text-indigo-600 transition-colors">
                                                    {notification.message}
                                                </p>
                                            </Link>
                                        ) : (
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                {notification.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-400 font-medium">
                                        {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center px-6">
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-4 h-4 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">No new notifications</p>
                            <p className="text-xs text-gray-500 mt-1">We'll notify you when something important happens.</p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
