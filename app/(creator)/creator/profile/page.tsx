import Link from "next/link"
import { redirect } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import {
    ArrowLeft,
    Briefcase,
    Link as LinkIcon,
    X,
    Plus,
    Instagram as InstagramIcon
} from "lucide-react"

export default async function CreatorProfilePage() {
    const userId = await getVerifiedUserIdFromCookies()
    if (!userId) redirect("/verify")

    const creator = await db.creator.findUnique({
        where: { userId },
        include: {
            socialAccounts: true,
            user: true,
        }
    })

    if (!creator) redirect("/creator/onboarding")

    const userName = creator.fullName || "Alex Sterling";
    const userTitle = "Lifestyle & Tech Reviewer";
    const userBio = "Passionate creator focusing on the intersection of minimalist lifestyle and high-end consumer technology. 5+ years of experience collaborating with global brands to create authentic story-driven content.";
    const niches = ["Technology", "Lifestyle", "Minimalism"];

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/creator/dashboard">
                        <button className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
                </div>
                <div className="flex gap-3">
                    <Link href="/creator/dashboard">
                        <Button variant="ghost" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium">
                            Discard
                        </Button>
                    </Link>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 rounded-lg px-6">
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="p-10 max-w-5xl mx-auto space-y-8">
                {/* Profile Banner */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative group">
                    <div className="h-48 w-full relative">
                        <Image
                            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200&h=400"
                            alt="Profile Banner"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="px-8 pb-8 flex items-end relative">
                        <div className="-mt-16 relative">
                            <div className="w-32 h-32 rounded-2xl border-[6px] border-white shadow-xl overflow-hidden bg-orange-100 flex items-center justify-center">
                                <span className="text-4xl font-bold text-orange-400">{userName.charAt(0)}</span>
                            </div>
                            <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors border border-gray-100">
                                <div className="w-4 h-4 relative">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                    </svg>
                                </div>
                            </button>
                        </div>

                        <div className="ml-6 mb-2 flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                {userName}
                            </h2>
                            <div className="mt-2 flex items-center gap-4">
                                <span className="text-sm font-medium text-purple-600">Profile completeness: 85%</span>
                                <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[85%]" />
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
                                    defaultValue={userName}
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors rounded-xl font-medium text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Title</label>
                                <Input
                                    defaultValue={userTitle}
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors rounded-xl font-medium text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Bio</label>
                            <Textarea
                                defaultValue={userBio}
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
                                        <button className="hover:text-purple-900 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                                <button className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-500 rounded-xl text-sm font-medium hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all">
                                    <Plus className="w-4 h-4" />
                                    Add Niche
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Linked Socials */}
                <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <LinkIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Linked Socials</h3>
                            </div>
                            <Button variant="link" className="text-purple-600 hover:text-purple-700 font-semibold">
                                Sync All Data
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <InstagramIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Instagram</div>
                                    <div className="text-sm text-gray-500 font-medium">234.5k Followers</div>
                                </div>
                            </div>
                            <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium rounded-lg">
                                Disconnect
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
