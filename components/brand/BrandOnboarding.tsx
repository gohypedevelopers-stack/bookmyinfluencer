"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, ChevronLeft, Building2, Megaphone, Users, Target, DollarSign, Smartphone, Instagram, Youtube, Facebook, Twitter, Linkedin } from "lucide-react"
import { useRouter } from "next/navigation"
import { submitBrandOnboarding } from "@/app/actions/onboarding";
import { useSession } from "next-auth/react";

// Types
type OnboardingData = {
    brandName: string
    campaignType: string
    budget: string
    platforms: string[]
    creatorType: string
    campaignGoals: string
}

const steps = [
    { id: 1, title: "Welcome" },
    { id: 2, title: "Brand Name" },
    { id: 3, title: "Campaign Type" },
    { id: 4, title: "Budget" },
    { id: 5, title: "Platforms" },
    { id: 6, title: "Creator Type" },
    { id: 7, title: "Goals" },
    { id: 8, title: "Success" }
]

export default function BrandOnboarding() {
    const router = useRouter()
    const { update } = useSession()

    // ... inside component
    const [currentStep, setCurrentStep] = useState(1)
    const [direction, setDirection] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<OnboardingData>({
        brandName: "",
        campaignType: "",
        budget: "",
        platforms: [],
        creatorType: "",
        campaignGoals: ""
    })

    const handleNext = async () => {
        if (currentStep === 7) {
            // Submitting data before showing success step
            setIsSubmitting(true);
            const result = await submitBrandOnboarding(formData);
            setIsSubmitting(false);

            if (result.error) {
                // Handle error (alert for now)
                alert(result.error);
                return;
            }

            // Success! Update session to reflect onboarding completed
            await update({ onboardingComplete: true });

            setIsSubmitting(false);

            // Proceed to success step
            setDirection(1)
            setCurrentStep((prev) => prev + 1)
        } else if (currentStep < steps.length) {
            setDirection(1)
            setCurrentStep((prev) => prev + 1)
        } else {
            setCurrentStep((prev) => prev - 1)
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

    const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-2 bg-gray-200 z-50">
                <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden min-h-[600px] flex flex-col">
                {/* Back Button */}
                {currentStep > 1 && currentStep < 8 && (
                    <button
                        onClick={handleBack}
                        className="absolute top-8 left-8 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}

                {/* Step Indicator */}
                {currentStep < 8 && (
                    <div className="absolute top-8 right-8 text-sm font-semibold text-gray-400">
                        Step {currentStep} of {steps.length - 1}
                    </div>
                )}

                <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
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
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Target className="w-10 h-10 text-blue-600" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome to <br /><span className="text-blue-600">Book My Influencers</span></h1>
                                <p className="text-lg text-gray-600 max-w-md">Let's find the perfect creators for your brand in just a few steps.</p>
                                <button
                                    onClick={handleNext}
                                    className="mt-8 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    Get Started <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}

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
                                        { label: "Event Promotion", icon: Building2 }, // Reusing Building2 for Event
                                        { label: "Affiliate Marketing", icon: DollarSign },
                                        { label: "Other", icon: Users },
                                    ].map((option) => (
                                        <button
                                            key={option.label}
                                            onClick={() => {
                                                updateData("campaignType", option.label)
                                                handleNext()
                                            }}
                                            className={`p-6 border-2 rounded-2xl flex items-center gap-4 transition-all text-left group
                      ${formData.campaignType === option.label
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl ${formData.campaignType === option.label ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"} transition-colors`}>
                                                <option.icon size={24} />
                                            </div>
                                            <span className="font-semibold text-lg text-gray-800">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-bold text-gray-900">Estimated budget?</h2>
                                <div className="space-y-4">
                                    {[
                                        "Under ₹10,000",
                                        "₹10,000 – ₹50,000",
                                        "₹50,000 – ₹2,00,000",
                                        "₹2,00,000+"
                                    ].map((option) => (
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
                                            {formData.budget === option && <Check className="text-blue-600" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative mt-4">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        ₹
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Enter custom amount"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        onChange={(e) => updateData("budget", e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleNext} className="text-blue-600 font-semibold hover:underline">Skip</button>
                                </div>
                            </motion.div>
                        )}

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
                                <h2 className="text-3xl font-bold text-gray-900">Target Platforms?</h2>
                                <p className="text-gray-500">Select all that apply</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: "Instagram", icon: Instagram, color: "text-pink-600" },
                                        { id: "YouTube", icon: Youtube, color: "text-red-600" },
                                        // { id: "TikTok", icon: Music2, color: "text-black" }, // Lucide doesn't have TikTok easily, let's skip icon or use generic
                                        { id: "Twitter (X)", icon: Twitter, color: "text-blue-400" },
                                        { id: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
                                        { id: "Facebook", icon: Facebook, color: "text-blue-600" },
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
                                    {/* Custom TikTok Button since icon might be missing or using generic */}
                                    <button
                                        onClick={() => togglePlatform("TikTok")}
                                        className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all
                    ${formData.platforms.includes("TikTok")
                                                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="w-8 h-8 flex items-center justify-center font-bold text-xl">Tk</span>
                                        <span className="font-semibold text-gray-800">TikTok</span>
                                    </button>

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
                                <h2 className="text-3xl font-bold text-gray-900">Preferred Creators?</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: "Nano", desc: "1K–10K followers", range: "Most Authentic" },
                                        { label: "Micro", desc: "10K–100K followers", range: "High Engagement" },
                                        { label: "Macro", desc: "100K–500K followers", range: "Broad Reach" },
                                        { label: "Celebrity", desc: "500K+ followers", range: "Massive Impact" }
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
                                            <p className="text-gray-500">{option.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

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
                                <h2 className="text-3xl font-bold text-gray-900">Campaign Goals</h2>
                                <p className="text-gray-500">Tell us a bit more about what you want to achieve.</p>
                                <textarea
                                    value={formData.campaignGoals}
                                    onChange={(e) => updateData("campaignGoals", e.target.value)}
                                    placeholder="E.g., We want to increase brand awareness among Gen Z..."
                                    className="w-full h-40 p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none resize-none text-lg"
                                />
                                <button
                                    onClick={handleNext}
                                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all"
                                >
                                    Finish Setup
                                </button>
                            </motion.div>
                        )}

                        {currentStep === 8 && (
                            <motion.div
                                key="step8"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="flex flex-col items-center text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <Check className="w-12 h-12 text-green-600" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900">You're All Set!</h1>
                                <p className="text-lg text-gray-600 max-w-md">We’ve personalized your dashboard. Get ready to meet the best creators.</p>
                                <button
                                    onClick={() => router.push("/brand")}
                                    className="mt-8 px-10 py-4 bg-gray-900 text-white text-lg font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Go to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
