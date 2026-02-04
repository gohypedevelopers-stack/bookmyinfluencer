"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ShieldCheck, Building2, Box } from "lucide-react"
import { registerBrand } from "@/app/brand/auth-actions"

export default function BrandRegisterPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const res = await registerBrand(formData)

        if (res.success) {
            // Redirect to login or auto-login
            router.push('/brand/login?registered=true')
        } else {
            setError(res.error || "Something went wrong.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Panel - Testimonial & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 text-white flex-col justify-between p-12 overflow-hidden">
                {/* Background Image / Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2938&auto=format&fit=crop"
                        alt="Background"
                        fill
                        className="object-cover opacity-40 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-gray-900/80" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                            I
                        </div>
                        <span className="text-xl font-bold">InfluencerCRM</span>
                    </div>

                    <div className="max-w-xl">
                        <div className="flex gap-1 mb-6 text-yellow-500">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="w-5 h-5 fill-current" />
                            ))}
                        </div>
                        <blockquote className="text-3xl font-medium leading-tight mb-8">
                            "Switching to InfluencerCRM was the single best decision for our digital strategy. Our campaign ROI increased by 240% in just three months."
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden relative border-2 border-white/20">
                                <Image
                                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop"
                                    alt="User"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <div className="font-bold">Director of Global Marketing</div>
                                <div className="text-gray-400 text-sm">Fortune 500 Enterprise Partner</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="relative z-10 flex gap-12 pt-12 border-t border-white/10 mt-auto">
                    <div>
                        <div className="text-2xl font-bold mb-1">50k+</div>
                        <div className="text-sm text-gray-400">Vetted Creators</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold mb-1">12M+</div>
                        <div className="text-sm text-gray-400">Content Reach</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold mb-1">99.9%</div>
                        <div className="text-sm text-gray-400">Fraud Protection</div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Register your brand</h1>
                        <p className="text-gray-600">
                            Join thousands of leading brands and start scaling your influencer marketing efforts today.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" name="companyName" required placeholder="e.g. Acme Corp" className="h-12 bg-gray-50 border-gray-200" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Business Email</Label>
                                <Input id="email" name="email" required type="email" placeholder="name@company.com" className="h-12 bg-gray-50 border-gray-200" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website URL</Label>
                                <Input id="website" name="website" placeholder="https://www.yourbrand.com" className="h-12 bg-gray-50 border-gray-200" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry Type</Label>
                                <Select name="industry">
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 text-gray-500">
                                        <SelectValue placeholder="Select your industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tech">Technology</SelectItem>
                                        <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                                        <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                                        <SelectItem value="health">Health & Wellness</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button disabled={isLoading} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-lg">
                            {isLoading ? "Creating Account..." : "Create Account →"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-100" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-400 font-bold tracking-wider">Enterprise Ready</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Secure 256-bit SSL encrypted registration
                            </div>
                        </div>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link href="/brand/login" className="font-bold text-gray-900 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>

                    <div className="flex justify-center gap-6 pt-6 opacity-40 grayscale">
                        <Building2 className="w-6 h-6" />
                        <Box className="w-6 h-6" />
                        {/* Placeholder for brand logos */}
                        <div className="text-xs font-bold border border-gray-400 rounded px-1 flex items-center">LOGO</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
