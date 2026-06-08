"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    getBrandProfile, 
    updateBrandProfile 
} from "@/app/brand/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    Building2, 
    Globe, 
    MapPin, 
    Briefcase, 
    Target, 
    Laptop, 
    Users, 
    Coins,
    Edit3,
    Check,
    Loader2,
    Eye,
    Settings,
    FileText,
    ArrowUpRight,
    TrendingUp,
    BookmarkCheck
} from "lucide-react"
import { toast } from "sonner"

export default function BrandProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<"view" | "edit" | "preferences">("view")
    const [brandData, setBrandData] = useState<any>(null)
    
    // Form States
    const [formFields, setFormFields] = useState({
        companyName: "",
        website: "",
        industry: "",
        description: "",
        location: "",
        niche: "",
        campaignType: "Influencer Marketing",
        campaignBudget: "",
        targetPlatforms: "Instagram, YouTube",
        preferredCreatorType: "Micro-Influencers",
        campaignGoals: "Brand Awareness",
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const res = await getBrandProfile()
            if (res.success && res.data) {
                setBrandData(res.data)
                setFormFields({
                    companyName: res.data.companyName || "",
                    website: res.data.website || "",
                    industry: res.data.industry || "",
                    description: res.data.description || "",
                    location: res.data.location || "",
                    niche: res.data.niche || "",
                    campaignType: res.data.campaignType || "Influencer Marketing",
                    campaignBudget: res.data.campaignBudget || "",
                    targetPlatforms: res.data.targetPlatforms || "Instagram, YouTube",
                    preferredCreatorType: res.data.preferredCreatorType || "Micro-Influencers",
                    campaignGoals: res.data.campaignGoals || "Brand Awareness",
                })
            } else {
                toast.error(res.error || "Failed to load profile data")
            }
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred while fetching profile")
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormFields(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await updateBrandProfile(formFields)
            if (res.success) {
                toast.success("Profile updated successfully!")
                await fetchProfile()
                setActiveTab("view")
            } else {
                toast.error(res.error || "Failed to update profile")
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to save changes")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center flex-col gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Retrieving your Brand profile...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative overflow-hidden font-sans pb-16" style={{ background: "radial-gradient(circle at top right, #f8fafc 0%, #f1f5f9 100%)" }}>
            
            {/* Background floating decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-indigo-500/5 to-transparent blur-[100px]" />
                <div className="absolute top-[30%] -right-[15%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-purple-500/5 to-transparent blur-[120px]" />
            </div>

            <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-8 relative z-10">
                
                {/* Visual Header Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 md:p-12 text-white shadow-xl shadow-indigo-100/50 mb-8"
                >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.8%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5 mix-blend-overlay pointer-events-none" />
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            {/* Logo Icon with initials */}
                            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-4xl font-black shadow-lg text-white shrink-0">
                                {brandData?.companyName ? brandData.companyName.charAt(0).toUpperCase() : "B"}
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">{brandData?.companyName}</h1>
                                    <span className="bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/10">
                                        Verified Brand
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-blue-100/90 font-medium">
                                    {brandData?.industry && (
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase className="w-4 h-4 text-blue-200" />
                                            <span>{brandData.industry}</span>
                                        </div>
                                    )}
                                    {brandData?.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-blue-200" />
                                            <span>{brandData.location}</span>
                                        </div>
                                    )}
                                    {brandData?.website && (
                                        <a href={brandData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors hover:underline">
                                            <Globe className="w-4 h-4 text-blue-200" />
                                            <span>{brandData.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                            <ArrowUpRight className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation / Actions Tabs */}
                        <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 self-center md:self-end">
                            <button 
                                onClick={() => setActiveTab("view")} 
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === "view" ? "bg-white text-indigo-700 shadow-md" : "text-white hover:bg-white/10"}`}
                            >
                                <Eye className="w-3.5 h-3.5" />
                                Preview
                            </button>
                            <button 
                                onClick={() => setActiveTab("edit")} 
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === "edit" ? "bg-white text-indigo-700 shadow-md" : "text-white hover:bg-white/10"}`}
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit Bio
                            </button>
                            <button 
                                onClick={() => setActiveTab("preferences")} 
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === "preferences" ? "bg-white text-indigo-700 shadow-md" : "text-white hover:bg-white/10"}`}
                            >
                                <Settings className="w-3.5 h-3.5" />
                                Preferences
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === "view" && (
                        <motion.div 
                            key="view"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left Panel: Stats & Details Card */}
                            <div className="space-y-8 lg:col-span-1">
                                <Card className="border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden">
                                    <CardHeader className="border-b border-slate-100 pb-5">
                                        <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                                            <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                                            Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-6">
                                        {/* Wallet balance */}
                                        <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                                    <Coins className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Wallet Balance</p>
                                                    <p className="font-black text-lg text-slate-800">₹{brandData?.walletBalance?.toLocaleString() || "0"}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100/30" onClick={() => window.location.href='/brand/wallet'}>
                                                Manage
                                            </Button>
                                        </div>

                                        {/* Direct Details list */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400 font-semibold">Location</span>
                                                <span className="text-slate-700 font-bold">{brandData?.location || "Not specified"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400 font-semibold">Niche/Category</span>
                                                <span className="text-slate-700 font-bold">{brandData?.niche || "Not specified"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400 font-semibold">Industry</span>
                                                <span className="text-slate-700 font-bold">{brandData?.industry || "Not specified"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400 font-semibold">Website</span>
                                                <span className="text-slate-700 font-bold max-w-[180px] truncate">
                                                    {brandData?.website ? (
                                                        <a href={brandData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 justify-end">
                                                            {brandData.website.replace(/^https?:\/\/(www\.)?/, '')}
                                                        </a>
                                                    ) : "Not specified"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Panel: Detailed Bio & Campaign settings */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-lg rounded-[2rem] p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 mb-3">About the Brand</h2>
                                            <p className="text-slate-500 font-medium text-[15px] leading-relaxed whitespace-pre-wrap">
                                                {brandData?.description || "No description provided. Click 'Edit Bio' to write a brief summary about your company, products, and brand mission so influencers can get to know you better!"}
                                            </p>
                                        </div>

                                        <hr className="border-slate-100" />

                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                                <Target className="w-5 h-5 text-indigo-600" />
                                                Campaign Specifications
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Platforms</p>
                                                    <p className="font-bold text-slate-700">{brandData?.targetPlatforms || "Not configured"}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Campaign Type</p>
                                                    <p className="font-bold text-slate-700">{brandData?.campaignType || "Not configured"}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Creator Category</p>
                                                    <p className="font-bold text-slate-700">{brandData?.preferredCreatorType || "Not configured"}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Campaign Goals</p>
                                                    <p className="font-bold text-slate-700">{brandData?.campaignGoals || "Not configured"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {brandData?.campaignBudget && (
                                            <>
                                                <hr className="border-slate-100" />
                                                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center gap-4">
                                                    <TrendingUp className="w-8 h-8 text-indigo-600 shrink-0" />
                                                    <div>
                                                        <h4 className="font-black text-slate-800 text-sm">Estimated Campaign Budget</h4>
                                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Average budget allocated for active influencer programs: <span className="font-bold text-slate-700">{brandData.campaignBudget}</span></p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "edit" && (
                        <motion.div 
                            key="edit"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-lg rounded-[2rem]">
                                <CardHeader className="border-b border-slate-100 pb-5">
                                    <CardTitle className="text-xl font-black text-slate-800">Edit Public Profile Details</CardTitle>
                                    <CardDescription>Configure how your brand details look to creators across the platform.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="companyName" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Company / Brand Name</Label>
                                                <Input 
                                                    id="companyName" 
                                                    name="companyName"
                                                    value={formFields.companyName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Nike India" 
                                                    required 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="website" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Website URL</Label>
                                                <Input 
                                                    id="website" 
                                                    name="website"
                                                    value={formFields.website}
                                                    onChange={handleInputChange}
                                                    placeholder="https://example.com" 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="industry" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Industry</Label>
                                                <Input 
                                                    id="industry" 
                                                    name="industry"
                                                    value={formFields.industry}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Fashion, Lifestyle, Tech" 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="location" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Location / Head Office</Label>
                                                <Input 
                                                    id="location" 
                                                    name="location"
                                                    value={formFields.location}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Bangalore, India" 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="niche" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Brand Niche Categories (comma separated)</Label>
                                                <Input 
                                                    id="niche" 
                                                    name="niche"
                                                    value={formFields.niche}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Travel, Fitness, Sports" 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="description" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Brand Description / About Us</Label>
                                                <Textarea 
                                                    id="description" 
                                                    name="description"
                                                    value={formFields.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Write a clear introduction about your brand, what you stand for, and what products/services you highlight..." 
                                                    rows={5}
                                                    className="rounded-2xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-slate-700"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                                            <Button 
                                                type="submit" 
                                                disabled={saving} 
                                                className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-300"
                                            >
                                                {saving ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                                                ) : (
                                                    <><Check className="w-4 h-4 mr-2" /> Save Profile Details</>
                                                )}
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setActiveTab("view")} 
                                                className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === "preferences" && (
                        <motion.div 
                            key="preferences"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-lg rounded-[2rem]">
                                <CardHeader className="border-b border-slate-100 pb-5">
                                    <CardTitle className="text-xl font-black text-slate-800">Campaign Preferences</CardTitle>
                                    <CardDescription>Setup default values for your campaigns, creator matches, and target categories.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="targetPlatforms" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Target Platforms</Label>
                                                <Input 
                                                    id="targetPlatforms" 
                                                    name="targetPlatforms"
                                                    value={formFields.targetPlatforms}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Instagram, YouTube, TikTok" 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="campaignType" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Default Campaign Type</Label>
                                                <Input 
                                                    id="campaignType" 
                                                    name="campaignType"
                                                    value={formFields.campaignType}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Sponsored Posts, Product Reviews" 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="preferredCreatorType" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Preferred Creator Tier</Label>
                                                <Input 
                                                    id="preferredCreatorType" 
                                                    name="preferredCreatorType"
                                                    value={formFields.preferredCreatorType}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Micro (10k-50k), Macro (100k+)" 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="campaignBudget" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Average Campaign Budget Range</Label>
                                                <Input 
                                                    id="campaignBudget" 
                                                    name="campaignBudget"
                                                    value={formFields.campaignBudget}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. ₹50,000 - ₹2,00,000" 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="campaignGoals" className="font-bold text-slate-600 text-xs uppercase tracking-wider">Core Campaign Goals</Label>
                                                <Input 
                                                    id="campaignGoals" 
                                                    name="campaignGoals"
                                                    value={formFields.campaignGoals}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Brand Awareness, Conversion, Social Growth" 
                                                    className="h-11 rounded-xl border-slate-200 bg-white/80 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                                            <Button 
                                                type="submit" 
                                                disabled={saving} 
                                                className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-300"
                                            >
                                                {saving ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                                                ) : (
                                                    <><Check className="w-4 h-4 mr-2" /> Save Preferences</>
                                                )}
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setActiveTab("view")} 
                                                className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
