import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export async function POST() {
    let userId: string | null = null;

    // 1. Try OTP session (Creator)
    const cookieStore = await cookies();
    const otpSession = cookieStore.get("session")?.value;

    if (otpSession) {
        try {
            const payload = verifySession(otpSession)
            if (payload?.userId) {
                const otpUser = await db.otpUser.findUnique({
                    where: { id: payload.userId },
                    select: { email: true }
                });
                if (otpUser?.email) {
                    const user = await db.user.findUnique({
                        where: { email: otpUser.email },
                        select: { id: true }
                    });
                    userId = user?.id ?? null;
                }
            }
        } catch {
            // fall through
        }
    }

    // 2. Try NextAuth (Brand)
    if (!userId) {
        const session = await getServerSession(authOptions);
        userId = session?.user?.id ?? null;
    }

    if (!userId) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await db.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Mark all read error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
