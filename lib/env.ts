type EnvConfig = {
  nodeEnv: string
  isProduction: boolean
  otpSecret: string
  authSecret: string
  resendApiKey?: string
  smtpHost?: string
  smtpPort?: string
  smtpUser?: string
  smtpPass?: string
  mailFrom?: string
}

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const nodeEnv = process.env.NODE_ENV ?? "development"
const isProduction = nodeEnv === "production"

const mailFrom =
  process.env.FROM_EMAIL ||
  process.env.SMTP_FROM ||
  (isProduction ? undefined : "no-reply@example.com")

if (isProduction && !mailFrom) {
  throw new Error("FROM_EMAIL (or SMTP_FROM) must be set in production")
}

export const env: EnvConfig = {
  nodeEnv,
  isProduction,
  otpSecret: requireEnv("OTP_SECRET"),
  authSecret: requireEnv("AUTH_SECRET"),
  resendApiKey: process.env.RESEND_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  mailFrom,
}
