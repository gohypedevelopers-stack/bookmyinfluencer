import { withAuth } from "next-auth/middleware"
import type { JWT } from "next-auth/jwt"
import { NextResponse } from "next/server"

type OtpSessionPayload = {
  exp?: number
}

type AuthToken = JWT & {
  role?: string
  onboardingComplete?: boolean
  kycStatus?: string
}

// Edge-safe JWT verification (HS256) for OTP session cookie
async function verifyOtpSession(token: string): Promise<OtpSessionPayload | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".")
    if (!headerB64 || !payloadB64 || !signatureB64) return null

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) return null

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )

    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const signatureBin = Uint8Array.from(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    )

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBin, data)
    if (!isValid) return null

    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    const parsed = JSON.parse(payloadJson)
    if (typeof parsed !== "object" || parsed === null) return null

    return parsed as OtpSessionPayload
  } catch {
    return null
  }
}

export default withAuth(
  async function proxy(req) {
    const token = req.nextauth.token as AuthToken | null
    const otpSessionCookie = req.cookies.get("session")?.value
    let otpUser: OtpSessionPayload | null = null

    if (!token && otpSessionCookie) {
      otpUser = await verifyOtpSession(otpSessionCookie)
      if (otpUser?.exp && Date.now() / 1000 > otpUser.exp) {
        otpUser = null
      }
    }

    const path = req.nextUrl.pathname

    if (path === "/brand/login" || path === "/brand/register") {
      return NextResponse.next()
    }

    if (!token && !otpUser) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const userRole = token?.role || (otpUser ? "INFLUENCER" : null)

    const isOnboardingPage = path.startsWith("/brand-onboarding") || path.startsWith("/creator-onboarding")
    const isApiRoute = path.startsWith("/api")
    const isStatic = path.startsWith("/_next") || path.includes(".")

    if (token && !isApiRoute && !isStatic) {
      const onboardingComplete = token.onboardingComplete
      if (!onboardingComplete && !isOnboardingPage) {
        if (userRole === "BRAND") {
          return NextResponse.redirect(new URL("/brand-onboarding", req.url))
        }
        if (userRole === "INFLUENCER") {
          return NextResponse.redirect(new URL("/creator-onboarding", req.url))
        }
      }
    }

    if (path.startsWith("/brand") && !path.startsWith("/brand/login") && !path.startsWith("/brand/register")) {
      if (userRole !== "BRAND" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    if (path.startsWith("/influencer")) {
      if (userRole !== "INFLUENCER" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url))
      }

      if (token && userRole === "INFLUENCER" && !path.startsWith("/influencer/kyc") && token.kycStatus !== "APPROVED") {
        return NextResponse.redirect(new URL("/influencer/kyc", req.url))
      }
    }

    if (path.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    if (path.startsWith("/manager") && userRole !== "MANAGER" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: ["/brand/:path*", "/influencer/:path*", "/admin/:path*", "/manager/:path*"],
}
