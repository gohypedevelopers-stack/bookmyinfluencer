import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        // Role-based protection
        if (path.startsWith("/brand") && token.role !== "BRAND" && token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url)) // or unauthorized page
        }

        if (path.startsWith("/influencer")) {
            if (token.role !== "INFLUENCER" && token.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/", req.url))
            }

            // KYC Check for Influencers (Except for KYC page itself)
            if (!path.startsWith("/influencer/kyc") && token.role === 'INFLUENCER' && token.kycStatus !== 'APPROVED') {
                // Redirect to KYC page if not approved
                return NextResponse.redirect(new URL("/influencer/kyc", req.url))
            }
        }

        if (path.startsWith("/admin") && token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = {
    matcher: [
        "/brand/campaigns/:path*",
        "/brand/chat/:path*",
        "/brand/checkout/:path*",
        "/influencer/:path*",
        "/admin/:path*"
    ]
}
