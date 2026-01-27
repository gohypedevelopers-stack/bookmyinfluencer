import { env } from "@/lib/env"

type DevOtpEntry = {
  otp: string
  expiresAt: Date
  previewUrl?: string
  createdAt: number
}

const cache = new Map<string, DevOtpEntry>()

export function cacheDevOtp(email: string, otp: string, expiresAt: Date, previewUrl?: string) {
  if (env.isProduction) return

  const normalized = email.trim().toLowerCase()
  cache.set(normalized, { otp, expiresAt, previewUrl, createdAt: Date.now() })
  console.info(
    `[OTP][DEV] ${normalized} -> ${otp} (expires ${expiresAt.toISOString()})`
  )

  setTimeout(() => {
    const entry = cache.get(normalized)
    if (!entry) return
    if (Date.now() - entry.createdAt >= 60_000) {
      cache.delete(normalized)
    }
  }, 60_000)
}

export function getDevOtpInfo(email: string) {
  if (env.isProduction) return null
  const normalized = email.trim().toLowerCase()
  const entry = cache.get(normalized)
  if (!entry) return null
  if (Date.now() - entry.createdAt >= 60_000) {
    cache.delete(normalized)
    return null
  }
  return {
    previewUrl: entry.previewUrl,
    expiresAt: entry.expiresAt,
  }
}
