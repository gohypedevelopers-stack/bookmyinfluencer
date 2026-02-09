"use client"

import { useState, useEffect } from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, Check, X, Loader2 } from "lucide-react"
import { getBrandNotifications, handleCollabRequest, markNotificationRead } from "@/app/brand/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link?: string
    createdAt: Date
    read: boolean
}

export function NotificationPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const router = useRouter()

    async function fetchNotifications() {
        setIsLoading(true)
        const res = await getBrandNotifications()
        if (Array.isArray(res)) {
            setNotifications(res as Notification[])
        } else {
            setNotifications(res.notifications as Notification[])
            setUnreadMessageCount(res.unreadMessageCount || 0)
        }
        setIsLoading(false)
    }

    const [unreadMessageCount, setUnreadMessageCount] = useState(0)
    const totalUnread = notifications.filter(n => !n.read).length + unreadMessageCount

    useEffect(() => {
        // Initial fetch
        fetchNotifications()

        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    async function handleAction(notificationId: string, action: 'ACCEPT' | 'REJECT') {
        setProcessingId(notificationId)
        try {
            const result = await handleCollabRequest(notificationId, action)
            if (result.success) {
                toast.success(action === 'ACCEPT' ? "Request Accepted" : "Request Rejected")
                // Remove from list or mark read locally
                setNotifications(prev => prev.filter(n => n.id !== notificationId))
                router.refresh()
            } else {
                toast.error(result.error || "Action failed")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setProcessingId(null)
        }
    }

    async function handleMarkRead(notificationId: string) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        await markNotificationRead(notificationId)
    }

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (open) fetchNotifications()
        }}>
            <PopoverTrigger asChild>
                <button className="w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    {totalUnread > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-xl shadow-xl mr-4" align="end">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <h4 className="font-bold text-sm text-gray-900">Notifications</h4>
                    {totalUnread > 0 && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                            {totalUnread} New
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
                                <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h5 className="font-bold text-sm text-gray-800">{notification.title}</h5>
                                        <button
                                            onClick={() => handleMarkRead(notification.id)}
                                            className="text-gray-300 hover:text-gray-500"
                                            title="Dismiss"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                        {notification.message}
                                    </p>

                                    {notification.type === 'COLLAB_REQUEST' && (
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAction(notification.id, 'ACCEPT')}
                                                disabled={processingId === notification.id}
                                                className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex-1 rounded-lg"
                                            >
                                                {processingId === notification.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="w-3 h-3 mr-1.5" /> Accept
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAction(notification.id, 'REJECT')}
                                                disabled={processingId === notification.id}
                                                className="h-8 border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 font-bold text-xs flex-1 rounded-lg"
                                            >
                                                <X className="w-3 h-3 mr-1.5" /> Reject
                                            </Button>
                                        </div>
                                    )}
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
