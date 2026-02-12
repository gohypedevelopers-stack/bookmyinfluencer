
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, Instagram, Youtube, ExternalLink, Activity, Calendar, ShieldCheck, User } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import { verifyCreator, getSignedSelfieUrl } from "../actions"
import { useEffect as useClientEffect } from "react" // For clarity if needed, or just useEffect

interface UserDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    user: any | null
    creator: any | null
    onUpdate?: () => void
}

export function UserDetailsModal({ isOpen, onClose, user, creator, onUpdate }: UserDetailsModalProps) {
    const [loading, setLoading] = useState(false)
    const [selfieUrl, setSelfieUrl] = useState<string | null>(null)
    const [fetchingSelfie, setFetchingSelfie] = useState(false)

    const selfieKey = creator?.kycSubmission?.selfieImageKey || user?.influencerProfile?.kyc?.selfieImageKey;

    useClientEffect(() => {
        if (isOpen && selfieKey) {
            handleFetchSelfie(selfieKey);
        } else if (!isOpen) {
            setSelfieUrl(null);
        }
    }, [isOpen, selfieKey]);

    const handleFetchSelfie = async (key: string) => {
        setFetchingSelfie(true);
        try {
            const res = await getSignedSelfieUrl(key);
            if (res.success && res.url) {
                setSelfieUrl(res.url);
            }
        } catch (e) {
            console.error("Failed to fetch selfie URL", e);
        } finally {
            setFetchingSelfie(false);
        }
    };

    const handleVerification = async (status: 'APPROVED' | 'REJECTED') => {
        if (!creator) return toast.error("No creator profile found to verify");

        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this creator?`)) return;

        setLoading(true);
        try {
            const result = await verifyCreator(creator.id, status);
            if (result.success) {
                toast.success(`Creator ${status.toLowerCase()} successfully`);
                onUpdate?.();
                onClose();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string | Date | null) => {
        if (!date) return "N/A";
        return format(new Date(date), "MMM d, yyyy HH:mm");
    }

    if (!user && !creator) return null;

    // Determine primary info source (User table or Creator table)
    const email = user?.email || creator?.user?.email;
    const name = user?.name || creator?.fullName || creator?.user?.displayName || "Unknown User";
    const role = user?.role || "INFLUENCER"; // Creator implies influencer usually

    // Creator specific data
    const instagram = creator?.instagramUrl;
    const youtube = creator?.youtubeUrl;
    const metrics = creator?.metrics || [];

    // Helper to get only the latest metric per provider
    const getLatestMetric = (provider: string) => {
        if (!metrics || !Array.isArray(metrics)) return null;
        const providerMetrics = metrics.filter((m: any) => m.provider === provider);
        if (providerMetrics.length === 0) return null;
        // Sort descending by fetchedAt (latest first)
        return providerMetrics.sort((a: any, b: any) => {
            const dateA = new Date(a.fetchedAt || 0).getTime();
            const dateB = new Date(b.fetchedAt || 0).getTime();
            return dateB - dateA;
        })[0];
    };

    const latestInstagram = getLatestMetric('instagram');
    const latestYoutube = getLatestMetric('youtube');

    const kycStatus = creator?.verificationStatus || user?.influencerProfile?.kyc?.status || "NOT_SUBMITTED";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Make dialog wider with max-w-4xl */}
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <DialogHeader>
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold uppercase shadow-inner border-2 border-white">
                                    {name.charAt(0)}
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                        {name}
                                        {kycStatus === 'APPROVED' && <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-50" />}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm font-medium text-gray-500 flex flex-col gap-1">
                                        <span>{email}</span>
                                        <span className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs bg-white">{role}</Badge>
                                            <Badge className={
                                                kycStatus === 'APPROVED' ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                                    kycStatus === 'PENDING' ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                                                        "bg-gray-100 text-gray-700"
                                            }>{kycStatus}</Badge>
                                        </span>
                                    </DialogDescription>
                                </div>
                            </div>

                            {/* Verification Actions */}
                            {creator && kycStatus !== 'APPROVED' && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleVerification('REJECTED')}
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        disabled={loading}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleVerification('APPROVED')}
                                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                        disabled={loading}
                                    >
                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                        Verify User
                                    </Button>
                                </div>
                            )}
                            {/* Already approved indicator or unverify option */}
                            {creator && kycStatus === 'APPROVED' && (
                                <Button
                                    onClick={() => handleVerification('REJECTED')}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    disabled={loading}
                                >
                                    Revoke Verification
                                </Button>
                            )}
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue="overview" className="h-full flex flex-col">
                        <div className="px-6 pt-4 border-b border-gray-100">
                            <TabsList className="bg-transparent space-x-2">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-blue-100">Overview</TabsTrigger>
                                <TabsTrigger value="social" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-blue-100">Social Metrics</TabsTrigger>
                                <TabsTrigger value="kyc" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-blue-100">KYC Status</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                <TabsContent value="overview" className="mt-0 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                                <User className="w-4 h-4 text-gray-500" />
                                                Account Details
                                            </h4>
                                            <div className="grid grid-cols-1 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">User ID</span>
                                                    <span className="font-mono text-xs text-gray-700">{user?.id || creator?.userId || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Email Verified</span>
                                                    <span className="text-gray-700">{user?.emailVerified || creator?.user?.verifiedAt ? 'Yes' : 'No'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Joined Date</span>
                                                    <span className="text-gray-700">{formatDate(user?.createdAt || creator?.createdAt)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Last Active</span>
                                                    <span className="text-gray-700">{formatDate(user?.lastSeenAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                                <Activity className="w-4 h-4 text-gray-500" />
                                                Platform Activity
                                            </h4>
                                            {/* Access raw data if needed or show placeholder */}
                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-500">
                                                No activity logs available for this user yet.
                                            </div>
                                        </div>
                                    </div>

                                    {creator?.bio && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-gray-900">Bio / Description</h4>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                {creator.bio}
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="social" className="mt-0 space-y-6">
                                    {(instagram || youtube) ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {instagram && (
                                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex justify-between items-center text-white">
                                                        <div className="flex items-center gap-2 font-bold">
                                                            <Instagram className="w-5 h-5" /> Instagram
                                                        </div>
                                                        <a href={instagram} target="_blank" className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                                            View Profile <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                    <div className="p-4 bg-white space-y-3">
                                                        {latestInstagram ? (
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <div className="text-gray-500 text-xs uppercase font-bold">Followers</div>
                                                                    <div className="font-bold text-gray-900 text-lg">{latestInstagram.followersCount?.toLocaleString()}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-500 text-xs uppercase font-bold">Avg. Likes</div>
                                                                    <div className="font-bold text-gray-900 text-lg">{latestInstagram.avgLikes?.toLocaleString()}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-500 text-xs uppercase font-bold">ER %</div>
                                                                    <div className="font-bold text-green-600 text-lg">{latestInstagram.engagementRate}%</div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-500 text-sm italic">No metrics data available</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {youtube && (
                                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                    <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                                                        <div className="flex items-center gap-2 font-bold">
                                                            <Youtube className="w-5 h-5" /> YouTube
                                                        </div>
                                                        <a href={youtube} target="_blank" className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                                            View Channel <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                    <div className="p-4 bg-white space-y-3">
                                                        {latestYoutube ? (
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <div className="text-gray-500 text-xs uppercase font-bold">Subscribers</div>
                                                                    <div className="font-bold text-gray-900 text-lg">{latestYoutube.followersCount?.toLocaleString()}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-500 text-xs uppercase font-bold">Avg. Views</div>
                                                                    <div className="font-bold text-gray-900 text-lg">{latestYoutube.viewsCount || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-500 text-sm italic">No metrics data available</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                                            No social media profiles linked.
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="kyc" className="mt-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-gray-900 border-b pb-2">Submission Details</h4>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Status</span>
                                                    <Badge>{kycStatus}</Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Submitted At</span>
                                                    <span className="text-gray-700">{formatDate(creator?.kycSubmission?.submittedAt)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Last Reviewed</span>
                                                    <span className="text-gray-700">{formatDate(creator?.kycSubmission?.reviewedAt || creator?.verifiedAt)}</span>
                                                </div>

                                                {creator?.kycSubmission?.adminNotes && (
                                                    <div className="pt-2">
                                                        <span className="text-gray-500 block mb-1">Admin Notes:</span>
                                                        <p className="bg-yellow-50 p-2 rounded text-gray-700 text-xs">
                                                            {creator.kycSubmission.adminNotes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-gray-900 border-b pb-2">Verification Selfie</h4>
                                            {selfieKey ? (
                                                <div className="space-y-4">
                                                    <div className="aspect-square w-full relative bg-gray-100 rounded-xl overflow-hidden border">
                                                        {selfieUrl ? (
                                                            <img src={selfieUrl} alt="KYC Selfie" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                                {fetchingSelfie ? "Loading..." : "Secure Image"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Liveness Prompt:</span>
                                                            <span className="font-bold text-gray-900">{creator?.kycSubmission?.livenessPrompt || "N/A"}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Liveness Result:</span>
                                                            <Badge variant="outline" className="text-[10px] h-5 bg-green-50 text-green-700 border-green-200">
                                                                {creator?.kycSubmission?.livenessResult || "PASSED"}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Captured At:</span>
                                                            <span className="text-gray-700">{formatDate(creator?.kycSubmission?.selfieCapturedAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500 text-sm">
                                                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                    No verification selfie uploaded.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}
