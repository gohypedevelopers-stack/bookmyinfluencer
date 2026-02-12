import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { db } from "@/lib/db"

export async function getAuthenticatedCreatorId() {
    // 1. Try NextAuth Session FIRST (primary for login-based users)
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.email) {
            const otpUser = await db.otpUser.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            })
            if (otpUser) return otpUser.id
        }
    } catch (e) {
        console.error("NextAuth session check failed", e)
    }

    // 2. Fallback: Try OTP Session Cookie (for users who verified via OTP only)
    try {
        const userId = await getVerifiedUserIdFromCookies()
        if (userId) return userId
    } catch (e) {
        // Ignore error
    }

    return null
}
