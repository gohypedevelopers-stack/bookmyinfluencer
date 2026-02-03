"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
    Briefcase, Link as LinkIcon, X, Plus, Instagram as InstagramIcon,
    Youtube as YoutubeIcon, Camera, Loader2, ArrowLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ConnectSocialDialog } from "./ConnectSocialDialog"
import { DisconnectButton } from "./DisconnectButton"
import { updateCreatorProfileAction } from "./actions"

interface ProfileEditorProps {
    creator: any // Using any to avoid type issues with new schema fields before full generation
}

export function ProfileEditor({ creator }: ProfileEditorProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Form State
    const [displayName, setDisplayName] = useState(
        creator.displayName || creator.autoDisplayName || creator.fullName || ""
    )
    const [title, setTitle] = useState(
        creator.niche ? creator.niche.split(',')[0] : ""
    )
    const [bio, setBio] = useState(
        creator.bio || creator.autoBio || ""
    )

    // Niches
    const [niches, setNiches] = useState<string[]>(
        creator.niche
            ? creator.niche.split(',').map((n: string) => n.trim()).filter(Boolean)
            : []
    )
    const [newNiche, setNewNiche] = useState("")
    const [showNicheInput, setShowNicheInput] = useState(false)

    // Images State
    const [profileImage, setProfileImage] = useState<string | null>(
        creator.profileImageUrl || creator.autoProfileImageUrl || creator.user?.image || null
    )
    const [bannerImage, setBannerImage] = useState<string | null>(
        creator.backgroundImageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200&h=400"
    )

    // File Inputs
    const profileInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)
    const [newProfileFile, setNewProfileFile] = useState<File | null>(null)
    const [newBannerFile, setNewBannerFile] = useState<File | null>(null)

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewProfileFile(file)
            setProfileImage(URL.createObjectURL(file))
        }
    }

    const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewBannerFile(file)
            setBannerImage(URL.createObjectURL(file))
        }
    }

    const handleRemoveNiche = (nicheToRemove: string) => {
        setNiches(niches.filter(n => n !== nicheToRemove))
    }

    const handleAddNiche = () => {
        if (newNiche.trim()) {
            setNiches([...niches, newNiche.trim()])
            setNewNiche("")
            setShowNicheInput(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("displayName", displayName)
            formData.append("title", title) // We might store this in niche or a new title field if available, for now merging into niche logic
            formData.append("bio", bio)

            // Reconstruct niche string. Put title first if it exists and isn't in niches
            // Actually, userTitle logic in page.tsx was just splitting niche. 
            // So we can prepend title to niches list for saving, or just save niches. 
            // Let's assume title is just the first niche for now as per previous logic.
            const finalNiches = [...(title ? [title] : []), ...niches.filter(n => n !== title)]
            // Unique niches
            const uniqueNiches = Array.from(new Set(finalNiches))
            formData.append("niche", uniqueNiches.join(","))

            if (newProfileFile) {
                formData.append("profileImage", newProfileFile)
            }
            if (newBannerFile) {
                formData.append("bannerImage", newBannerFile)
            }

            const res = await updateCreatorProfileAction(formData)

            if (res.success) {
                // Refresh to show persisted data
                router.refresh()
            } else {
                alert("Failed to save profile: " + res.error)
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred manually saving.")
        } finally {
            setLoading(false)
        }
    }

    // Helper for metrics
    const getFollowerCount = (provider: string) => {
        const metrics = creator.metrics
            .filter((m: any) => m.provider === provider)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latestAndSelf = metrics[0]?.followersCount
            || creator.selfReportedMetrics.find((m: any) => m.provider === provider)?.followersCount
            || 0;

        return latestAndSelf > 0
            ? new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(latestAndSelf)
            : "0";
    }

    const hasInstagram = creator.socialAccounts.some((acc: any) => acc.provider === 'instagram')
    const hasYoutube = creator.socialAccounts.some((acc: any) => acc.provider === 'youtube')

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => router.refresh()} className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium">
                        Discard
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 rounded-lg px-6"
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="p-10 max-w-5xl mx-auto space-y-8">
                {/* Profile Banner */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative group min-h-[300px] flex items-end">
                    {/* Background Image - Absolute to cover full card */}
                    <div className="absolute inset-0">
                        <Image
                            src={bannerImage || ""}
                            alt="Profile Banner"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 1024px"
                        />
                        {/* Gradient Overlay for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Hover Edit Button for Banner */}
                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-2 bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30"
                                onClick={() => bannerInputRef.current?.click()}
                            >
                                <Camera className="w-4 h-4" />
                                Change Cover
                            </Button>
                        </div>
                        <input
                            type="file"
                            ref={bannerInputRef}
                            onChange={handleBannerImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="px-8 pb-8 flex items-end relative z-10 w-full">
                        <div className="flex items-end gap-6 w-full">
                            {/* Profile Picture */}
                            <div className="relative group/avatar shrink-0">
                                <div className="w-32 h-32 rounded-2xl border-[4px] border-white/50 backdrop-blur-sm shadow-xl overflow-hidden bg-orange-100 flex items-center justify-center relative">
                                    {profileImage ? (
                                        <Image
                                            src={profileImage}
                                            alt={displayName}
                                            fill
                                            className="object-cover"
                                            sizes="128px"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-orange-400">{displayName.charAt(0)}</span>
                                    )}

                                    {/* Avatar Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        onClick={() => profileInputRef.current?.click()}
                                    >
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={profileInputRef}
                                        onChange={handleProfileImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div className="mb-2 flex-1">
                                <h2 className="text-3xl font-bold text-white flex items-center gap-2 drop-shadow-md">
                                    {displayName}
                                </h2>
                                <div className="mt-3 flex items-center gap-4">
                                    <span className="text-sm font-medium text-white/90 drop-shadow-sm">Profile completeness: 85%</span>
                                    <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div className="h-full bg-purple-500 rounded-full w-[85%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* General Information */}
                <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">General Information</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                                <Input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors rounded-xl font-medium text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Title / Primary Niche</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors rounded-xl font-medium text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Bio</label>
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="min-h-[120px] bg-gray-50/50 border-gray-200 focus:bg-white transition-colors rounded-xl text-gray-600 leading-relaxed resize-none p-4"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Content Niches</label>
                            <div className="flex flex-wrap gap-3">
                                {niches.map((niche, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold border border-purple-100/50"
                                    >
                                        #{niche}
                                        <button onClick={() => handleRemoveNiche(niche)} className="hover:text-purple-900 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}

                                {showNicheInput ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={newNiche}
                                            onChange={(e) => setNewNiche(e.target.value)}
                                            className="h-9 w-32 rounded-xl text-sm"
                                            placeholder="Tag..."
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNiche()}
                                            autoFocus
                                        />
                                        <Button size="sm" onClick={handleAddNiche} className="h-9 rounded-xl">Add</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setShowNicheInput(false)} className="h-9 rounded-xl"><X className="w-4 h-4" /></Button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowNicheInput(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-500 rounded-xl text-sm font-medium hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Niche
                                    </button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Linked Socials - Kept as Read Only / Manage separate actions */}
                <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <LinkIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Linked Socials</h3>
                            </div>
                            <Button variant="link" className="text-purple-600 hover:text-purple-700 font-semibold" onClick={() => router.push('/creator/profile/social-accounts')}>
                                Manage Accounts
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {creator.socialAccounts.length === 0 && !hasInstagram && (
                                <p className="text-gray-500 text-center py-4">No social accounts connected.</p>
                            )}
                            {creator.socialAccounts.map((account: any) => (
                                <div key={account.id} className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${account.provider === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' :
                                            account.provider === 'youtube' ? 'bg-red-600' : 'bg-gray-800'
                                            }`}>
                                            {account.provider === 'instagram' ? <InstagramIcon className="w-6 h-6 text-white" /> : <YoutubeIcon className="w-6 h-6 text-white" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 capitalize">{account.provider}</div>
                                            <div className="text-sm text-gray-500 font-medium">
                                                {getFollowerCount(account.provider)} {account.provider === 'youtube' ? 'Subscribers' : 'Followers'}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Disconnect Logic handled in ConnectSocialDialog or separate page usually, keeping simplistic here */}
                                    <DisconnectButton provider={account.provider} />
                                </div>
                            ))}

                            {!hasInstagram && (
                                <ConnectSocialDialog provider="instagram">
                                    <div className="border border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-purple-600 transition-colors">
                                            <InstagramIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Connect Instagram</span>
                                    </div>
                                </ConnectSocialDialog>
                            )}

                            {!hasYoutube && (
                                <ConnectSocialDialog provider="youtube">
                                    <div className="border border-dashed border-gray-200 hover:border-red-300 hover:bg-red-50/50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-red-600 transition-colors">
                                            <YoutubeIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Connect YouTube</span>
                                    </div>
                                </ConnectSocialDialog>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
