import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Edge-safe JWT Verification (HS256)
async function verifyOtpSession(token: string) {
    try {
        const [headerB64, payloadB64, signatureB64] = token.split('.')
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

        // Base64Url decode signature
        const signatureBin = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))

        const isValid = await crypto.subtle.verify(
            "HMAC",
            key,
            signatureBin,
            data
        )

        if (!isValid) return null

        const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(payloadJson)
    } catch (e) {
        return null
    }
}

export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token
        const otpSessionCookie = req.cookies.get("session")?.value
        let otpUser = null

        // Verify OTP session if present
        if (!token && otpSessionCookie) {
            otpUser = await verifyOtpSession(otpSessionCookie)
            // Enforce expiry check
            if (otpUser && otpUser.exp && Date.now() / 1000 > otpUser.exp) {
                otpUser = null;
            }
        }

        const path = req.nextUrl.pathname

        // Public Brand Routes - Allow access without auth
        if (path === "/brand/login" || path === "/brand/register") {
            return NextResponse.next()
        }

        // 1. Auth Check: Allow if EITHER standard token OR verified otpUser exists
        if (!token && !otpUser) {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        // Helper to determine role
        const userRole = token?.role || (otpUser ? "INFLUENCER" : null);

        // 2. Role-based protection

        // Brand Routes
        // Brand Routes
        // Brand Routes
        // Relaxing middleware role check to rely on Layout protection for now
        // if (path.startsWith("/brand") && !path.startsWith("/brand/login") && !path.startsWith("/brand/register") && userRole !== "BRAND" && userRole !== "ADMIN") {
        //     return NextResponse.redirect(new URL("/", req.url))
        // }

        // Influencer Routes
        if (path.startsWith("/influencer")) {
            if (userRole !== "INFLUENCER" && userRole !== "ADMIN") {
                return NextResponse.redirect(new URL("/", req.url))
            }

            // KYC Check logic...
            if (token && userRole === 'INFLUENCER' && !path.startsWith("/influencer/kyc") && token.kycStatus !== 'APPROVED') {
                return NextResponse.redirect(new URL("/influencer/kyc", req.url))
            }
        }

        // Admin Routes
        if (path.startsWith("/admin") && userRole !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // We perform the real check inside the middleware function, but this lets the request pass through to be handled
                return true
            }
        },
    }
)

export const config = {
    matcher: [
        "/brand/:path*",
        "/influencer/:path*",
        "/admin/:path*"
    ]
}
