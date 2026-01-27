import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
    displayName: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    profileImageUrl: z.string().url().max(500).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const userId = await getVerifiedUserIdFromCookies();
        if (!userId) {
            return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const parsed = updateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ ok: false, error: "INVALID_INPUT", detail: parsed.error.issues }, { status: 400 });
        }

        const { displayName, bio, profileImageUrl } = parsed.data;

        await db.creator.update({
            where: { userId },
            data: {
                ...(displayName !== undefined && { displayName: displayName || null }),
                ...(bio !== undefined && { bio: bio || null }),
                ...(profileImageUrl !== undefined && { profileImageUrl: profileImageUrl || null }),
            }
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: "INTERNAL_ERROR", detail: e.message }, { status: 500 });
    }
}
