"use client"

import { useState } from "react"
import { ArrowRight, Instagram, Youtube, Lock, RefreshCw, CheckCircle2, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function OnboardingClient() {
  const router = useRouter()
  // Mock data based on reference
  const instagramData = {
    handle: "@sarah__creates",
    followers: "124.5k",
    engagement: "4.2%",
    lastSynced: "2m ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces"
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white py-3 px-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 text-[#2dd4bf] flex items-center justify-center">
            {/* Logo Icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <circle cx="12" cy="12" r="3" />
              <circle cx="19" cy="12" r="2" opacity="0.5" />
              <circle cx="5" cy="12" r="2" opacity="0.5" />
              <circle cx="12" cy="19" r="2" opacity="0.5" />
              <circle cx="12" cy="5" r="2" opacity="0.5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">InfluencerSync</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors">Save Draft</button>
          <button className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
            Help
          </button>
        </div>
      </header>

      {/* Progress Bar Section */}
      <div className="w-full bg-white relative">
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-2">
          <div className="flex justify-between text-[10px] font-bold tracking-widest text-[#24b2a0] uppercase mb-2">
            <span>Step 2 of 3</span>
            <span className="text-gray-900">50% Complete</span>
          </div>
        </div>
        <div className="w-full h-1 bg-gray-100 absolute bottom-0 left-0">
          <div className="h-full w-1/2 bg-[#2dd4bf]" />
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Let's build your profile</h1>
          <p className="text-gray-500 text-sm max-w-xl leading-relaxed">
            Connect your social accounts to automatically import your audience demographics and engagement metrics. This data is what brands look for first.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Instagram Card (Connected) */}
          <Card className="p-5 border-none shadow-sm shadow-gray-200/50 bg-white rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fdf2f8] rounded-xl flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-[#db2777]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Instagram</h3>
                  <div className="inline-flex items-center gap-1 bg-[#ecfdf5] px-2 py-0.5 rounded-full mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-[#10b981] flex items-center justify-center">
                      <CheckCircle2 className="w-2 h-2 text-white stroke-[3]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#059669]">Connected</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-300 hover:text-gray-400 transition-colors bg-transparent p-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img src={instagramData.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Connected as</div>
                <div className="text-sm font-bold text-gray-900 leading-tight">@sarah__creates</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#f9fafb] rounded-xl p-3">
                <div className="text-[10px] text-gray-500 mb-0.5">Followers</div>
                <div className="text-lg font-bold text-gray-900">124.5k</div>
              </div>
              <div className="bg-[#f9fafb] rounded-xl p-3">
                <div className="text-[10px] text-gray-500 mb-0.5">Avg. Engmt</div>
                <div className="text-lg font-bold text-gray-900">4.2%</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                <RefreshCw className="w-3 h-3" />
                <span>Last synced 2m ago</span>
              </div>
              <button className="text-[10px] font-bold text-[#2dd4bf] hover:text-[#14b8a6] transition-colors">
                Refresh Data
              </button>
            </div>
          </Card>

          {/* YouTube Card */}
          <Card className="p-5 border-none shadow-sm shadow-gray-200/50 bg-white rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] flex flex-col h-full">
            {/* Top Border Red */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#fef2f2] rounded-xl flex items-center justify-center">
                <Youtube className="w-6 h-6 text-[#dc2626]" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">YouTube</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-bold text-gray-900 mb-1.5">Connect your channel</h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[240px]">
                Sync subscribers, average view counts, and video engagement metrics directly from YouTube API.
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-xs text-gray-600 font-medium">Verified audience demographics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-xs text-gray-600 font-medium">Historical performance tracking</span>
              </div>
            </div>

            <div className="mt-auto">
              <Button className="w-full h-10 bg-[#2dd4bf] hover:bg-[#14b8a6] text-white font-bold text-sm rounded-lg shadow-lg shadow-teal-500/20 mb-3 transition-all hover:-translate-y-0.5">
                Authorize & Fetch Stats
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium">
                <Lock className="w-3 h-3" />
                <span>Read-only access. We cannot post on your behalf.</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
          <button className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
            Back to Personal Details
          </button>
          <div className="flex items-center gap-6">
            <button className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
              Skip for now
            </button>
            <Button
              onClick={() => router.push('/creator/onboarding/finalize')}
              className="bg-gray-900 hover:bg-black text-white px-6 h-10 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-gray-900/10 transition-all hover:scale-[1.02]"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </main>
    </div>
  )
}
