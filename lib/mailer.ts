import nodemailer from "nodemailer"
import { env } from "@/lib/env"

// Singleton transporter
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
    if (transporter) return transporter

    if (!env.smtpUser || !env.smtpPass) {
        throw new Error("Missing SMTP_USER or SMTP_PASS for Gmail authentication")
    }

    // Gmail App Password strategy
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: env.smtpUser,
            pass: env.smtpPass, // App Password without spaces
        },
        // In dev, allow unauthorized to bypass self-signed cert issues if any
        // Note: Gmail generally has valid certs, but this helps in some local network setups
        tls: {
            rejectUnauthorized: env.isProduction,
        },
        debug: !env.isProduction, // Enable debug logs in dev
        logger: !env.isProduction, // Enable logger in dev
    })

    return transporter
}

export type SendMailResult = {
    provider: string
    messageId?: string
    previewUrl?: string | null
    meta?: any
}

export async function sendOtpEmail({
    to,
    otp,
    expiresInMinutes,
}: {
    to: string
    otp: string
    expiresInMinutes: number
}): Promise<SendMailResult> {
    const t = getTransporter()

    // Gmail requires 'from' to authenticate. 
    // If FROM_EMAIL is set, use it; otherwise default to authentication user.
    // NOTE: Gmail will rewrite the "From" header if it doesn't match the authenticated user or a configured alias.
    const from = env.mailFrom || env.smtpUser

    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>BookMyInfluencer Verification</h2>
      <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>This code will expire in ${expiresInMinutes} minutes.</p>
      <p><small>If you did not request this, please ignore this email.</small></p>
    </div>
  `

    try {
        const info = await t.sendMail({
            from,
            to,
            subject: `Your Verification Code: ${otp}`,
            html,
        })

        console.log("[Mailer] Email sent info:", info.response)

        return {
            provider: "gmail",
            messageId: info.messageId,
            meta: { host: "smtp.gmail.com", response: info.response },
        }
    } catch (error) {
        console.error("[Mailer] Nodemailer send failed:", error)
        throw error
    }
}

export async function verifyEmailProvider() {
    try {
        const t = getTransporter()
        await t.verify()
        return { ok: true, provider: "gmail", detail: "Connection successful" }
    } catch (error: any) {
        console.error("[Mailer] Verify failed:", error)
        return { ok: false, provider: "gmail", error: error.message }
    }
}
