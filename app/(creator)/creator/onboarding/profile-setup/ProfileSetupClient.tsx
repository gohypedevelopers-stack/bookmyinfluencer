'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles, ArrowRight, ArrowLeft, User, Instagram, Youtube, Twitter,
    Linkedin, Facebook, Check, TrendingUp, DollarSign, Rocket, ChevronDown
} from 'lucide-react'
import { saveProfileSetup } from './actions'

const TOTAL_SLIDES = 8

const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    { id: 'twitter', label: 'Twitter (X)', icon: Twitter, color: 'from-sky-400 to-blue-500', bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-700', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-500 to-indigo-600', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
]

const NICHES = [
    { id: 'fashion', label: 'Fashion', emoji: '👗' },
    { id: 'tech', label: 'Tech', emoji: '💻' },
    { id: 'fitness', label: 'Fitness', emoji: '💪' },
    { id: 'finance', label: 'Finance', emoji: '💰' },
    { id: 'travel', label: 'Travel', emoji: '✈️' },
    { id: 'food', label: 'Food', emoji: '🍕' },
    { id: 'gaming', label: 'Gaming', emoji: '🎮' },
    { id: 'lifestyle', label: 'Lifestyle', emoji: '🌟' },
    { id: 'education', label: 'Education', emoji: '📚' },
    { id: 'other', label: 'Other', emoji: '🎯' },
]

const FOLLOWER_RANGES = [
    '1K - 10K (Nano)',
    '10K - 50K (Micro)',
    '50K - 100K (Mid-Tier)',
    '100K - 500K (Macro)',
    '500K - 1M (Mega)',
    '1M+ (Celebrity)',
]

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.95,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.95,
    }),
}

export default function ProfileSetupClient({ userId }: { userId: string }) {
    const router = useRouter()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [direction, setDirection] = useState(0)
    const [saving, setSaving] = useState(false)

    // Form data
    const [fullName, setFullName] = useState('')
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
    const [selectedNiche, setSelectedNiche] = useState('')
    const [followerRange, setFollowerRange] = useState('')
    const [engagementRate, setEngagementRate] = useState('')
    const [collaborationRate, setCollaborationRate] = useState('')
    const [showFollowerDropdown, setShowFollowerDropdown] = useState(false)

    const goNext = useCallback(() => {
        if (currentSlide < TOTAL_SLIDES - 1) {
            setDirection(1)
            setCurrentSlide(prev => prev + 1)
        }
    }, [currentSlide])

    const goBack = useCallback(() => {
        if (currentSlide > 0) {
            setDirection(-1)
            setCurrentSlide(prev => prev - 1)
        }
    }, [currentSlide])

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
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
                collaborationRate,
            })
            router.push('/creator/onboarding/finalize')
        } catch (e) {
            console.error('Failed to save profile setup', e)
            setSaving(false)
        }
    }

    const progress = ((currentSlide + 1) / TOTAL_SLIDES) * 100

    // Can proceed to next slide?
    const canProceed = () => {
        switch (currentSlide) {
            case 0: return true // Welcome
            case 1: return fullName.trim().length > 0
            case 2: return selectedPlatforms.length > 0
            case 3: return selectedNiche !== ''
            case 4: return followerRange !== ''
            case 5: return true // optional
            case 6: return collaborationRate.trim().length > 0
            case 7: return true // final
            default: return true
        }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
            {/* Ambient background effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[150px]" />
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-lg mb-8 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                        Step {currentSlide + 1} of {TOTAL_SLIDES}
                    </span>
                    <span className="text-xs font-bold text-purple-300">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-2 mt-4">
                    {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={`rounded-full transition-all duration-300 ${i === currentSlide
                                ? 'w-6 h-2 bg-gradient-to-r from-purple-400 to-pink-400'
                                : i < currentSlide
                                    ? 'w-2 h-2 bg-purple-400/60'
                                    : 'w-2 h-2 bg-white/20'
                                }`}
                            layout
                        />
                    ))}
                </div>
            </div>

            {/* Slide content */}
            <div className="w-full max-w-lg relative z-10 min-h-[420px] flex items-center justify-center">
                <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="w-full"
                    >
                        {/* SLIDE 0 — Welcome */}
                        {currentSlide === 0 && (
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                    className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 rotate-12"
                                >
                                    <Sparkles className="w-10 h-10 text-white -rotate-12" />
                                </motion.div>
                                <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                                    Welcome <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">Creator!</span>
                                </h1>
                                <p className="text-white/60 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                                    Start earning by collaborating with top brands. Let&apos;s set up your profile in under 2 minutes.
                                </p>
                                <button
                                    onClick={goNext}
                                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    Let&apos;s Go
                                    <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        )}

                        {/* SLIDE 1 — Full Name */}
                        {currentSlide === 1 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">What&apos;s your Full Name?</h2>
                                <p className="text-white/50 text-sm mb-8">This is how brands will see you.</p>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. Priya Sharma"
                                    className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && canProceed() && goNext()}
                                />
                            </div>
                        )}

                        {/* SLIDE 2 — Platforms */}
                        {currentSlide === 2 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20">
                                    <Instagram className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Which platforms do you create on?</h2>
                                <p className="text-white/50 text-sm mb-6">Select all that apply.</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {PLATFORMS.map(p => {
                                        const Icon = p.icon
                                        const isSelected = selectedPlatforms.includes(p.id)
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => togglePlatform(p.id)}
                                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left group ${isSelected
                                                    ? `${p.bg} ${p.border} shadow-lg`
                                                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? `bg-gradient-to-br ${p.color}` : 'bg-white/10'}`}>
                                                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white/50'}`} />
                                                </div>
                                                <span className={`font-semibold text-sm flex-1 ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                                    {p.label}
                                                </span>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                                                    >
                                                        <Check className="w-3.5 h-3.5 text-white" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* SLIDE 3 — Niche */}
                        {currentSlide === 3 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">What is your primary niche?</h2>
                                <p className="text-white/50 text-sm mb-6">Pick the one that best represents your content.</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {NICHES.map(n => {
                                        const isSelected = selectedNiche === n.id
                                        return (
                                            <button
                                                key={n.id}
                                                onClick={() => setSelectedNiche(n.id)}
                                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                                                    ? 'bg-purple-500/20 border-purple-400/50 shadow-lg shadow-purple-500/10'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                                                    }`}
                                            >
                                                <span className="text-xl">{n.emoji}</span>
                                                <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                                    {n.label}
                                                </span>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="ml-auto w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center"
                                                    >
                                                        <Check className="w-3 h-3 text-white" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* SLIDE 4 — Follower Count */}
                        {currentSlide === 4 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">How many followers do you have?</h2>
                                <p className="text-white/50 text-sm mb-6">Across your primary platform.</p>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowFollowerDropdown(!showFollowerDropdown)}
                                        className="w-full flex items-center justify-between px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-left focus:outline-none focus:border-purple-400/60 transition-all hover:border-white/20"
                                    >
                                        <span className={followerRange ? 'text-white font-medium' : 'text-white/30'}>
                                            {followerRange || 'Select your range'}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${showFollowerDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {showFollowerDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                                            >
                                                {FOLLOWER_RANGES.map(range => (
                                                    <button
                                                        key={range}
                                                        onClick={() => {
                                                            setFollowerRange(range)
                                                            setShowFollowerDropdown(false)
                                                        }}
                                                        className={`w-full px-5 py-3.5 text-left text-sm font-medium transition-all ${followerRange === range
                                                            ? 'bg-purple-500/20 text-purple-300'
                                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        {range}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* SLIDE 5 — Engagement Rate */}
                        {currentSlide === 5 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Average engagement rate?</h2>
                                <p className="text-white/50 text-sm mb-8">Optional — you can skip this if unsure.</p>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={engagementRate}
                                        onChange={(e) => setEngagementRate(e.target.value)}
                                        placeholder="e.g. 3.5"
                                        className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 transition-all pr-12"
                                        onKeyDown={(e) => e.key === 'Enter' && goNext()}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">%</span>
                                </div>
                                <p className="text-white/30 text-xs mt-3">
                                    💡 Tip: Check your Instagram/YouTube analytics for this number.
                                </p>
                            </div>
                        )}

                        {/* SLIDE 6 — Collaboration Rates */}
                        {currentSlide === 6 && (
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                                    <DollarSign className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Collaboration rates?</h2>
                                <p className="text-white/50 text-sm mb-8">Your starting price per post/reel/video.</p>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={collaborationRate}
                                        onChange={(e) => setCollaborationRate(e.target.value)}
                                        placeholder="e.g. 5000"
                                        className="w-full pl-10 pr-16 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && canProceed() && goNext()}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 text-xs font-bold uppercase">INR</span>
                                </div>
                                <p className="text-white/30 text-xs mt-3">
                                    💡 You can always adjust this later from your dashboard.
                                </p>
                            </div>
                        )}

                        {/* SLIDE 7 — Complete */}
                        {currentSlide === 7 && (
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                                    className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30"
                                >
                                    <Check className="w-12 h-12 text-white" />
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight"
                                >
                                    Profile Setup <span className="bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">Complete!</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-white/60 text-lg mb-10 max-w-sm mx-auto"
                                >
                                    Brands can now discover you. Let&apos;s set up your pricing and finalize your profile.
                                </motion.p>
                                {/* Confetti-like dots */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    {[...Array(20)].map((_, i) => {
                                        const yOffset = -(80 + (i * 37) % 180)
                                        const xOffset = ((i * 47 + 13) % 400) - 200
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 0, x: 0 }}
                                                animate={{
                                                    opacity: [0, 1, 0],
                                                    y: [0, yOffset],
                                                    x: [0, xOffset],
                                                }}
                                                transition={{ delay: 0.2 + i * 0.05, duration: 1.5, ease: 'easeOut' }}
                                                className={`absolute left-1/2 top-1/2 w-2 h-2 rounded-full ${['bg-purple-400', 'bg-pink-400', 'bg-orange-400', 'bg-green-400', 'bg-blue-400'][i % 5]
                                                    }`}
                                            />
                                        )
                                    })}
                                </div>
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    onClick={handleComplete}
                                    disabled={saving}
                                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Continue to Finalize'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation buttons (hidden on welcome & final slides) */}
            {currentSlide > 0 && currentSlide < TOTAL_SLIDES - 1 && (
                <div className="w-full max-w-lg flex items-center justify-between mt-8 relative z-10">
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button
                        onClick={goNext}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                    >
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
