"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Youtube, Instagram, Loader2, RefreshCw } from "lucide-react";

interface SocialCardsProps {
    youtubeAccount: any;
    instagramAccount: any;
    ytMetric: any;
    igMetric: any;
    selfReportedIg: any;
    creatorProfile: any; // Contains youtube/instagram url strings
}

export function SocialCards({
    youtubeAccount,
    instagramAccount,
    ytMetric,
    igMetric,
    selfReportedIg,
    creatorProfile
}: SocialCardsProps) {
    const router = useRouter();

    // YouTube State
    const [ytLoading, setYtLoading] = useState(false);
    const [ytUrl, setYtUrl] = useState(creatorProfile?.youtube || "");
    const [showYtInput, setShowYtInput] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleYoutubePublicFetch = async () => {
        if (!ytUrl) return;
        setYtLoading(true);
        setErrorMessage(null);
        try {
            const res = await fetch("/api/metrics/youtube-from-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ youtubeUrl: ytUrl }),
            });
            const data = await res.json();

            if (res.ok && data.ok) {
                router.refresh();
                setShowYtInput(false);
            } else {
                setErrorMessage(data.detail || "Failed to fetch public stats. Please check the URL.");
            }
        } catch (e) {
            console.error(e);
            setErrorMessage("An unexpected network error occurred.");
        } finally {
            setYtLoading(false);
        }
    };

    // Instagram State
    const [igLoading, setIgLoading] = useState(false);
    const [igUrl, setIgUrl] = useState(creatorProfile?.instagram || "");
    const [showIgInput, setShowIgInput] = useState(false);
    const [igError, setIgError] = useState<string | null>(null);

    const handleInstagramPublicFetch = async () => {
        if (!igUrl) return;
        setIgLoading(true);
        setIgError(null);
        try {
            const res = await fetch("/api/metrics/instagram-from-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instagramUrl: igUrl }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                router.refresh();
                setShowIgInput(false);
            } else {
                setIgError(data.detail || "Failed to fetch Instagram stats.");
            }
        } catch (e) {
            console.error(e);
            setIgError("An unexpected error occurred.");
        } finally {
            setIgLoading(false);
        }
    };

    const isYtPublic = youtubeAccount?.type === "PUBLIC_API";
    const isIgPublic = instagramAccount?.type === "PUBLIC_API";
    const isIgSelfReported = !!selfReportedIg;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* YouTube Card */}
            <Card className={youtubeAccount ? "border-red-200 bg-red-50/10" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-600" />
                        YouTube
                    </CardTitle>
                    {youtubeAccount && !isYtPublic && (
                        <div className="text-xs font-medium text-green-600 px-2 py-1 bg-green-100 rounded-full">Connected</div>
                    )}
                    {isYtPublic && (
                        <div className="text-xs font-medium text-amber-600 px-2 py-1 bg-amber-100 rounded-full">Public (Auto)</div>
                    )}
                </CardHeader>
                <CardContent>
                    {!youtubeAccount ? (
                        <div className="space-y-4">
                            {!showYtInput ? (
                                <>
                                    <p className="text-sm text-slate-600">Connect your YouTube channel for full insights.</p>
                                    <Link href="/api/auth/youtube">
                                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                                            Connect YouTube
                                        </Button>
                                    </Link>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-slate-500">Or</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full" onClick={() => setShowYtInput(true)}>
                                        Use Public Link
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium">Channel Link / Handle</label>
                                        <Input
                                            placeholder="https://youtube.com/@handle"
                                            value={ytUrl}
                                            onChange={(e) => setYtUrl(e.target.value)}
                                        />
                                    </div>
                                    {errorMessage && (
                                        <div className="text-xs text-red-600 font-medium">
                                            {errorMessage}
                                        </div>
                                    )}
                                    <Button
                                        variant="default"
                                        className="w-full"
                                        onClick={handleYoutubePublicFetch}
                                        disabled={ytLoading}
                                    >
                                        {ytLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Fetch Metrics
                                    </Button>
                                    <Button variant="ghost" className="w-full" onClick={() => setShowYtInput(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Subscribers</div>
                                    <div className="text-xl font-bold">
                                        {ytMetric?.followersCount?.toLocaleString() || "0"}
                                        {ytMetric?.rawResponse && JSON.parse(ytMetric.rawResponse).subscribers === null && (
                                            <span className="text-xs font-normal text-slate-400 block">(Hidden)</span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Total Views</div>
                                    <div className="text-xl font-bold">{ytMetric?.viewsCount ? parseInt(ytMetric.viewsCount).toLocaleString() : "0"}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Videos</div>
                                    <div className="text-xl font-bold">{ytMetric?.mediaCount?.toLocaleString() || "0"}</div>
                                </div>
                                {isYtPublic && (
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-500">Avg Engagement</div>
                                        <div className="text-xl font-bold">
                                            {ytMetric?.engagementRate ? ytMetric.engagementRate.toFixed(2) + '%' : '0%'}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-slate-400">
                                Channel: {youtubeAccount.username}
                            </div>
                            {isYtPublic && (
                                <div className="pt-2 border-t text-xs text-slate-500 flex justify-between">
                                    <span>Auto-fetched {creatorProfile.lastYoutubeFetchAt ? new Date(creatorProfile.lastYoutubeFetchAt).toLocaleDateString() : ""}</span>
                                    <button className="underline text-blue-600" onClick={() => handleYoutubePublicFetch()}>Refresh</button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Instagram Card */}
            <Card className={instagramAccount ? "border-pink-200 bg-pink-50/10" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Instagram className="h-5 w-5 text-pink-600" />
                        Instagram
                    </CardTitle>
                    {instagramAccount && !isIgPublic && (
                        <div className="text-xs font-medium text-green-600 px-2 py-1 bg-green-100 rounded-full">Connected</div>
                    )}
                    {isIgPublic && (
                        <div className="text-xs font-medium text-amber-600 px-2 py-1 bg-amber-100 rounded-full">Public (Auto)</div>
                    )}
                </CardHeader>
                <CardContent>
                    {!instagramAccount ? (
                        <div className="space-y-4">
                            {!showIgInput ? (
                                <>
                                    <p className="text-sm text-slate-600">Connect your Instagram (Business/Creator) account.</p>
                                    <Link href="/api/auth/instagram">
                                        <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                                            Connect Instagram
                                        </Button>
                                    </Link>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-slate-500">Or</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full" onClick={() => setShowIgInput(true)}>
                                        Use Public Link
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium">Instagram Profile URL</label>
                                        <Input
                                            placeholder="https://instagram.com/username"
                                            value={igUrl}
                                            onChange={(e) => setIgUrl(e.target.value)}
                                        />
                                    </div>
                                    {igError && (
                                        <div className="text-xs text-red-600 font-medium">
                                            {igError}
                                        </div>
                                    )}
                                    <Button
                                        variant="default"
                                        className="w-full"
                                        onClick={handleInstagramPublicFetch}
                                        disabled={igLoading}
                                    >
                                        {igLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Fetch Metrics
                                    </Button>
                                    <Button variant="ghost" className="w-full" onClick={() => setShowIgInput(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            )
                            }
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Followers</div>
                                    <div className="text-xl font-bold">{igMetric?.followersCount?.toLocaleString() || "0"}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Posts</div>
                                    <div className="text-xl font-bold">{igMetric?.mediaCount?.toLocaleString() || "0"}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Avg Likes</div>
                                    <div className="text-xl font-bold">{igMetric?.avgLikes ? Math.round(igMetric.avgLikes).toLocaleString() : "0"}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Avg Comments</div>
                                    <div className="text-xl font-bold">{igMetric?.avgComments ? Math.round(igMetric.avgComments).toLocaleString() : "0"}</div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400">
                                Handle: @{instagramAccount.username}
                            </div>
                            {isIgPublic && (
                                <div className="pt-2 border-t text-xs text-slate-500 flex justify-between">
                                    <span>Auto-fetched {creatorProfile.lastInstagramFetchAt ? new Date(creatorProfile.lastInstagramFetchAt).toLocaleDateString() : ""}</span>
                                    <button className="underline text-blue-600" onClick={() => handleInstagramPublicFetch()}>Refresh</button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
