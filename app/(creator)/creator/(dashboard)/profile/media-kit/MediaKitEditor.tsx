"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Plus, Loader2 } from "lucide-react"
import { updateMediaKit } from "./actions"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface MediaKitEditorProps {
    initialMediaKit: any[]
    rawSocialData: any[]
}

export default function MediaKitEditor({ initialMediaKit, rawSocialData }: MediaKitEditorProps) {
    const [selectedPosts, setSelectedPosts] = useState<any[]>(initialMediaKit || [])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const togglePost = (post: any) => {
        const exists = selectedPosts.find(p => p.id === post.id)
        if (exists) {
            setSelectedPosts(selectedPosts.filter(p => p.id !== post.id))
        } else {
            // Check limit if needed, e.g. max 9 posts
            if (selectedPosts.length >= 9) {
                alert("You can select up to 9 posts for your media kit.")
                return
            }
            setSelectedPosts([...selectedPosts, post])
        }
    }

    const handleSave = async () => {
        setLoading(true)
        await updateMediaKit(selectedPosts)
        setLoading(false)
        router.refresh()
    }

    // Combine raw data with selected ones to ensure we have a master list 
    // (though typically rawSocialData should contain everything available)
    // For now we assume rawSocialData is the source of truth for available posts.

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Your Media Kit</h2>
                    <p className="text-sm text-gray-500">Select your best performing posts to showcase to brands.</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="bg-gray-900 text-white rounded-xl">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            {/* Selected Preview */}
            {selectedPosts.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Preview ({selectedPosts.length}/9)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedPosts.map((post) => (
                            <PostCard key={post.id} post={post} selected={true} onToggle={() => togglePost(post)} />
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t border-gray-100 my-8" />

            {/* Available Posts */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Available Posts</h3>
                {rawSocialData.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">No social data available. Sync your accounts to see posts here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {rawSocialData.map((post) => {
                            const isSelected = selectedPosts.some(p => p.id === post.id)
                            return (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    selected={isSelected}
                                    onToggle={() => togglePost(post)}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

function PostCard({ post, selected, onToggle }: { post: any, selected: boolean, onToggle: () => void }) {
    return (
        <div
            onClick={onToggle}
            className={`
                relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group transition-all duration-200
                ${selected ? 'ring-4 ring-purple-500 ring-offset-2' : 'hover:opacity-90'}
            `}
        >
            <Image
                src={post.displayUrl || post.thumbnailUrl || '/placeholder-post.jpg'}
                alt="Post"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

            {selected && (
                <div className="absolute top-2 right-2 bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3" />
                </div>
            )}

            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex items-center gap-2 text-xs font-medium">
                    <span>❤️ {post.likesCount || 0}</span>
                    <span>💬 {post.commentsCount || 0}</span>
                </div>
            </div>
        </div>
    )
}
