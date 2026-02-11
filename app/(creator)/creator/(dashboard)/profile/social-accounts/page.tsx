import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
    Instagram,
    Youtube,
    RefreshCw,
    Plus,
    CheckCircle2,
    Settings, // Added Settings icon
    BarChart3,
    Users,
    Video,
    Twitch
} from "lucide-react"
import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { redirect } from "next/navigation"
import { ConnectSocialDialog } from "../ConnectSocialDialog" // Use new generic dialog
import { SyncAllButton, LiveSyncToggle, UpdateMediaKitButton } from "./SocialAccountsClient"

// Helper component for platform icons
const PlatformIcon = ({ provider, className }: { provider: string, className?: string }) => {
    if (provider === 'instagram') return <Instagram className={className} />
    if (provider === 'youtube') return <Youtube className={className} />
    if (provider === 'tiktok') return <Video className={className} />
    if (provider === 'twitch') return <Twitch className={className} />
    return <Users className={className} />
}

export default async function SocialAccountsPage() {
    const userId = await getVerifiedUserIdFromCookies()
    if (!userId) redirect("/verify")

    const creator = await db.creator.findUnique({
        where: { userId },
        include: {
            socialAccounts: true,
            metrics: true,
            selfReportedMetrics: true
        }
    })

    if (!creator) redirect("/creator/onboarding")

    // Helper to get metrics
    const getMetric = (provider: string) => {
        // Find the latest metric (sort by date descending)
        const metric = creator.metrics
            .filter(m => m.provider === provider)
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        // Then try self-reported (fallback)
        const selfReported = creator.selfReportedMetrics.find(m => m.provider === provider);

        // Logic: Use metric if available, else self-reported. 0 if neither.
        // We use the count from the LATEST metric found.
        const count = metric?.followersCount || selfReported?.followersCount || 0;

        return {
            followers: new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(count),
            engagement: metric?.engagementRate ? `${metric.engagementRate}%` : "--",
            healthy: !!metric || !!selfReported, // Considered healthy if we have ANY data record
            rawCount: count // return raw count for filling the form
        }
    }

    const hasInstagram = creator.socialAccounts.some(acc => acc.provider === 'instagram');
    const hasYoutube = creator.socialAccounts.some(acc => acc.provider === 'youtube');
    const hasTiktok = creator.socialAccounts.some(acc => acc.provider === 'tiktok');
    const hasTwitch = creator.socialAccounts.some(acc => acc.provider === 'twitch');

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
                    <p className="text-gray-500 mt-1">Manage your linked platforms and sync metrics</p>
                </div>
                <div className="flex gap-3">
                    <SyncAllButton />
                </div>
            </div>

            <div className="flex gap-8">
                {/* Main Content Column */}
                <div className="flex-1 space-y-6">
                    {/* Platform Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {creator.socialAccounts.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                No social accounts connected yet. Add one below!
                            </div>
                        )}

                        {creator.socialAccounts.map(account => {
                            const metrics = getMetric(account.provider);
                            const isInstagram = account.provider === 'instagram';
                            const isYoutube = account.provider === 'youtube';

                            // Determine URL for edit (simplified for now as we might not store full URL in socialAccount but partial in providerId)
                            // Ideally, we should fetch from `creator.instagramUrl` or `creator.youtubeUrl` or fall back to constructing it
                            let defaultUrl = "";
                            let lastFetch = null;
                            if (isInstagram) {
                                if (creator.instagramUrl) defaultUrl = creator.instagramUrl;
                                lastFetch = creator.lastInstagramFetchAt;
                            } else if (isYoutube) {
                                if (creator.youtubeUrl) defaultUrl = creator.youtubeUrl;
                                lastFetch = creator.lastYoutubeFetchAt;
                            } else if (account.provider === 'tiktok') {
                                if ((creator as any).tiktokUrl) defaultUrl = (creator as any).tiktokUrl;
                                lastFetch = (creator as any).lastTiktokFetchAt;
                            } else if (account.provider === 'twitch') {
                                if ((creator as any).twitchUrl) defaultUrl = (creator as any).twitchUrl;
                                lastFetch = (creator as any).lastTwitchFetchAt;
                            }

                            return (
                                <Card key={account.id} className="rounded-[2rem] border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${isInstagram ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' :
                                            isYoutube ? 'bg-red-600' :
                                                account.provider === 'tiktok' ? 'bg-pink-600' :
                                                    account.provider === 'twitch' ? 'bg-purple-500' :
                                                        'bg-gray-800'
                                            }`}>
                                            <PlatformIcon provider={account.provider} className="w-7 h-7" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${metrics.healthy ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${metrics.healthy ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                {metrics.healthy ? 'Active' : 'Manual'}
                                            </span>

                                            {/* Edit Button - Reopens Dialog with existing data */}
                                            <ConnectSocialDialog
                                                provider={account.provider as any}
                                                defaultUrl={defaultUrl || `https://${account.provider}.com/${account.username}`}
                                                defaultFollowerCount={metrics.rawCount}
                                            >
                                                <button
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                    suppressHydrationWarning
                                                >
                                                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <span className="sr-only">Settings</span>
                                                        <Settings className="w-3 h-3" />
                                                    </div>
                                                </button>
                                            </ConnectSocialDialog>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h3 className="font-bold text-lg text-gray-900 capitalize">{account.provider}</h3>
                                        <p className="text-xs text-gray-500">
                                            {account.username ? `@${account.username}` : 'Connected'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                                                {isYoutube ? 'Subscribers' : 'Followers'}
                                            </p>
                                            <p className="font-bold text-gray-900 text-lg">{metrics.followers}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Engagement</p>
                                            <p className="font-bold text-gray-900 text-lg">{metrics.engagement}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                            <RefreshCw className="w-3 h-3" /> Latest: {lastFetch ? new Date(lastFetch).toLocaleDateString() : 'Syncing...'}
                                        </span>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>

                    {/* Live Performance Sync */}
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-xl text-gray-900">Live Performance Sync</h3>
                            </div>
                            <LiveSyncToggle isLiveSyncEnabled={(creator as any).isLiveSyncEnabled} />
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-900">Automated Refresh Cycle</span>
                                <span className="text-sm font-bold text-blue-600">Every 6 Hours</span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Your metrics are automatically pulled from official APIs to keep your media kit up to date for brand partners.
                            </p>
                        </div>
                    </Card>

                    {/* Add Platform Section - Only Insta and YouTube as requested */}
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-500 rounded text-white p-0.5"><Plus className="w-4 h-4" /></div>
                            <h3 className="font-bold text-lg text-gray-900">Add Platform</h3>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {!hasInstagram && (
                                <ConnectSocialDialog provider="instagram">
                                    <div className="border border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-purple-600 transition-colors">
                                            <Instagram className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Instagram</span>
                                    </div>
                                </ConnectSocialDialog>
                            )}

                            {!hasYoutube && (
                                <ConnectSocialDialog provider="youtube">
                                    <div className="border border-dashed border-gray-200 hover:border-red-300 hover:bg-red-50/50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-red-600 transition-colors">
                                            <Youtube className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">YouTube</span>
                                    </div>
                                </ConnectSocialDialog>
                            )}

                            {!hasTiktok && (
                                <ConnectSocialDialog provider="tiktok">
                                    <div className="border border-dashed border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-pink-600 transition-colors">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">TikTok</span>
                                    </div>
                                </ConnectSocialDialog>
                            )}

                            {!hasTwitch && (
                                <ConnectSocialDialog provider="twitch">
                                    <div className="border border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all group">
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center text-purple-600 transition-colors">
                                            <Twitch className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Twitch</span>
                                    </div>
                                </ConnectSocialDialog>
                            )}
                        </div>

                        {hasInstagram && hasYoutube && hasTiktok && hasTwitch && (
                            <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-100">
                                All available platforms are connected!
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column - Status */}
                <div className="w-80 shrink-0 space-y-6">
                    <Card className="rounded-[2rem] border-gray-100 shadow-sm p-6 bg-white height-auto">
                        <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-6">Account Health Summary</h3>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full ${creator.verificationStatus === 'APPROVED' ? 'bg-green-50' : 'bg-gray-50'} flex items-center justify-center shrink-0`}>
                                    <CheckCircle2 className={`w-5 h-5 ${creator.verificationStatus === 'APPROVED' ? 'text-green-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">
                                        {creator.verificationStatus === 'APPROVED' ? 'Verified Account' : 'Verification Pending'}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        {creator.verificationStatus === 'APPROVED' ? 'Your profile is visible to brands' : 'Complete onboarding for verification'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 text-xs text-gray-400 leading-relaxed italic">
                            Linking your socials allows brands to see your real-time performance metrics without asking for screenshots.
                        </div>

                        <div className="mt-6">
                            <UpdateMediaKitButton />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
