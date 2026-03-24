"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowRight, Check, ChevronLeft, Building2, Megaphone, Users, Target,
    DollarSign, Smartphone, Instagram, Youtube, Facebook, Twitter, Linkedin,
    TrendingUp, Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"
import { submitBrandOnboarding } from "@/app/actions/onboarding"
import { useSession } from "next-auth/react"

// Types
type OnboardingData = {
    brandName: string
    campaignType: string
    budget: string
    minFollowers: number
    maxFollowers: number
    platforms: string[]
    creatorType: string
    campaignGoals: string
}

// Follower tiers
const followerTiers = [
    {
        label: "Micro Core",
        desc: "10K â€“ 100K followers",
        badge: "High Engagement",
        min: 10000,
        max: 100000,
        color: "from-blue-400 to-cyan-500"
    },
    {
        label: "Micro Scale",
        desc: "100K â€“ 500K followers",
        badge: "Broad Reach",
        min: 100000,
        max: 500000,
        color: "from-violet-400 to-purple-500"
    },
]

// Removed priceTiers as pricing is now internal

const steps = [
    { id: 1, title: "Welcome" },
    { id: 2, title: "Brand Name" },
    { id: 3, title: "Campaign Type" },
    { id: 4, title: "Budget" },
    { id: 5, title: "Target Followers" },
    { id: 6, title: "Platforms" },
    { id: 7, title: "Creator Type" },
    { id: 8, title: "Goals" },
    { id: 9, title: "Success" }
]

const TOTAL_VISIBLE_STEPS = steps.length - 1 // exclude success screen from count

export default function BrandOnboarding() {
    const router = useRouter()
    const { update } = useSession()

    const [currentStep, setCurrentStep] = useState(1)
    const [direction, setDirection] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<OnboardingData>({
        brandName: "",
        campaignType: "",
        budget: "",
        minFollowers: 10000,
        maxFollowers: 100000,
        platforms: [],
        creatorType: "",
        campaignGoals: ""
    })

    const SUBMIT_STEP = 8 // step 8 (Goals) triggers submission before step 9 (Success)

    const handleNext = async () => {
        if (currentStep === SUBMIT_STEP) {
            setIsSubmitting(true)
            const result = await submitBrandOnboarding(formData)
            setIsSubmitting(false)

            if (result.error) {
                alert(result.error)
                return
            }

            await update({ onboardingComplete: true })
            setDirection(1)
            setCurrentStep((prev) => prev + 1)
        } else if (currentStep < steps.length) {
            setDirection(1)
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1 && !isSubmitting) {
            setDirection(-1)
            setCurrentStep((prev) => prev - 1)
        }
    }

    const updateData = (key: keyof OnboardingData, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    const togglePlatform = (platform: string) => {
        setFormData((prev) => {
            const platforms = prev.platforms.includes(platform)
                ? prev.platforms.filter((p) => p !== platform)
                : [...prev.platforms, platform]
            return { ...prev, platforms }
        })
    }

    const handleGoToDashboard = () => {
        router.push("/brand/campaigns/new")
    }

    // Animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    }

    const progressPercentage = ((currentStep - 1) / TOTAL_VISIBLE_STEPS) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-200 z-50">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden min-h-[580px] flex flex-col">
                {/* Back Button */}
                {currentStep > 1 && currentStep < 9 && (
                    <button
                        onClick={handleBack}
                        className="absolute top-8 left-8 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                    >
                        <ChevronLeft size={22} />
                    </button>
                )}

                {/* Step Indicator */}
                {currentStep < 9 && (
                    <div className="absolute top-8 right-8 text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {currentStep} / {TOTAL_VISIBLE_STEPS}
                    </div>
                )}

                <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="wait">

                        {/* â”€â”€ STEP 1: WELCOME â”€â”€ */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="flex flex-col items-center text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mb-2">
                                    <Target className="w-10 h-10 text-blue-600" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                                    Welcome to <br /><span className="text-blue-600">Book My Influencers</span>
                                </h1>
                                <p className="text-lg text-gray-500 max-w-md">
                                    Our internal project managers handle the entire execution, from matching to delivery. Let's personalize your brand profile first.
                                </p>
                                <button
                                    onClick={handleNext}
                                    className="mt-6 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    Get Started <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}

                        {/* â”€â”€ STEP 2: BRAND NAME â”€â”€ */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-bold text-gray-900">What is your Brand Name?</h2>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.brandName}
                                        onChange={(e) => updateData("brandName", e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter" && formData.brandName) handleNext() }}
                                        placeholder="Enter your brand name"
                                        className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.brandName}
                                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {/* â”€â”€ STEP 3: CAMPAIGN TYPE â”€â”€ */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-bold text-gray-900">What type of campaign?</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: "Product Promotion", icon: Megaphone },
                                        { label: "Brand Awareness", icon: Target },
                                        { label: "App Installs", icon: Smartphone },
                                        { label: "Event Promotion", icon: Building2 },
                                        { label: "Affiliate Marketing", icon: DollarSign },
                                        { label: "Other", icon: Users },
                                    ].map((option) => (
                                        <button
                                            key={option.label}
                                            onClick={() => {
                                                updateData("campaignType", option.label)
                                                handleNext()
                                            }}
                                            className={`p-5 border-2 rounded-2xl flex items-center gap-4 transition-all text-left group
                      ${formData.campaignType === option.label
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl transition-colors ${formData.campaignType === option.label ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"}`}>
                                                <option.icon size={22} />
                                            </div>
                                            <span className="font-semibold text-gray-800">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* â”€â”€ STEP 4: BUDGET â”€â”€ */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="space-y-5"
                            >
                                <h2 className="text-3xl font-bold text-gray-900">Total campaign budget?</h2>
                                <div className="space-y-3">
                                    {["Under â‚¹10,000", "â‚¹10,000 â€“ â‚¹50,000", "â‚¹50,000 â€“ â‚¹2,00,000", "â‚¹2,00,000+"].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                updateData("budget", option)
                                                handleNext()
                                            }}
                                            className={`w-full p-5 border-2 rounded-2xl text-left font-semibold text-lg transition-all flex justify-between items-center
                        ${formData.budget === option
                                                    ? "border-blue-600 bg-blue-50 text-blue-800"
                                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                                                }`}
                                        >
                                            {option}
                                            {formData.budget === option && <Check className="text-blue-600" size={18} />}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 font-medium">â‚¹</span>
                                    <input
                                        type="text"
                                        placeholder="Enter custom amount"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        onChange={(e) => updateData("budget", e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleNext} className="text-blue-600 font-semibold hover:underline text-sm">Skip</button>
                                </div>
                            </motion.div>
                        )}

                        {/* â”€â”€ STEP 5: TARGET FOLLOWER RANGE (NEW) â”€â”€ */}
                        {currentStep === 5 && (
                            <motion.div
                                key="step5"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">Target creator size?</h2>
                                    <p className="text-gray-500 mt-2">Select the follower range that fits your campaign.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {followerTiers.map((tier) => {
                                        const isSelected = formData.minFollowers === tier.min && formData.maxFollowers === tier.max
                                        return (
                                            <button
                                                key={tier.label}
                                                onClick={() => {
                                                    updateData("minFollowers", tier.min)
                                                    updateData("maxFollowers", tier.max)
                                                }}
                                                className={`p-5 border-2 rounded-2xl text-left transition-all hover:shadow-md relative overflow-hidden group
                          ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                                                        <Users className="w-5 h-5 text-white" />
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold text-lg text-gray-900">{tier.label}</div>
                                                <div className="text-sm text-gray-500 mt-0.5">{tier.desc}</div>
                                                <span className="mt-2 inline-block text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tier.badge}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.minFollowers}
                                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {/* â”€â”€ STEP 6: PLATFORMS â”€â”€ */}
                        {currentStep === 6 && (
                            <motion.div
                                key="step6"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-bold text-gray-900">Target Platforms?</h2>
                                <p className="text-gray-500">Select all that apply</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: "Instagram", icon: Instagram, color: "text-pink-600" },
                                        { id: "YouTube", icon: Youtube, color: "text-red-600" },
                                    ].map((platform) => (
                                        <button
                                            key={platform.id}
                                            onClick={() => togglePlatform(platform.id)}
                                            className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all
                        ${formData.platforms.includes(platform.id)
                                                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <platform.icon className={`w-8 h-8 ${platform.color}`} />
                                            <span className="font-semibold text-gray-800">{platform.id}</span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleNext}
                                    disabled={formData.platforms.length === 0}
                                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {/* â”€â”€ STEP 7: CREATOR TYPE â”€â”€ */}
                        {currentStep === 7 && (
                            <motion.div
                                key="step7"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-bold text-gray-900">Preferred Creators?</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: "Micro Core", desc: "10Kâ€“100K followers", range: "High Engagement" },
                                        { label: "Micro Scale", desc: "100Kâ€“500K followers", range: "Broad Reach" }
                                    ].map((option) => (
                                        <button
                                            key={option.label}
                                            onClick={() => {
                                                updateData("creatorType", option.label)
                                                handleNext()
                                            }}
                                            className={`w-full p-5 border-2 rounded-2xl text-left transition-all hover:shadow-md
                        ${formData.creatorType === option.label
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-lg text-gray-900">{option.label}</span>
                                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-lg text-gray-600">{option.range}</span>
                                            </div>
                                            <p className="text-gray-500 text-sm">{option.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* â”€â”€ STEP 8: GOALS â”€â”€ */}
                        {currentStep === 8 && (
                            <motion.div
                                key="step8"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-bold text-gray-900">Campaign Goals</h2>
                                <p className="text-gray-500">Tell us a bit more about what you want to achieve.</p>
                                <textarea
                                    value={formData.campaignGoals}
                                    onChange={(e) => updateData("campaignGoals", e.target.value)}
                                    placeholder="E.g., We want to increase brand awareness among Gen Z..."
                                    className="w-full h-40 p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none resize-none text-base"
                                />
                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Savingâ€¦
                                        </>
                                    ) : "Finish Setup"}
                                </button>
                            </motion.div>
                        )}

                                {/* â”€â”€ STEP 9: SUCCESS â”€â”€ */}
                        {currentStep === 9 && (
                            <motion.div
                                key="step9"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="flex flex-col items-center text-center space-y-5"
                            >
                                {/* Animated success ring */}
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                                    className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                                </motion.div>

                                <h1 className="text-4xl font-bold text-gray-900">You're All Set!</h1>
                                <p className="text-gray-500 max-w-md text-base">
                                    We've personalised your experience. Our internal project managers will now handle the matching and execution for you.
                                </p>

                                {/* Preference summary chips */}
                                <div className="flex flex-wrap justify-center gap-2 text-sm">
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100 flex items-center gap-1.5">
                                        <Users size={14} />
                                        {followerTiers.find(t => t.min === formData.minFollowers)?.label ?? "Any"} creators
                                    </span>
                                    {formData.platforms.length > 0 && (
                                        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full font-medium border border-purple-100 flex items-center gap-1.5">
                                            <TrendingUp size={14} />
                                            {formData.platforms.slice(0, 2).join(", ")}{formData.platforms.length > 2 ? ` +${formData.platforms.length - 2}` : ""}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                                    <button
                                        onClick={handleGoToDashboard}
                                        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={18} />
                                        Create Campaign
                                    </button>
                                    <button
                                        onClick={() => router.push("/brand")}
                                        className="flex-1 py-4 bg-gray-100 text-gray-700 text-base font-semibold rounded-2xl hover:bg-gray-200 transition-all"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}


