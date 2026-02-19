"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowRight, Check, ChevronLeft, Sparkles, Instagram, Youtube, Facebook,
    Twitter, Linkedin, Gamepad2, Dumbbell, Utensils, Laptop, Shirt,
    GraduationCap, Globe, Heart, DollarSign, TrendingUp, User
} from "lucide-react"
import { useRouter } from "next/navigation"
import { submitCreatorOnboarding } from "@/app/actions/onboarding";
import { useSession } from "next-auth/react";

// Types
type CreatorData = {
    fullName: string
    platforms: string[]
    niche: string
    followers: string
    engagement: string
    rates: string
}

const steps = [
    { id: 1, title: "Welcome" },
    { id: 2, title: "Full Name" },
    { id: 3, title: "Platforms" },
    { id: 4, title: "Niche" },
    { id: 5, title: "Followers" },
    { id: 6, title: "Engagement" },
    { id: 7, title: "Rates" },
    { id: 8, title: "Success" }
]

export default function CreatorOnboarding() {
    const router = useRouter()
    const { update } = useSession()

    const [currentStep, setCurrentStep] = useState(1)
    const [direction, setDirection] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<CreatorData>({
        fullName: "",
        platforms: [],
        niche: "",
        followers: "",
        engagement: "",
        rates: ""
    })

    const handleNext = async () => {
        if (currentStep === 7) {
            // Submitting data
            setIsSubmitting(true);
            const result = await submitCreatorOnboarding(formData);

            if (result.error) {
                setIsSubmitting(false);
                alert(result.error);
                return;
            }

            // Success! Update session
            await update({ onboardingComplete: true });

            setIsSubmitting(false);

            setDirection(1)
            setCurrentStep((prev) => prev + 1)
        } else if (currentStep < steps.length) {
            setDirection(1)
            setCurrentStep((prev) => prev + 1)
        } else {
            // Explicitly refresh router before pushing
            router.refresh();
            router.push("/creator/dashboard")
        }
    }

    const handleBack = () => {
        if (currentStep > 1 && !isSubmitting) {
            setDirection(-1)
            setCurrentStep((prev) => prev - 1)
        }
    }

    const updateData = (key: keyof CreatorData, value: any) => {
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

    // Animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.95
        })
    }

    const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 overflow-hidden relative font-sans">

            {/* Background Animated Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                />
                <motion.div
                    animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 -right-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                />
            </div>

            {/* Main Glass Card */}
            <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden min-h-[650px] flex flex-col items-center justify-center relative z-10 text-white">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-white/10">
                    <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>

                {/* Back Button */}
                {currentStep > 1 && currentStep < 8 && (
                    <button
                        onClick={handleBack}
                        className="absolute top-8 left-8 p-2 rounded-full hover:bg-white/10 transition-colors text-white/80"
                    >
                        <ChevronLeft size={28} />
                    </button>
                )}

                {/* Content Area */}
                <div className="w-full p-8 md:p-12 flex flex-col items-center justify-center flex-1">
                    <AnimatePresence initial={false} custom={direction} mode="wait">

                        {/* Step 1: Welcome */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                className="flex flex-col items-center text-center space-y-8"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl rotate-3 shadow-lg flex items-center justify-center mb-2">
                                    <Sparkles className="w-12 h-12 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
                                        Welcome Creator!
                                    </h1>
                                    <p className="text-lg md:text-xl text-white/80 max-w-sm mx-auto leading-relaxed">
                                        Start earning by collaborating with top brands. It's time to monetize your passion.
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleNext}
                                    className="px-10 py-5 bg-white text-purple-600 text-xl font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all flex items-center gap-3"
                                >
                                    Let's Go <ArrowRight size={24} />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Step 2: Full Name */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                className="w-full max-w-md space-y-8"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <h2 className="text-3xl font-bold text-center">What’s your Full Name?</h2>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => updateData("fullName", e.target.value)}
                                        placeholder="e.g. Alex Rivera"
                                        className="w-full pl-12 pr-6 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-xl placeholder-white/40 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white"
                                        autoFocus
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    disabled={!formData.fullName}
                                    className="w-full py-5 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl font-bold text-lg hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Continue
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Step 3: Platforms */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                className="w-full max-w-md space-y-6"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-bold">Which platforms?</h2>
                                    <p className="text-white/70">Pick the ones you create on.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: "Instagram", icon: Instagram, color: "group-hover:text-pink-400" },
                                        { id: "YouTube", icon: Youtube, color: "group-hover:text-red-500" },
                                        { id: "TikTok", label: "TikTok", color: "group-hover:text-cyan-400" }, // Custom
                                        { id: "Twitter (X)", icon: Twitter, color: "group-hover:text-blue-400" },
                                        { id: "LinkedIn", icon: Linkedin, color: "group-hover:text-blue-600" },
                                        { id: "Facebook", icon: Facebook, color: "group-hover:text-blue-500" },
                                    ].map((p) => (
                                        <motion.button
                                            key={p.id}
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => togglePlatform(p.id)}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all group backdrop-blur-sm
                                ${formData.platforms.includes(p.id)
                                                    ? "bg-white text-purple-600 border-white shadow-lg"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                                }`}
                                        >
                                            {p.icon ? (
                                                <p.icon className={`w-8 h-8 ${!formData.platforms.includes(p.id) ? "text-white" : "text-purple-600"}`} />
                                            ) : (
                                                <span className="w-8 h-8 flex items-center justify-center font-bold text-lg">Tk</span>
                                            )}
                                            <span className="font-semibold">{p.id}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    disabled={formData.platforms.length === 0}
                                    className="w-full py-5 mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next Step
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Step 4: Niche */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                className="w-full max-w-md space-y-6"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <h2 className="text-3xl font-bold text-center">Your Primary Niche?</h2>
                                <div className="grid grid-cols-2 gap-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {[
                                        { name: "Fashion", icon: Shirt },
                                        { name: "Tech", icon: Laptop },
                                        { name: "Fitness", icon: Dumbbell },
                                        { name: "Finance", icon: TrendingUp },
                                        { name: "Travel", icon: Globe },
                                        { name: "Food", icon: Utensils },
                                        { name: "Gaming", icon: Gamepad2 },
                                        { name: "Lifestyle", icon: Heart },
                                        { name: "Education", icon: GraduationCap },
                                        { name: "Other", icon: Sparkles },
                                    ].map((item) => (
                                        <motion.button
                                            key={item.name}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                updateData("niche", item.name)
                                                handleNext()
                                            }}
                                            className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left
                                ${formData.niche === item.name
                                                    ? "bg-white text-purple-600 border-white shadow-lg"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${formData.niche === item.name ? "bg-purple-100" : "bg-white/10"}`}>
                                                <item.icon size={20} />
                                            </div>
                                            <span className="font-semibold">{item.name}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Followers */}
                        {currentStep === 5 && (
                            <motion.div
                                key="step5"
                                className="w-full max-w-md space-y-8"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <h2 className="text-3xl font-bold text-center">How many followers?</h2>

                                <div className="space-y-4">
                                    {["1K - 10K", "10K - 50K", "50K - 100K", "100K - 500K", "500K+"].map((range) => (
                                        <motion.button
                                            key={range}
                                            whileHover={{ scale: 1.01, x: 5 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => {
                                                updateData("followers", range)
                                                handleNext()
                                            }}
                                            className={`w-full p-5 rounded-xl border flex justify-between items-center transition-all
                                ${formData.followers === range
                                                    ? "bg-white text-purple-600 border-white shadow-lg"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                                }`}
                                        >
                                            <span className="font-bold text-lg">{range}</span>
                                            {formData.followers === range && <Check />}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 6: Engagement Rate */}
                        {currentStep === 6 && (
                            <motion.div
                                key="step6"
                                className="w-full max-w-md space-y-8"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <h2 className="text-3xl font-bold text-center">Average Engagement?</h2>
                                <p className="text-center text-white/70 -mt-6">Optional, but helps you stand out.</p>

                                <div className="relative">
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 font-bold text-xl">%</span>
                                    <input
                                        type="number"
                                        value={formData.engagement}
                                        onChange={(e) => updateData("engagement", e.target.value)}
                                        placeholder="e.g. 4.5"
                                        className="w-full px-6 py-6 bg-white/10 border-2 border-white/20 rounded-2xl text-4xl text-center font-bold placeholder-white/20 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleNext}
                                        disabled={!formData.engagement}
                                        className="w-full py-5 bg-white text-purple-600 font-bold rounded-2xl hover:bg-gray-100 disabled:opacity-50 transition-all shadow-lg"
                                    >
                                        Continue
                                    </motion.button>
                                    <button
                                        onClick={handleNext}
                                        className="text-white/60 hover:text-white font-medium py-2 transition-colors"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 7: Rates */}
                        {currentStep === 7 && (
                            <motion.div
                                key="step7"
                                className="w-full max-w-md space-y-8"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <h2 className="text-3xl font-bold text-center">Starting Rates?</h2>

                                <div className="relative">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60 w-8 h-8" />
                                    <input
                                        type="number"
                                        value={formData.rates}
                                        onChange={(e) => updateData("rates", e.target.value)}
                                        placeholder="100"
                                        className="w-full pl-20 pr-6 py-6 bg-white/10 border-2 border-white/20 rounded-2xl text-4xl font-bold placeholder-white/20 focus:bg-white/20 focus:border-white/50 focus:outline-none transition-all shadow-inner text-white"
                                        autoFocus
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 font-medium">per post</span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    disabled={!formData.rates}
                                    className="w-full py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/30 disabled:opacity-50 transition-all"
                                >
                                    Complete Setup
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Step 8: Success */}
                        {currentStep === 8 && (
                            <motion.div
                                key="step8"
                                className="flex flex-col items-center text-center space-y-8"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mb-4 relative">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                    >
                                        <Check className="w-14 h-14 text-white" />
                                    </motion.div>
                                    <motion.div
                                        className="absolute inset-0 border-4 border-white/30 rounded-full"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.2, opacity: 0 }}
                                        transition={{ delay: 0.4, duration: 1.5, repeat: Infinity }}
                                    />
                                </div>

                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-4">Profile Setup Complete!</h1>
                                    <p className="text-xl text-white/80 max-w-sm mx-auto">
                                        Your potential is limitless. Brands can now discover your unique talent.
                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push("/creator/dashboard")}
                                    className="px-12 py-5 bg-white text-purple-600 text-xl font-bold rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
                                >
                                    Go to Dashboard
                                </motion.button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* Footer/Trust Indicators */}
            <div className="absolute bottom-6 left-0 w-full text-center text-white/40 text-sm">
                <p>Trusted by 10,000+ creators worldwide</p>
            </div>

        </div>
    )
}
