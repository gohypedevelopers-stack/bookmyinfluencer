"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowUpRight,
  Award,
  Calendar,
  Check,
  DollarSign,
  Download,
  Facebook,
  Handshake,
  Instagram,
  Linkedin,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Twitter,
  Users,
  Youtube,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCreatorDashboardData } from "@/app/(creator)/creator/actions"

function formatMoney(value: number) {
  return `Rs.${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.max(0, value || 0))}`
}

export default function CreatorDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [platform, setPlatform] = useState<string>("instagram")
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>(["instagram"])
  const [dateRange, setDateRange] = useState<number>(30)
  const fetchStateRef = useRef<{ key: string; inFlight: boolean }>({ key: "", inFlight: false })

  useEffect(() => {
    fetchDashboardData()
  }, [platform, dateRange])

  async function fetchDashboardData() {
    const key = `${platform}:${dateRange}`
    if (fetchStateRef.current.inFlight && fetchStateRef.current.key === key) {
      return
    }

    fetchStateRef.current = { key, inFlight: true }
    setLoading(true)
    try {
      const data = await getCreatorDashboardData(platform, dateRange)
      setDashboardData(data)
      if (data?.platforms && Array.isArray(data.platforms)) {
        setAvailablePlatforms(data.platforms)
        const currentValid = data.platforms.some((p: string) => p.toLowerCase() === platform.toLowerCase())
        if (!currentValid && data.platforms.length > 0) {
          setPlatform(data.platforms[0].toLowerCase())
        }
      }
    } catch (_error) {
      toast.error("Failed to fetch dashboard data")
    } finally {
      fetchStateRef.current.inFlight = false
      setLoading(false)
    }
  }

  function handleExport() {
    if (!dashboardData) {
      toast.error("No data to export")
      return
    }

    const csvContent = [
      ["Metric", "Value"],
      ["Total Revenue", formatMoney(dashboardData.totalRevenue)],
      ["Active Collaborations", dashboardData.activeCollaborations],
      ["Follower Growth", `+${dashboardData.followerGrowth}k`],
      ["Followers", dashboardData.followers],
      ["Engagement Rate", `${dashboardData.engagementRate}%`],
      ["Platform", platform],
      ["Date Range", `Last ${dateRange} Days`],
    ].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `creator_dashboard_${platform}_${dateRange}days_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Dashboard data exported successfully")
  }

  if (loading && !dashboardData) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  const userName = dashboardData?.userName || "Creator"
  const totalRevenue = Number(dashboardData?.totalRevenue || 0)
  const activeCollabs = Number(dashboardData?.activeCollaborations || 0)
  const followerGrowth = Number(dashboardData?.followerGrowth || 0)
  const followers = Number(dashboardData?.followers || 0)
  const engagementRate = Number(dashboardData?.engagementRate || 0)
  const readinessScore = Math.max(18, Math.min(96, Math.round(engagementRate * 4 + activeCollabs * 12 + Math.min(followers / 20000, 32))))
  const earningsMomentum = totalRevenue > 0 ? "Revenue is moving from live work." : "Revenue starts once manager-approved work is released."
  const collabStatus = activeCollabs > 0 ? `${activeCollabs} live collaboration${activeCollabs > 1 ? "s" : ""}` : "No live collaborations yet"
  const growthStatus = followers > 0 ? `${new Intl.NumberFormat("en-IN").format(followers)} followers tracked` : "Connect platforms to track growth"

  const getPlatformIcon = (p: string) => {
    const lower = p.toLowerCase()
    if (lower.includes("instagram")) return Instagram
    if (lower.includes("youtube")) return Youtube
    if (lower.includes("facebook")) return Facebook
    if (lower.includes("linkedin")) return Linkedin
    if (lower.includes("twitter") || lower.includes("x")) return Twitter
    return Users
  }

  const getPlatformAccent = (p: string) => {
    const lower = p.toLowerCase()
    if (lower.includes("instagram")) return "text-pink-600"
    if (lower.includes("youtube")) return "text-red-600"
    if (lower.includes("facebook")) return "text-blue-600"
    if (lower.includes("linkedin")) return "text-sky-700"
    if (lower.includes("twitter") || lower.includes("x")) return "text-sky-500"
    return "text-slate-600"
  }

  const summaryCards = [
    {
      label: "Revenue",
      value: formatMoney(totalRevenue),
      note: earningsMomentum,
      accent: "from-violet-500/18 via-fuchsia-500/10 to-white",
      iconWrap: "bg-violet-500/12 text-violet-600",
      icon: DollarSign,
    },
    {
      label: "Live Work",
      value: String(activeCollabs),
      note: collabStatus,
      accent: "from-sky-500/18 via-cyan-500/10 to-white",
      iconWrap: "bg-sky-500/12 text-sky-600",
      icon: Handshake,
    },
    {
      label: "Audience",
      value: followers > 0 ? new Intl.NumberFormat("en-IN").format(followers) : "0",
      note: growthStatus,
      accent: "from-emerald-500/18 via-teal-500/10 to-white",
      iconWrap: "bg-emerald-500/12 text-emerald-600",
      icon: Users,
    },
    {
      label: "Engagement",
      value: `${engagementRate.toFixed(1)}%`,
      note: engagementRate > 0 ? "Signals used in campaign matching" : "Waiting for stronger metric history",
      accent: "from-amber-500/18 via-orange-500/10 to-white",
      iconWrap: "bg-amber-500/12 text-amber-600",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8">
        <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_48%,#7c3aed_100%)] p-5 md:p-8 text-white shadow-[0_35px_90px_-45px_rgba(79,70,229,0.75)]">
          <div className="pointer-events-none absolute right-[-40px] top-[-60px] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-70px] left-[-30px] h-52 w-52 rounded-full bg-fuchsia-400/15 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-100">
                <Award className="h-4 w-4" />
                Creator Command Deck
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Welcome back, {userName}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                Track platform momentum, monitor collaboration readiness, and keep your creator profile sharp for manager-led campaign opportunities.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/creator/analytics">
                  <Button className="h-12 rounded-2xl bg-white text-slate-950 shadow-lg shadow-slate-950/20 hover:bg-slate-100">
                    View Analytics
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/creator/profile">
                  <Button variant="outline" className="h-12 rounded-2xl border-white/20 bg-white/10 px-6 text-white hover:bg-white/15">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative w-full max-w-[360px] space-y-4">
              <div className="rounded-[28px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-100">Account Snapshot</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">Readiness</p>
                    <p className="mt-2 text-3xl font-black">{readinessScore}%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">Active Work</p>
                    <p className="mt-2 text-3xl font-black">{activeCollabs}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-[28px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/12 bg-slate-950/25 p-1.5">
                  {availablePlatforms.map((p) => {
                    const Icon = getPlatformIcon(p)
                    const isSelected = platform.toLowerCase() === p.toLowerCase()
                    return (
                      <button
                        key={p}
                        onClick={() => setPlatform(p.toLowerCase())}
                        className={`flex min-w-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isSelected ? "bg-white text-slate-950 shadow-sm" : "text-slate-200 hover:bg-white/10"}`}
                      >
                        <Icon className={`h-4 w-4 ${isSelected ? getPlatformAccent(p) : "text-slate-300"}`} />
                        <span className="truncate">{p}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-11 rounded-2xl border-white/18 bg-white/10 text-white hover:bg-white/15">
                        <Calendar className="mr-2 h-4 w-4" />
                        Last {dateRange} Days
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-2xl border-slate-200 p-2 shadow-xl">
                      {[7, 30, 90].map((days) => (
                        <DropdownMenuItem
                          key={days}
                          onClick={() => setDateRange(days)}
                          className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 ${dateRange === days ? "bg-violet-50 font-bold text-violet-700" : "text-slate-600 hover:bg-slate-50"}`}
                        >
                          Last {days} Days
                          {dateRange === days && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="outline" size="sm" className="h-11 rounded-2xl border-white/18 bg-white text-slate-900 hover:bg-slate-100" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={platform}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-8"
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => {
                const Icon = card.icon
                return (
                  <Card key={card.label} className={`overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.92)),linear-gradient(135deg,var(--tw-gradient-stops))] ${card.accent} p-6 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.35)]`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconWrap}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{card.value}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{card.note}</p>
                  </Card>
                )
              })}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
              <Card className="rounded-[32px] border border-white/80 bg-white/90 p-7 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.3)]">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-500">Performance Snapshot</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Creator momentum in one glance</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      A cleaner view of your earnings, audience signal, and collaboration readiness without filler placeholders.
                    </p>
                  </div>
                  <Link href="/creator/campaigns">
                    <Button variant="outline" className="h-11 rounded-2xl border-slate-200 bg-slate-50 px-5 text-slate-700 hover:bg-white">
                      Open Campaigns
                    </Button>
                  </Link>
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Campaign Readiness</p>
                    <p className="mt-3 text-3xl font-black text-slate-950">{readinessScore}%</p>
                    <div className="mt-4 h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,#7c3aed_0%,#2563eb_100%)]" style={{ width: `${readinessScore}%` }} />
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Platform Focus</p>
                    <p className="mt-3 text-3xl font-black text-slate-950 capitalize">{platform}</p>
                    <p className="mt-3 text-sm text-slate-500">Using the latest {dateRange}-day metric window for the current snapshot.</p>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Live Signal</p>
                    <p className="mt-3 text-3xl font-black text-slate-950">{engagementRate.toFixed(1)}%</p>
                    <p className="mt-3 text-sm text-slate-500">Better engagement and profile depth increase manager shortlist confidence.</p>
                  </div>
                </div>

                <div className="mt-7 rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#f8fafc_45%,#eef2ff_100%)] p-6">
                  <div className="flex items-center gap-2 text-slate-950">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">What to improve next</p>
                  </div>
                  <div className="mt-5 space-y-4">
                    <ProgressRow label="Profile strength" value={Math.min(96, Math.round(55 + Math.min(followers / 10000, 30)))} tone="violet" />
                    <ProgressRow label="Collaboration readiness" value={Math.min(92, Math.round(28 + activeCollabs * 18))} tone="blue" />
                    <ProgressRow label="Audience quality signal" value={Math.min(96, Math.round(25 + engagementRate * 6))} tone="emerald" />
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.3)]">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-500">Positioning</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">How the system sees your profile</h3>
                  <div className="mt-6 space-y-4">
                    <InsightCard title="Audience scale" value={followers > 0 ? new Intl.NumberFormat("en-IN").format(followers) : "Connect profile"} description="Follower count is used for shortlist fit and campaign tier placement." />
                    <InsightCard title="Creator demand signal" value={`${activeCollabs} live`} description="Manager-led work starts appearing here once brands confirm and payment clears." />
                    <InsightCard title="Engagement signal" value={`${engagementRate.toFixed(1)}%`} description="Healthy engagement improves your placement inside campaign recommendation pools." />
                  </div>
                </Card>

                <Card className="rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.3)]">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Quick Actions</p>
                  <div className="mt-5 space-y-3">
                    <QuickLink href="/creator/campaigns" title="Review campaign requests" description="Respond fast to manager-led invites and keep the queue moving." />
                    <QuickLink href="/creator/profile" title="Polish your profile" description="Sharper niche, bio, and proof points improve shortlist quality." />
                    <QuickLink href="/creator/earnings" title="Track payouts" description="See released amounts and upcoming earnings workflow updates." />
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ProgressRow({ label, value, tone }: { label: string; value: number; tone: "violet" | "blue" | "emerald" }) {
  const toneClass = {
    violet: "bg-[linear-gradient(90deg,#7c3aed_0%,#8b5cf6_100%)]",
    blue: "bg-[linear-gradient(90deg,#2563eb_0%,#38bdf8_100%)]",
    emerald: "bg-[linear-gradient(90deg,#059669_0%,#2dd4bf_100%)]",
  }[tone]

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white">
        <div className={`h-2 rounded-full ${toneClass}`} style={{ width: `${Math.max(8, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

function InsightCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="block rounded-[24px] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Target className="h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}
