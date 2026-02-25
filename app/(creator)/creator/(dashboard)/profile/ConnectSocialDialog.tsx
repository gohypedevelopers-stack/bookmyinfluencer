"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Instagram, Youtube, Loader2, Plus, Settings, Twitch } from "lucide-react"
import { updateSocialProfile } from "./actions"
import { useRouter } from "next/navigation"

type SocialProvider = "instagram" | "youtube" | "twitch"

interface ConnectSocialDialogProps {
    children?: React.ReactNode
    provider: SocialProvider
    defaultUrl?: string
    defaultFollowerCount?: number
}

const PROVIDER_CONFIG = {
    instagram: {
        label: "Instagram",
        icon: Instagram,
        placeholder: "https://instagram.com/username",
        colorClass: "text-purple-600",
        hoverBorder: "hover:border-purple-300",
        hoverBg: "hover:bg-purple-50/30",
        btnClass: "bg-purple-600 hover:bg-purple-700"
    },
    youtube: {
        label: "YouTube",
        icon: Youtube,
        placeholder: "https://youtube.com/@username",
        colorClass: "text-red-600",
        hoverBorder: "hover:border-red-300",
        hoverBg: "hover:bg-red-50/30",
        btnClass: "bg-red-600 hover:bg-red-700"
    },

    twitch: {
        label: "Twitch",
        icon: Twitch,
        placeholder: "https://twitch.tv/username",
        colorClass: "text-purple-500",
        hoverBorder: "hover:border-purple-300",
        hoverBg: "hover:bg-purple-50/30",
        btnClass: "bg-purple-500 hover:bg-purple-600"
    }
}

export function ConnectSocialDialog({
    children,
    provider,
    defaultUrl = "",
    defaultFollowerCount
}: ConnectSocialDialogProps) {
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState(defaultUrl)
    const [followerCount, setFollowerCount] = useState(defaultFollowerCount?.toString() || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const config = PROVIDER_CONFIG[provider]

    const handleSubmit = async () => {
        if (!url) return
        setLoading(true)
        setError("")

        try {
            const result = await updateSocialProfile(provider, url, followerCount ? parseInt(followerCount) : 0)
            if (result.error) {
                setError(result.error)
            } else {
                setOpen(false)
                router.refresh()
            }
        } catch (e) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children ? (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <div
                        className={`flex items-center justify-between p-5 border border-dashed border-gray-300 rounded-2xl ${config.hoverBorder} ${config.hoverBg} transition-all cursor-pointer group bg-gray-50/50`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 group-hover:${config.colorClass} group-hover:border-opacity-50 transition-colors shadow-sm`}>
                                <config.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className={`font-bold text-gray-900 group-hover:${config.colorClass} transition-colors`}>Connect {config.label}</div>
                                <div className="text-sm text-gray-500">Add your profile URL manually</div>
                            </div>
                        </div>
                        <Button variant="ghost" className={`${config.colorClass} font-semibold group-hover:bg-opacity-10`}>
                            Connect
                        </Button>
                    </div>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect {config.label}</DialogTitle>
                    <DialogDescription>
                        Enter your {config.label} profile URL to link your account.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Input
                            placeholder={config.placeholder}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Estimated Follower Count (e.g., 5000)"
                            value={followerCount}
                            onChange={(e) => setFollowerCount(e.target.value)}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                </div>
                <DialogFooter className="flex sm:justify-between flex-col sm:flex-row gap-2">
                    {defaultUrl && (
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!confirm(`Are you sure you want to disconnect ${config.label}?`)) return
                                setLoading(true)
                                try {
                                    const { disconnectSocialProfile } = await import("./actions")
                                    const result = await disconnectSocialProfile(provider)
                                    if (result.error) {
                                        setError(result.error)
                                    } else {
                                        setOpen(false)
                                        router.refresh()
                                    }
                                } catch (e) {
                                    setError("Failed to disconnect")
                                }
                                setLoading(false)
                            }}
                            disabled={loading}
                            className="mr-auto"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disconnect"}
                        </Button>
                    )}
                    <div className="flex gap-2 justify-end w-full sm:w-auto">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading || !url} className={`${config.btnClass} text-white`}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
