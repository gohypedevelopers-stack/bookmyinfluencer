"use client"

import { useState, useEffect, useRef } from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, Check, X, Loader2, MessageSquare, Info, Gift } from "lucide-react"
import { getBrandNotifications, handleCollabRequest, markNotificationRead } from "@/app/brand/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { pusherClient } from "@/lib/pusher"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link?: string
    createdAt: Date
    read: boolean
}

function getNotifIcon(type: string) {
    if (type === 'MESSAGE') return <MessageSquare className="w-4 h-4 text-blue-500" />
    if (type === 'OFFER' || type === 'COLLAB_REQUEST') return <Gift className="w-4 h-4 text-purple-500" />
    return <Info className="w-4 h-4 text-teal-500" />
}

export function NotificationPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [unreadMessageCount, setUnreadMessageCount] = useState(0)
    const [markingAll, setMarkingAll] = useState(false)
    const channelRef = useRef<any>(null)
    const router = useRouter()

    const totalUnread = notifications.filter(n => !n.read).length + unreadMessageCount

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

    // Get user ID and subscribe to Pusher for real-time notifications
    useEffect(() => {
        fetchNotifications()

        // Poll every 30s as fallback
        const interval = setInterval(fetchNotifications, 30000)

        // Subscribe to Pusher for real-time push
        let channel: any = null
        fetch('/api/me')
            .then(r => r.json())
            .then(({ userId }) => {
                if (!userId) return
                channel = pusherClient.subscribe(`user-${userId}`)
                channelRef.current = channel

                channel.bind('notification:new', (data: { notification: Notification }) => {
                    setNotifications(prev => {
                        // Avoid duplicates
                        if (prev.some(n => n.id === data.notification.id)) return prev
                        return [data.notification, ...prev]
                    })
                })
            })
            .catch(() => { /* ignore if not logged in */ })

        return () => {
            clearInterval(interval)
            if (channelRef.current) {
                channelRef.current.unbind_all()
                pusherClient.unsubscribe(channelRef.current.name)
            }
        }
    }, [])

    async function handleAction(notificationId: string, action: 'ACCEPT' | 'REJECT') {
        setProcessingId(notificationId)
        try {
            const result = await handleCollabRequest(notificationId, action)
            if (result.success) {
                toast.success(action === 'ACCEPT' ? "Request Accepted" : "Request Rejected")
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

    async function handleMarkAllRead() {
        setMarkingAll(true)
        try {
            await fetch('/api/notifications/mark-all-read', { method: 'POST' })
            setNotifications([])
            setUnreadMessageCount(0)
        } catch {
            toast.error("Failed to mark all as read")
        } finally {
            setMarkingAll(false)
        }
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
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
                            {totalUnread > 9 ? '9+' : totalUnread}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-xl shadow-xl mr-4" align="end">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900">Notifications</h4>
                        {totalUnread > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                                {totalUnread} New
                            </span>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            disabled={markingAll}
                            className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                            {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Mark all read
                        </button>
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
                                <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-top-1 duration-200 ${!notification.read ? 'bg-blue-50/30' : ''}`}>
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            {getNotifIcon(notification.type)}
                                            <h5 className="font-bold text-sm text-gray-800 leading-tight">{notification.title}</h5>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkRead(notification.id);
                                            }}
                                            className="text-gray-300 hover:text-gray-500 shrink-0"
                                            title="Dismiss"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {notification.link ? (
                                        <Link
                                            href={notification.link}
                                            onClick={() => {
                                                setIsOpen(false);
                                                handleMarkRead(notification.id);
                                            }}
                                            className="block group"
                                        >
                                            <p className="text-xs text-gray-500 leading-relaxed mb-1 group-hover:text-blue-600 transition-colors">
                                                {notification.message}
                                            </p>
                                            <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                View now <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                                            </span>
                                        </Link>
                                    ) : (
                                        <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                            {notification.message}
                                        </p>
                                    )}

                                    {notification.type === 'COLLAB_REQUEST' && (
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAction(notification.id, 'ACCEPT')}
                                                disabled={processingId === notification.id}
                                                className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex-1 rounded-lg"
                                            >
                                                {processingId === notification.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <><Check className="w-3 h-3 mr-1.5" /> Accept</>
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
