import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export async function GET() {
    // 1. Try OTP session (Creator app)
    const cookieStore = await cookies();
    const otpSession = cookieStore.get("session")?.value;

    if (otpSession) {
        try {
            const payload = verifySession(otpSession);
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
                    if (user) {
                        return NextResponse.json({ userId: user.id });
                    }
                }
            }
        } catch {
            // fall through
        }
    }

    // 2. Try NextAuth session (Brand)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        return NextResponse.json({ userId: session.user.id });
    }

    return NextResponse.json({ userId: null }, { status: 401 });
}
