"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Lock, ShieldCheck, Smartphone, Eye, EyeOff } from "lucide-react"

export default function BrandLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setError("Account created! Please sign in.") // Using error state for success msg temporarily or add new state
        }
    }, [searchParams])

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // Using standard NextAuth credentials login
            // Note: detailed error handling omitted for brevity
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false
            })

            if (res?.error) {
                setError("Invalid credentials. Try 'BrandPassword123!' if you just registered.")
                setIsLoading(false)
            } else {
                router.push("/brand")
            }
        } catch (err) {
            setError("Something went wrong.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Panel - Value Props */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 text-white flex-col justify-center p-16 overflow-hidden">
                {/* Background Image / Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2874&auto=format&fit=crop"
                        alt="Background"
                        fill
                        className="object-cover opacity-20 mix-blend-overlay"
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-blue-900/90 mix-blend-multiply" />
                </div>

                <div className="relative z-10 max-w-xl">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            I
                        </div>
                        <span className="text-xl font-bold">InfluencerCRM</span>
                    </div>

                    <h1 className="text-5xl font-extrabold leading-tight mb-8">
                        Scale your brand with data-driven creator partnerships.
                    </h1>

                    <p className="text-blue-100 text-lg mb-12 leading-relaxed opacity-90">
                        The ultimate platform for brands to manage, track, and optimize influencer campaigns at scale. Join 500+ top-tier brands today.
                    </p>

                    <div className="space-y-6">
                        {[
                            "Real-time Campaign Analytics",
                            "Automated Escrow Payments",
                            "AI-Powered Influencer Discovery"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-lg">{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-sm text-white/40">
                        © 2024 InfluencerCRM. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In to Dashboard</h1>
                        <p className="text-gray-600">
                            Welcome back. Enter your credentials to access your account.
                        </p>
                        {searchParams.get('registered') && (
                            <p className="text-green-600 font-medium mt-2">
                                Account created successfully! Please sign in.
                            </p>
                        )}
                    </div>

                    <form className="space-y-8" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <Label htmlFor="email">BUSINESS EMAIL</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    className="h-12 bg-gray-50 border-gray-200"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">PASSWORD</Label>
                                <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">Forgot password?</span>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-12 bg-gray-50 border-gray-200 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button disabled={isLoading} className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-200 mt-4">
                            {isLoading ? "Signing in..." : "Sign In to Dashboard →"}
                        </Button>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-gray-600 text-sm">
                            Don't have a brand account?{" "}
                            <Link href="/brand/register" className="font-bold text-blue-600 hover:underline">
                                Create Brand Account
                            </Link>
                        </p>
                    </div>

                    <div className="flex gap-4 pt-8">
                        <div className="flex-1 p-4 border border-gray-100 rounded-lg flex items-center gap-3 bg-gray-50/50">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Lock className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-gray-400">SSL SECURE</div>
                                <div className="text-xs font-bold text-gray-900">256-bit AES</div>
                            </div>
                        </div>
                        <div className="flex-1 p-4 border border-gray-100 rounded-lg flex items-center gap-3 bg-gray-50/50">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-gray-400">ENCRYPTED</div>
                                <div className="text-xs font-bold text-gray-900">Data Protected</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-6 text-xs text-gray-400 pt-4">
                        <Link href="#" className="hover:text-gray-600">Privacy Policy</Link>
                        <Link href="#" className="hover:text-gray-600">Terms of Service</Link>
                        <Link href="#" className="hover:text-gray-600">Help Center</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
