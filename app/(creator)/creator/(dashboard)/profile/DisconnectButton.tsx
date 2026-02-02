"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { disconnectSocialProfile } from "./actions"
import { useRouter } from "next/navigation"

interface DisconnectButtonProps {
    provider: "instagram" | "youtube"
}

export function DisconnectButton({ provider }: DisconnectButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDisconnect = async () => {
        if (!confirm(`Are you sure you want to disconnect your ${provider} account?`)) return

        setLoading(true)
        try {
            await disconnectSocialProfile(provider)
            router.refresh()
        } catch (error) {
            console.error("Failed to disconnect:", error)
            alert("Failed to disconnect. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleDisconnect}
            disabled={loading}
            className="border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium rounded-lg"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disconnect"}
        </Button>
    )
}
