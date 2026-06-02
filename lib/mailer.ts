import nodemailer from "nodemailer"
import { env } from "@/lib/env"

// Singleton transporter
let transporter: nodemailer.Transporter | null = null

function getSmtpPassword() {
    return env.smtpPass?.replace(/\s/g, "")
}

function getSmtpPort() {
    const port = Number(env.smtpPort ?? 465)
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error("Invalid SMTP_PORT. Use 465 for Gmail SSL or 587 for STARTTLS.")
    }
    return port
}

function getSafeSmtpConfig() {
    const smtpPass = getSmtpPassword()
    const smtpPort = getSmtpPort()
    const smtpHost = env.smtpHost || "smtp.gmail.com"

    if (!env.smtpUser || !smtpPass) {
        throw new Error("Missing SMTP_USER or SMTP_PASS for Gmail authentication")
    }

    if (/^your-|password$/i.test(smtpPass)) {
        throw new Error("SMTP_PASS is still a placeholder. Use a Gmail App Password.")
    }

    return {
        host: smtpHost,
        port: smtpPort,
        user: env.smtpUser,
        pass: smtpPass,
    }
}

function normalizeMailError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    const code = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: unknown }).code) : ""
    const responseCode =
        typeof error === "object" && error !== null && "responseCode" in error
            ? Number((error as { responseCode?: unknown }).responseCode)
            : undefined

    if (code === "EAUTH" || responseCode === 535 || /badcredentials|username and password not accepted/i.test(message)) {
        return new Error(
            `SMTP Authentication Rejected by ${env.smtpHost || 'Mail Server'}. Please verify that SMTP_USER (${env.smtpUser}) and SMTP_PASS are correct, and restart your server. Error: ${message}`
        )
    }

    return error
}

function getTransporter() {
    if (transporter) return transporter

    const smtp = getSafeSmtpConfig()

    // Gmail App Password strategy. Also respects SMTP_HOST/SMTP_PORT for other SMTP providers.
    transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: {
            user: smtp.user,
            pass: smtp.pass,
        },
        // In dev, allow unauthorized to bypass self-signed cert issues if any
        // Note: Gmail generally has valid certs, but this helps in some local network setups
        tls: {
            rejectUnauthorized: env.isProduction,
        },
        debug: process.env.SMTP_DEBUG === "true",
        logger: process.env.SMTP_DEBUG === "true",
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
        throw normalizeMailError(error)
    }
}

export async function verifyEmailProvider() {
    try {
        const t = getTransporter()
        await t.verify()
        return {
            ok: true,
            provider: "smtp",
            detail: "Connection successful",
            host: getSafeSmtpConfig().host,
            port: getSafeSmtpConfig().port,
            user: getSafeSmtpConfig().user,
            from: env.mailFrom || getSafeSmtpConfig().user,
        }
    } catch (error: any) {
        const normalized = normalizeMailError(error)
        const message = normalized instanceof Error ? normalized.message : String(normalized)
        console.error("[Mailer] Verify failed:", message)
        let config: ReturnType<typeof getSafeSmtpConfig> | null = null
        try {
            config = getSafeSmtpConfig()
        } catch {
            config = null
        }
        return {
            ok: false,
            provider: "smtp",
            error: message,
            host: config?.host || env.smtpHost || "smtp.gmail.com",
            port: config?.port || Number(env.smtpPort ?? 465),
            user: config?.user || env.smtpUser || null,
            from: env.mailFrom || config?.user || env.smtpUser || null,
        }
    }
}
