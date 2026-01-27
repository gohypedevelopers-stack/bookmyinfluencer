import crypto from "crypto"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0")
}

export function hashOtp(email: string, otp: string) {
  const otpSecret = process.env.OTP_SECRET
  if (!otpSecret) {
    throw new Error("Missing OTP_SECRET env var")
  }

  const normalizedEmail = normalizeEmail(email)
  return crypto
    .createHmac("sha256", otpSecret)
    .update(`${normalizedEmail}:${otp}`)
    .digest("hex")
}

export function constantTimeEqualHex(a: string, b: string) {
  const aBuf = Buffer.from(a, "hex")
  const bBuf = Buffer.from(b, "hex")
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

