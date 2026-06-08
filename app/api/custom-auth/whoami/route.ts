import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    const allCookies = cookieStore.getAll().map(c => c.name);

    if (!token) {
        return NextResponse.json({
            ok: false,
            error: "UNAUTHORIZED",
            cookiePresent: false,
            receivedCookies: allCookies
        }, { status: 401 });
    }

    const session = verifySession(token);

    if (!session) {
        return NextResponse.json({
            ok: false,
            error: "INVALID_SESSION",
            cookiePresent: true,
            receivedCookies: allCookies
        }, { status: 401 });
    }

    return NextResponse.json({
        ok: true,
        userId: session.userId,
        cookiePresent: true,
        receivedCookies: allCookies
    });
}
