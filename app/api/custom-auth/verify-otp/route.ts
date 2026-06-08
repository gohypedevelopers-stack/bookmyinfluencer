import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { constantTimeEqualHex, hashOtp } from "@/lib/otp"
import { signSession } from "@/lib/session"

const bodySchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
})

const MAX_ATTEMPTS = 5

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const otp = parsed.data.otp

  const user = await db.otpUser.findUnique({
    where: { email },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 })
  }

  // Development Bypass: Allow '123123' to verify instantly
  if (process.env.NODE_ENV !== "production" && otp === "123123") {
    const now = new Date()
    await db.otpUser.update({
      where: { id: user.id },
      data: { verifiedAt: now },
    })

    // Cleanup any pending OTPs
    await db.emailOtp.deleteMany({ where: { userId: user.id } })

    const token = signSession(user.id)
    const res = NextResponse.json({ ok: true })

    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  }

  const record = await db.emailOtp.findUnique({
    where: { userId: user.id },
    select: { otpHash: true, expiresAt: true, attempts: true },
  })

  if (!record) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 })
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ ok: false, error: "locked" }, { status: 400 })
  }

  const now = new Date()
  if (record.expiresAt.getTime() < now.getTime()) {
    return NextResponse.json({ ok: false, error: "expired" }, { status: 400 })
  }

  const incomingHash = hashOtp(email, otp)
  const matches = constantTimeEqualHex(incomingHash, record.otpHash)

  if (!matches) {
    await db.emailOtp.update({
      where: { userId: user.id },
      data: { attempts: { increment: 1 } },
    })
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 })
  }

  await db.otpUser.update({
    where: { id: user.id },
    data: { verifiedAt: now },
  })

  await db.emailOtp.delete({ where: { userId: user.id } })

  const token = signSession(user.id)
  const res = NextResponse.json({ ok: true })

  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
