'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Instagram, Rocket, Sparkles, TrendingUp, User, Youtube } from 'lucide-react'
import { saveProfileSetup } from './actions'
import {
    SHARED_CREATOR_FOLLOWER_RANGES,
    SHARED_NICHE_LABELS,
    SHARED_PLATFORM_OPTIONS,
} from '@/lib/onboarding-taxonomy'

const TOTAL_SLIDES = 7

const PLATFORMS = SHARED_PLATFORM_OPTIONS.map((platform) => ({
    id: platform.id,
    label: platform.label,
    icon: platform.id === 'instagram' ? Instagram : Youtube,
    color: platform.id === 'instagram' ? 'from-pink-500 to-purple-500' : 'from-red-500 to-red-600',
    bg: platform.id === 'instagram' ? 'bg-pink-500/10' : 'bg-red-500/10',
    border: platform.id === 'instagram' ? 'border-pink-500/30' : 'border-red-500/30',
}))

const NICHES = SHARED_NICHE_LABELS.map((label) => ({
    id: label,
    label,
}))

const FOLLOWER_RANGES = SHARED_CREATOR_FOLLOWER_RANGES.map((range) => range.label)

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 280 : -280, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 280 : -280, opacity: 0, scale: 0.95 }),
}

export default function ProfileSetupClient({ userId }: { userId: string }) {
    void userId
    const router = useRouter()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [direction, setDirection] = useState(0)
    const [saving, setSaving] = useState(false)

    const [fullName, setFullName] = useState('')
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
    const [selectedNiche, setSelectedNiche] = useState('')
    const [followerRange, setFollowerRange] = useState('')
    const [engagementRate, setEngagementRate] = useState('')
    const [executionReady, setExecutionReady] = useState('')
    const [showFollowerDropdown, setShowFollowerDropdown] = useState(false)

    const goNext = useCallback(() => {
        if (currentSlide < TOTAL_SLIDES - 1) {
            setDirection(1)
            setCurrentSlide((prev) => prev + 1)
        }
    }, [currentSlide])

    const goBack = useCallback(() => {
        if (currentSlide > 0) {
            setDirection(-1)
            setCurrentSlide((prev) => prev - 1)
        }
    }, [currentSlide])

    const togglePlatform = (id: string) => {
        setSelectedPlatforms((prev) =>
            prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
        )
    }

    const handleComplete = async () => {
        setSaving(true)
        try {
            await saveProfileSetup({
                fullName,
                platforms: selectedPlatforms,
                niche: selectedNiche,
                followerRange,
                engagementRate,
                executionReady,
            })
            router.push('/creator/onboarding/finalize')
        } catch (error) {
            console.error('Failed to save profile setup', error)
            setSaving(false)
        }
    }

    const canProceed = () => {
        switch (currentSlide) {
            case 0:
                return true
            case 1:
                return fullName.trim().length > 0
            case 2:
                return selectedPlatforms.length > 0
            case 3:
                return selectedNiche !== ''
            case 4:
                return followerRange !== ''
            case 5:
                return true
            case 6:
                return executionReady.trim().length > 0
            default:
                return true
        }
    }

    const progress = ((currentSlide + 1) / TOTAL_SLIDES) * 100

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-lg mb-8 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Step {currentSlide + 1} of {TOTAL_SLIDES}</span>
                    <span className="text-xs font-bold text-purple-300">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                </div>
            </div>

            <div className="w-full max-w-lg relative z-10 min-h-[380px] flex items-center justify-center">
                <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35 }}
                        className="w-full"
                    >
                        {currentSlide === 0 && (
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">Welcome Creator</h1>
                                <p className="text-white/60 text-lg mb-10 max-w-sm mx-auto leading-relaxed">Set up your micro-influencer profile for manager-led campaign assignments.</p>
                                <button onClick={goNext} className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-purple-500/30 hover:scale-[1.02]">
                                    Start
                                    <Rocket className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {currentSlide === 1 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-6">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Full name</h2>
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Priya Sharma" className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-purple-400/60" autoFocus />
                            </div>
                        )}

                        {currentSlide === 2 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Select platforms</h2>
                                <div className="grid grid-cols-1 gap-3 mt-6">
                                    {PLATFORMS.map((platform) => {
                                        const Icon = platform.icon
                                        const selected = selectedPlatforms.includes(platform.id)
                                        return (
                                            <button key={platform.id} onClick={() => togglePlatform(platform.id)} className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all ${selected ? `${platform.bg} ${platform.border}` : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? `bg-gradient-to-br ${platform.color}` : 'bg-white/10'}`}><Icon className="w-5 h-5 text-white" /></div>
                                                <span className="font-semibold text-sm text-white flex-1 text-left">{platform.label}</span>
                                                {selected && <Check className="w-4 h-4 text-white" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {currentSlide === 3 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Primary niche</h2>
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    {NICHES.map((niche) => {
                                        const selected = selectedNiche === niche.id
                                        return (
                                            <button key={niche.id} onClick={() => setSelectedNiche(niche.id)} className={`px-4 py-3.5 rounded-xl border-2 text-sm font-semibold text-left ${selected ? 'bg-purple-500/20 border-purple-400/50 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'}`}>
                                                {niche.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {currentSlide === 4 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Follower range</h2>
                                <div className="relative mt-6">
                                    <button onClick={() => setShowFollowerDropdown(!showFollowerDropdown)} className="w-full flex items-center justify-between px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-left">
                                        <span className={followerRange ? 'text-white font-medium' : 'text-white/30'}>{followerRange || 'Select follower range'}</span>
                                        <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${showFollowerDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {showFollowerDropdown && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-white/10 rounded-2xl overflow-hidden z-50">
                                                {FOLLOWER_RANGES.map((range) => (
                                                    <button key={range} onClick={() => { setFollowerRange(range); setShowFollowerDropdown(false) }} className={`w-full px-5 py-3.5 text-left text-sm font-medium ${followerRange === range ? 'bg-purple-500/20 text-purple-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                                                        {range}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {currentSlide === 5 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Average engagement rate</h2>
                                <p className="text-white/50 text-sm mb-8">Optional</p>
                                <div className="relative">
                                    <input type="number" step="0.1" min="0" max="100" value={engagementRate} onChange={(e) => setEngagementRate(e.target.value)} placeholder="e.g. 6.5" className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-lg placeholder:text-white/30 pr-12 focus:outline-none focus:border-purple-400/60" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">%</span>
                                </div>
                            </div>
                        )}

                        {currentSlide === 6 && (
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-white mb-4">Delivery readiness</h2>
                                <input type="text" value={executionReady} onChange={(e) => setExecutionReady(e.target.value)} placeholder="e.g. 3-5 days for first draft" className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-purple-400/60" />
                                <button onClick={handleComplete} disabled={saving || !canProceed()} className="mt-6 group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-green-500/30 disabled:opacity-70">
                                    {saving ? 'Saving...' : 'Continue to Finalize'}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {currentSlide > 0 && currentSlide < TOTAL_SLIDES - 1 && (
                <div className="w-full max-w-lg flex items-center justify-between mt-8 relative z-10">
                    <button onClick={goBack} className="flex items-center gap-2 px-5 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button onClick={goNext} disabled={!canProceed()} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl disabled:opacity-40 text-sm">
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}

