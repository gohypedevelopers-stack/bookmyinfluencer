"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Award,
  Instagram,
  Youtube,
  Download,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Handshake,
  Users,
  Calendar,
  Settings,
  Loader2,
  Check,
  Facebook,
  Linkedin,
  Twitter
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCreatorDashboardData } from "@/app/(creator)/creator/actions"

export default function CreatorDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [platform, setPlatform] = useState<string>("instagram") // instagram, youtube
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>(["instagram"])
  const [dateRange, setDateRange] = useState<number>(30) // 7, 30, 90

  useEffect(() => {
    fetchDashboardData()
  }, [platform, dateRange])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const data = await getCreatorDashboardData(platform, dateRange)
      setDashboardData(data)
      if (data?.platforms && Array.isArray(data.platforms)) {
        // Normalize platform names to lowercase for ID matching if needed, but display properly
        setAvailablePlatforms(data.platforms)

        // If current platform is not in available, switch to first available
        const currentValid = data.platforms.some((p: string) => p.toLowerCase() === platform.toLowerCase());
        if (!currentValid && data.platforms.length > 0) {
          setPlatform(data.platforms[0].toLowerCase());
        }
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  // ... (Export function remains same)
  function handleExport() {
    if (!dashboardData) {
      toast.error("No data to export")
      return
    }

    const csvContent = [
      ["Metric", "Value"],
      ["Total Revenue", `₹${dashboardData.totalRevenue}`],
      ["Active Collaborations", dashboardData.activeCollaborations],
      ["Follower Growth", `+${dashboardData.followerGrowth}k`],
      ["Followers", dashboardData.followers],
      ["Engagement Rate", `${dashboardData.engagementRate}%`],
      ["Platform", platform],
      ["Date Range", `Last ${dateRange} Days`]
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `dashboard_${platform}_${dateRange}days_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Dashboard data exported successfully!")
  }

  if (loading && !dashboardData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const userName = dashboardData?.userName || "Creator"
  const totalRevenue = dashboardData?.totalRevenue || 0
  const activeCollabs = dashboardData?.activeCollaborations || 0
  const followerGrowth = dashboardData?.followerGrowth || 0
  const followers = dashboardData?.followers || 0
  const engagementRate = dashboardData?.engagementRate || 0

  // Helper to get Icon
  const getPlatformIcon = (p: string) => {
    const lower = p.toLowerCase();
    if (lower.includes("instagram")) return Instagram;
    if (lower.includes("youtube")) return Youtube;
    if (lower.includes("facebook")) return Facebook;
    if (lower.includes("linkedin")) return Linkedin;
    if (lower.includes("twitter") || lower.includes("x")) return Twitter;
    return Users; // Default
  }

  const getPlatformColor = (p: string) => {
    const lower = p.toLowerCase();
    if (lower.includes("instagram")) return "text-pink-600";
    if (lower.includes("youtube")) return "text-red-600";
    if (lower.includes("facebook")) return "text-blue-600";
    if (lower.includes("linkedin")) return "text-blue-700";
    if (lower.includes("twitter")) return "text-blue-400";
    return "text-gray-600";
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-8 border border-purple-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Top 5% Creator</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h1>
              <p className="text-gray-600 mb-6">
                Your engagement is up {engagementRate}% this week. Three new brands are waiting for your approval.
              </p>
              <div className="flex gap-3">
                <Link href="/creator/analytics">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                    View Analytics
                  </Button>
                </Link>
                <Link href="/creator/profile">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Platform Filters & Actions */}
            <div className="flex items-center gap-3">
              {/* Platform Filter Tabs */}
              <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
                {availablePlatforms.map((p) => {
                  const Icon = getPlatformIcon(p);
                  const isSelected = platform.toLowerCase() === p.toLowerCase();
                  const colorClass = getPlatformColor(p);

                  return (
                    <button
                      key={p}
                      onClick={() => setPlatform(p.toLowerCase())}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 z-10 ${isSelected ? colorClass : "text-gray-500 hover:text-gray-900"}`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activePlatform"
                          className="absolute inset-0 bg-purple-50 rounded-lg -z-10 border border-purple-100"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon className="w-4 h-4" />
                      {p}
                    </button>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-600 outline-none">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      Last {dateRange} Days
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 p-2 rounded-2xl shadow-xl border-gray-100">
                    <DropdownMenuItem
                      onClick={() => setDateRange(7)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer ${dateRange === 7 ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      Last 7 Days {dateRange === 7 && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDateRange(30)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer ${dateRange === 30 ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      Last 30 Days {dateRange === 30 && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDateRange(90)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer ${dateRange === 90 ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      Last 90 Days {dateRange === 90 && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-gray-200 text-gray-600"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={platform}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                  <DollarSign className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Revenue</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</h3>
                  <span className="text-sm font-bold text-green-600 mb-1">+12.5%</span>
                </div>
              </Card>

              <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <Handshake className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Active Collaborations</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-gray-900">{activeCollabs} <span className="text-lg text-gray-400 font-normal">Contracts</span></h3>
                  <span className="text-sm font-bold text-green-600 mb-1">+3 today</span>
                </div>
              </Card>

              <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Follower Growth</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-gray-900">+{followerGrowth}k</h3>
                  <span className="text-sm font-bold text-green-600 mb-1">+{engagementRate}%</span>
                </div>
              </Card>
            </div>

            <div className="flex gap-8">
              {/* Main Chart Area */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Campaign Activity</h2>
                  <Link href="/creator/campaigns">
                    <Button variant="ghost" className="text-purple-600 font-semibold hover:bg-purple-50">View All</Button>
                  </Link>
                </div>

                <Card className="rounded-2xl border-gray-100 shadow-sm p-6 h-[300px] flex items-center justify-center bg-white">
                  <p className="text-gray-400 font-medium">Activity Chart Placeholder</p>
                </Card>
              </div>

              {/* Right Sidebar - Deadlines */}
              <div className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Next Deadlines</h2>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-gray-900 text-sm">Nike Summer Campaign</div>
                      <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">2d</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Reel Draft Review</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-purple-600 h-1.5 rounded-full w-2/3"></div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-gray-900 text-sm">TechPack Unboxing</div>
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">5d</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Content Shooting</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full w-1/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* User Profile Footer */}
        <div className="mt-8 flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{userName}</div>
              <div className="text-sm text-gray-500">Diamond Creator</div>
            </div>
          </div>
          <Link href="/creator/profile">
            <Settings className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
          </Link>
        </div>

      </div>
    </div>
  )
}
