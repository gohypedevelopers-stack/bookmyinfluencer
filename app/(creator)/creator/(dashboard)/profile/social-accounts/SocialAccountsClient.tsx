"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Loader2 } from "lucide-react"
import { syncAllSocialData, toggleLiveSync, updateMediaKitStats } from "../actions"
import { toast } from "sonner" // Assuming sonner is available based on common patterns
import { useRouter } from "next/navigation"

interface SocialSyncControlsProps {
    isLiveSyncEnabled: boolean
}

export function SyncAllButton() {
    const [syncing, setSyncing] = useState(false)
    const router = useRouter()

    const handleSync = async () => {
        setSyncing(true)
        try {
            const res = await syncAllSocialData()
            if (res.success) {
                toast.success("Social data synced successfully")
                router.refresh()
            } else {
                toast.error(res.error || "Failed to sync data")
            }
        } catch (error) {
            toast.error("Internal sync error")
        } finally {
            setSyncing(false)
        }
    }

    return (
        <Button
            variant="outline"
            className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4 font-semibold"
            onClick={handleSync}
            disabled={syncing}
        >
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {syncing ? "Syncing..." : "Sync All Data"}
        </Button>
    )
}

export function LiveSyncToggle({ isLiveSyncEnabled: initialValue }: SocialSyncControlsProps) {
    const [enabled, setEnabled] = useState(initialValue)
    const [loading, setLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        setLoading(true)
        try {
            const res = await toggleLiveSync(checked)
            if (res.success) {
                setEnabled(checked)
                toast.success(`Live sync ${checked ? 'enabled' : 'disabled'}`)
            } else {
                toast.error(res.error || "Failed to update sync setting")
            }
        } catch (error) {
            toast.error("Error updating setting")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Switch
            className="data-[state=checked]:bg-purple-500"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading}
        />
    )
}

export function UpdateMediaKitButton() {
    const [updating, setUpdating] = useState(false)

    const handleUpdate = async () => {
        setUpdating(true)
        try {
            const res = await updateMediaKitStats()
            if (res.success) {
                toast.success("Media kit stats updated")
            } else {
                toast.error(res.error || "Failed to update stats")
            }
        } catch (error) {
            toast.error("Update error")
        } finally {
            setUpdating(false)
        }
    }

    return (
        <Button
            className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-12 font-bold shadow-lg shadow-gray-200"
            onClick={handleUpdate}
            disabled={updating}
        >
            {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {updating ? "Updating..." : "Update Media Kit"}
        </Button>
    )
}
