import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { hashOtp, generateOtp } from "@/lib/otp"
import { sendOtpEmail } from "@/lib/mailer"

const bodySchema = z.object({
  email: z.string().email(),
})

const OTP_EXPIRES_MINUTES = 10
const RESEND_LIMIT_SECONDS = 30

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 })
    }

    const email = parsed.data.email.trim().toLowerCase()
    const now = new Date()

    // 1. Get or Create User
    const user = await db.otpUser.upsert({
      where: { email },
      update: {},
      create: { email },
      select: { id: true },
    })

    // 2. Check Rate Limit
    const existing = await db.emailOtp.findUnique({
      where: { userId: user.id },
      select: { lastSentAt: true },
    })

    if (existing?.lastSentAt) {
      const secondsSince = Math.floor((now.getTime() - existing.lastSentAt.getTime()) / 1000)
      const resendIn = Math.max(0, RESEND_LIMIT_SECONDS - secondsSince)

      if (resendIn > 0) {
        console.info("[OTP] rate limited", {
          userId: user.id,
          email,
          resendIn,
        })
        // MUST return ok: false so frontend knows not to show "sent successfully"
        return NextResponse.json({ ok: false, error: "RATE_LIMITED", resendIn })
      }
    }

    // 3. Generate OTP and Hash
    const otp = generateOtp()
    const expiresAt = new Date(now.getTime() + OTP_EXPIRES_MINUTES * 60 * 1000)
    const otpHash = hashOtp(email, otp)

    // 4. Store in DB FIRST
    await db.emailOtp.upsert({
      where: { userId: user.id },
      update: {
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
      },
      create: {
        userId: user.id,
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
      },
    })

    // 5. Send Email via Gmail
    console.info("[OTP] sending email", { email })
    try {
      const sendResult = await sendOtpEmail({
        to: email,
        otp,
        expiresInMinutes: OTP_EXPIRES_MINUTES,
      })

      console.info("[OTP] send success", {
        userId: user.id,
        email,
        messageId: sendResult.messageId,
      })

      return NextResponse.json({
        ok: true,
        resendIn: RESEND_LIMIT_SECONDS,
        provider: "gmail",
        message: "Code sent successfully",
      })
    } catch (emailError: any) {
      console.error("[OTP] send failed (caught)", {
        userId: user.id,
        email,
        error: emailError.message,
        stack: emailError.stack,
      })
      // Return 500 so client knows it failed
      return NextResponse.json(
        { ok: false, error: "SMTP_FAILED", message: "Email delivery failed" },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("[OTP] unexpected error", error)
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR", message: "Something went wrong" },
      { status: 500 }
    )
  }
}
