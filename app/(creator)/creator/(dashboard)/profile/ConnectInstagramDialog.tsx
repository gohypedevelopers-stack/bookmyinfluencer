"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Instagram, Loader2, Plus } from "lucide-react"
import { updateInstagramUrl } from "./actions"
import { useRouter } from "next/navigation"

export function ConnectInstagramDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState("")
    const [followerCount, setFollowerCount] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async () => {
        if (!url) return
        setLoading(true)
        setError("")

        try {
            const result = await updateInstagramUrl(url, followerCount ? parseInt(followerCount) : 0)
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
                        className="flex items-center justify-between p-5 border border-dashed border-gray-300 rounded-2xl hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer group bg-gray-50/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-purple-600 group-hover:border-purple-200 transition-colors shadow-sm">
                                <Instagram className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Connect Instagram</div>
                                <div className="text-sm text-gray-500">Add your profile URL manually</div>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-purple-600 font-semibold group-hover:bg-purple-100">
                            Connect
                        </Button>
                    </div>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect Instagram</DialogTitle>
                    <DialogDescription>
                        Enter your Instagram profile URL to link your account.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="https://instagram.com/username"
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
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !url} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
