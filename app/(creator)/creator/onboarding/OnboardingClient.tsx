"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function OnboardingClient() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [fetchPublic, setFetchPublic] = React.useState(false)

  const [formData, setFormData] = React.useState({
    fullName: "",
    phone: "",
    niche: "",
    instagram: "",
    youtube: "",
    portfolioUrl: "",
    country: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/creator/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...formData, fetchPublic }),
        credentials: "include",
      })
      const data = (await res.json()) as { ok: boolean; error?: string }

      if (!res.ok || !data.ok) {
        if (data.error === "unauthorized") {
          router.replace("/verify")
          return
        }
        setMessage("Could not save your details. Please check the form and try again.")
        return
      }

      router.refresh()
      router.replace("/creator/dashboard")
    } catch (err) {
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Logo area */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Bookmyinfluencer</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Turn your passion into a profession.
            </h1>
            <p className="text-xl text-purple-100">
              Complete your profile to start connecting with top brands.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex -space-x-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center"
            />
          ))}
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:bg-transparent">
        <div className="w-full max-w-lg">
          <Card className="border-none shadow-xl lg:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Creator Profile</CardTitle>
              <CardDescription>
                Tell us a bit about yourself so we can match you with the right campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">

                <div className="grid gap-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Jane Doe"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 99999 99999"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="country" className="text-sm font-medium">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="" disabled>Select Country</option>
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="UAE">UAE</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="niche" className="text-sm font-medium">
                    Primary Niche
                  </label>
                  <select
                    id="niche"
                    name="niche"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={formData.niche}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="" disabled>Select Niche</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Tech">Technology</option>
                    <option value="Travel">Travel</option>
                    <option value="Food">Food & Beverage</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="instagram" className="text-sm font-medium">
                      Instagram URL
                    </label>
                    <Input
                      id="instagram"
                      name="instagram"
                      placeholder="https://instagram.com/username"
                      value={formData.instagram}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="youtube" className="text-sm font-medium">
                      YouTube URL
                    </label>
                    <Input
                      id="youtube"
                      name="youtube"
                      placeholder="https://youtube.com/@channel"
                      value={formData.youtube}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="portfolioUrl" className="text-sm font-medium">
                    Account URL (Optional)
                  </label>
                  <Input
                    id="portfolioUrl"
                    name="portfolioUrl"
                    placeholder="https://yourwebsite.com"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="fetchPublic"
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      checked={fetchPublic}
                      onChange={(e) => setFetchPublic(e.target.checked)}
                      disabled={loading}
                    />
                    <label htmlFor="fetchPublic" className="text-sm text-slate-600">
                      Use these public links for limited metrics (No login required)
                    </label>
                  </div>
                </div>

                {message && <p className="text-sm text-red-500">{message}</p>}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-6 mt-4 transition-all hover:shadow-lg hover:shadow-purple-500/25"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                </Button>


              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

