'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { updateCreatorMediaKit } from "@/app/(creator)/creator/dashboard/actions"
import { Instagram, Youtube, Image as ImageIcon } from "lucide-react"

interface MediaItem {
    type: 'video' | 'post'
    platform: 'youtube' | 'instagram'
    url?: string
    thumbnailUrl?: string
    title?: string
    likes?: number
    views?: number
    comments?: number
}

export function MediaKitManager({
    initialMediaKit,
    rawSocialData
}: {
    initialMediaKit?: string
    rawSocialData?: string
}) {
    const [selectedItems, setSelectedItems] = useState<MediaItem[]>(() => {
        if (!initialMediaKit) return []
        try {
            return JSON.parse(initialMediaKit)
        } catch {
            return []
        }
    })

    const [saving, setSaving] = useState(false)

    const availableItems: MediaItem[] = (() => {
        if (!rawSocialData) return []
        try {
            const parsed = JSON.parse(rawSocialData)
            return parsed.map((item: any) => ({
                type: item.type === 'video' ? 'video' : 'post',
                platform: item.channelId ? 'youtube' : 'instagram',
                url: item.url || item.shortCode || '',
                thumbnailUrl: item.thumbnail || item.thumbnailUrl || item.displayUrl || '',
                title: item.title || '',
                likes: item.likes || item.likeCount || 0,
                views: item.viewCount || item.views || 0,
                comments: item.commentsCount || item.commentCount || 0
            }))
        } catch {
            return []
        }
    })()

    const isSelected = (item: MediaItem) => {
        return selectedItems.some(s => s.url === item.url)
    }

    const toggleSelection = (item: MediaItem) => {
        if (isSelected(item)) {
            setSelectedItems(selectedItems.filter(s => s.url !== item.url))
        } else {
            setSelectedItems([...selectedItems, item])
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await updateCreatorMediaKit(JSON.stringify(selectedItems))
            if (result.success) {
                alert("Media Kit updated successfully!")
            } else {
                alert("Error: " + result.error)
            }
        } catch (error) {
            alert("Failed to save media kit")
        } finally {
            setSaving(false)
        }
    }

    if (availableItems.length === 0) {
        return (
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Portfolio / Media Kit</CardTitle>
                    <CardDescription className="text-gray-400">
                        Select your best posts to showcase to brands.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No posts available yet.</p>
                        <p className="text-sm">Fetch your social media metrics to see your recent content.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle className="text-white">Portfolio / Media Kit</CardTitle>
                <CardDescription className="text-gray-400">
                    Select up to 12 posts to showcase to brands ({selectedItems.length}/12 selected).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableItems.slice(0, 50).map((item, index) => (
                        <div
                            key={index}
                            className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${isSelected(item) ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-slate-300'
                                }`}
                            onClick={() => selectedItems.length < 12 || isSelected(item) ? toggleSelection(item) : null}
                        >
                            <div className="aspect-square bg-slate-200 relative">
                                {item.thumbnailUrl ? (
                                    <img
                                        src={item.thumbnailUrl}
                                        alt={item.title || ''}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-slate-400" />
                                    </div>
                                )}

                                <div className="absolute top-2 right-2">
                                    <Checkbox
                                        checked={isSelected(item)}
                                        onCheckedChange={() => toggleSelection(item)}
                                        className="bg-white"
                                    />
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                    <div className="flex items-center gap-1 text-white text-xs">
                                        {item.platform === 'youtube' ? (
                                            <Youtube className="h-3 w-3" />
                                        ) : (
                                            <Instagram className="h-3 w-3" />
                                        )}
                                        <span>{item.likes?.toLocaleString()} likes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save Media Kit"}
                </Button>
            </CardContent>
        </Card>
    )
}
