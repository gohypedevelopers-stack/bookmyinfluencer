import { NextRequest, NextResponse } from "next/server"

import { db } from "@/lib/db"
import { env } from "@/lib/env"
import { getDevOtpInfo } from "@/lib/dev-otp"

export async function GET(req: NextRequest) {
  if (env.isProduction) {
    return NextResponse.json({ ok: false, error: "not_allowed" }, { status: 403 })
  }

  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 })
  }

  const user = await db.otpUser.findUnique({ where: { email }, select: { id: true } })
  if (!user) {
    return NextResponse.json({ ok: true, exists: false })
  }

  const otpRow = await db.emailOtp.findUnique({
    where: { userId: user.id },
    select: { expiresAt: true, lastSentAt: true },
  })

  const devInfo = getDevOtpInfo(email)

  return NextResponse.json({
    ok: true,
    exists: !!otpRow,
    expiresAt: otpRow?.expiresAt?.toISOString(),
    lastSentAt: otpRow?.lastSentAt?.toISOString(),
    previewUrl: devInfo?.previewUrl,
  })
}
