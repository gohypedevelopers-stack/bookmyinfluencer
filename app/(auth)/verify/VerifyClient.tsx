"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const RESEND_DURATION = 30
const LAST_SENT_KEY = "bmi-otp-last-sent"

type Step = "email" | "otp"

function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])
  const digits = value.split("").slice(0, 6)
  while (digits.length < 6) digits.push("")

  return (
    <div className="flex items-center justify-center gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\\d*"
          maxLength={1}
          className="h-12 w-10 rounded-md border bg-background text-center text-lg font-semibold shadow-xs outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
          onChange={(e) => {
            const nextChar = e.target.value.replace(/\D/g, "").slice(-1)
            const next = digits.slice()
            next[i] = nextChar
            const nextValue = next.join("").replace(/\s/g, "")
            onChange(nextValue)
            if (nextChar && i < 5) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) {
              refs.current[i - 1]?.focus()
            }
          }}
        />
      ))}
    </div>
  )
}

export function VerifyClient() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("email")
  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [resendIn, setResendIn] = React.useState(0)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [providerInfo, setProviderInfo] = React.useState<string | null>(null)

  React.useEffect(() => {
    const saved = window.sessionStorage.getItem("otp_email")
    if (saved) {
      setEmail(saved)
      setStep("otp")
    }
  }, [])

  React.useEffect(() => {
    if (step !== "otp") return
    window.sessionStorage.setItem("otp_email", email)
  }, [email, step])

  React.useEffect(() => {
    const stored = window.localStorage.getItem(LAST_SENT_KEY)
    if (!stored) return
    const timestamp = Number(stored)
    if (Number.isNaN(timestamp)) {
      window.localStorage.removeItem(LAST_SENT_KEY)
      return
    }
    const elapsed = Math.floor((Date.now() - timestamp) / 1000)
    if (elapsed >= RESEND_DURATION) {
      window.localStorage.removeItem(LAST_SENT_KEY)
      return
    }
    setResendIn(RESEND_DURATION - elapsed)
  }, [])

  React.useEffect(() => {
    if (resendIn <= 0) {
      window.localStorage.removeItem(LAST_SENT_KEY)
      return
    }

    const timer = window.setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.localStorage.removeItem(LAST_SENT_KEY)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendIn])

  async function requestOtp() {
    setLoading(true)
    setMessage(null)
    setError(null)
    setPreviewUrl(null)
    setProviderInfo(null)

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as {
        ok: boolean
        resendIn?: number
        error?: string
        message?: string
        previewUrl?: string
        provider?: string
        infoMessage?: string
      }

      // Handle Rate Limit specifically
      if (!data.ok && data.error === "RATE_LIMITED") {
        const duration = data.resendIn ?? RESEND_DURATION
        setResendIn(duration)
        // If they are not already on 'otp' step, move them safely if they have email
        if (step === "email" && email) {
          setStep("otp")
        }
        // Show rate limit info, not success
        setMessage(`Time limit active. Please wait ${duration}s before resending.`)
        return
      }

      if (!res.ok || !data.ok) {
        setError(data.message ?? "Could not send OTP. Please try again.")
        return
      }

      const duration = data.resendIn ?? RESEND_DURATION
      const timestamp = Date.now()
      window.localStorage.setItem(LAST_SENT_KEY, timestamp.toString())
      setResendIn(duration)
      setStep("otp")
      setMessage(data.message ?? `Code sent successfully to ${email}.`)
      setPreviewUrl(data.previewUrl ?? null)
      setProviderInfo(data.infoMessage ?? (data.provider ? `Email provider: ${data.provider}` : null))
    } catch (err: any) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        if (data.error === "expired") setError("Code expired. Please resend a new code.")
        else if (data.error === "locked") setError("Too many attempts. Request a new code later.")
        else setError("Invalid code. Please try again.")
        return
      }

      window.sessionStorage.removeItem("otp_email")
      router.push("/creator/onboarding")
    } catch (err) {
      setError("Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-white">
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              {step === "email"
                ? "Enter your email to receive a 6-digit verification code."
                : `We sent a 6-digit code to ${email}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "email" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Button
                  className="w-full"
                  onClick={requestOtp}
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />
                <Button
                  className="w-full"
                  onClick={verifyOtp}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline disabled:opacity-50"
                    onClick={() => {
                      setStep("email")
                      setOtp("")
                      setMessage(null)
                      window.sessionStorage.removeItem("otp_email")
                    }}
                    disabled={loading}
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    onClick={requestOtp}
                    disabled={loading || resendIn > 0}
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend"}
                  </button>
                </div>
              </div>
            )}

            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {providerInfo ? (
              <p className="text-xs text-slate-500">{providerInfo}</p>
            ) : null}
            {previewUrl ? (
              <p className="text-xs text-blue-600">
                Email preview available (dev preview)
                <a className="underline ml-1" target="_blank" rel="noreferrer" href={previewUrl}>
                  Open preview
                </a>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
