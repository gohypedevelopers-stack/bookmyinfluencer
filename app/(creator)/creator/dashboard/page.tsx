import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { AlertCircle, CheckCircle2, Instagram, Youtube, Download, TrendingUp, Users, Target } from "lucide-react"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { FollowerTrendChart } from "@/components/dashboard/FollowerTrendChart"
import { PricingManager } from "@/components/dashboard/PricingManager"
import { MediaKitManager } from "@/components/dashboard/MediaKitManager"

export default async function CreatorDashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const userId = await getVerifiedUserIdFromCookies()
  if (!userId) redirect("/verify")

  const sp = await searchParams;
  const error = sp?.error as string | undefined;
  const success = sp?.success as string | undefined;

  const creator = await db.creator.findUnique({
    where: { userId },
    include: {
      socialAccounts: true,
      metrics: {
        orderBy: { date: 'desc' },
        take: 30 // Last 30 data points for chart
      },
      selfReportedMetrics: true,
    }
  })

  if (!creator) redirect("/creator/onboarding")

  const youtubeAccount = creator.socialAccounts.find(a => a.provider === "youtube");
  const instagramAccount = creator.socialAccounts.find(a => a.provider === "instagram");

  // Get latest metrics
  const sortedMetrics = [...creator.metrics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const ytMetric = sortedMetrics.find(m => m.provider === "youtube");
  const igMetric = sortedMetrics.find(m => m.provider === "instagram");

  // Calculate follower growth
  const latestFollowers = igMetric?.followersCount || ytMetric?.followersCount || 0;
  const previousMetric = sortedMetrics[1];
  const previousFollowers = previousMetric?.followersCount || latestFollowers;
  const followerGrowth = previousFollowers > 0
    ? Number((((latestFollowers - previousFollowers) / previousFollowers) * 100).toFixed(1))
    : 0;

  // Prepare chart data (reverse to show chronologically)
  const chartData = creator.metrics
    .slice(0, 30)
    .reverse()
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      followers: m.followersCount
    }));

  // Calculate engagement rate
  const avgEngagement = (igMetric?.engagementRate || ytMetric?.engagementRate || 0);

  // Calculate total reach (simplified - sum of followers across platforms)
  const totalReach = sortedMetrics.reduce((sum, m) => sum + m.followersCount, 0);

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
            <p className="text-gray-400 mt-1">Welcome back. Track your growth in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Platform Filter Tabs */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              <Button variant="ghost" size="sm" className="text-cyan-400 bg-gray-700">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400">
                <Youtube className="h-4 w-4 mr-2" />
                YouTube
              </Button>
            </div>

            {/* Time Range */}
            <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300">
              Last 30 Days
            </Button>

            {/* Export */}
            <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-900/20 text-red-400 p-4 rounded-md flex items-center gap-2 border border-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 text-green-400 p-4 rounded-md flex items-center gap-2 border border-green-800">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <div className="font-medium">Success</div>
              <div className="text-sm">
                {success === 'youtube_connected' && "YouTube account connected successfully!"}
                {success === 'instagram_connected' && "Instagram account connected successfully!"}
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Follower Growth"
            value={latestFollowers.toLocaleString()}
            change={followerGrowth}
            subtitle="+2k new followers today"
            icon={<TrendingUp className="h-4 w-4" />}
            gradient="from-cyan-500 to-blue-500"
          />
          <MetricCard
            title="Avg. Engagement"
            value={`${avgEngagement.toFixed(1)}%`}
            change={0.1}
            subtitle="Avg across all posts"
            icon={<Target className="h-4 w-4" />}
            gradient="from-pink-500 to-rose-500"
          />
          <MetricCard
            title="Total Reach"
            value={`${(totalReach / 1000000).toFixed(1)}M`}
            change={12}
            subtitle="+143k reach this month"
            icon={<Users className="h-4 w-4" />}
            gradient="from-orange-500 to-amber-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Follower Trend */}
          <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Follower Trend</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-cyan-400">Growth</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">Loss</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FollowerTrendChart data={chartData} />
            </CardContent>
          </Card>

          {/* Audience Insights Placeholder */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Audience Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 text-sm space-y-4">
              <div>
                <div className="mb-2 text-gray-500 text-xs">GENDER DISTRIBUTION</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Female</span>
                    <span className="text-pink-400">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Male</span>
                    <span className="text-blue-400">66%</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-gray-500 text-xs">AGE RANGE</div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>18-24</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>25-34</span>
                      <span>30%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>35-44</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing & Media Kit Grid - Keep existing */}
        <div className="grid gap-8 lg:grid-cols-2">
          <PricingManager initialPricing={(creator as any).pricing || undefined} />
          <MediaKitManager
            initialMediaKit={(creator as any).mediaKit || undefined}
            rawSocialData={(creator as any).rawSocialData || undefined}
          />
        </div>

      </div>
    </div>
  )
}
