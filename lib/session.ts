import crypto from "crypto"
import { cookies } from "next/headers"

type SessionPayload = {
  userId: string
  verified: true
  exp: number
  iat: number
}

function base64UrlEncode(input: Buffer | string) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buffer
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

function base64UrlDecode(input: string) {
  const pad = "=".repeat((4 - (input.length % 4)) % 4)
  const base64 = input.replaceAll("-", "+").replaceAll("_", "/") + pad
  return Buffer.from(base64, "base64")
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("Missing AUTH_SECRET (or NEXTAUTH_SECRET) env var")
  return secret
}

export function signSession(userId: string) {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    userId,
    verified: true,
    iat: now,
    exp: now + 60 * 60 * 24 * 7,
  }

  const header = { alg: "HS256", typ: "JWT" }
  const headerPart = base64UrlEncode(JSON.stringify(header))
  const payloadPart = base64UrlEncode(JSON.stringify(payload))
  const data = `${headerPart}.${payloadPart}`
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(data)
    .digest()

  return `${data}.${base64UrlEncode(signature)}`
}

export function verifySession(token: string): SessionPayload | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null

  const [headerPart, payloadPart, sigPart] = parts
  const data = `${headerPart}.${payloadPart}`
  const expectedSig = crypto
    .createHmac("sha256", getAuthSecret())
    .update(data)
    .digest()

  const providedSig = base64UrlDecode(sigPart)
  if (providedSig.length !== expectedSig.length) return null
  if (!crypto.timingSafeEqual(providedSig, expectedSig)) return null

  let payload: unknown
  try {
    payload = JSON.parse(base64UrlDecode(payloadPart).toString("utf8"))
  } catch {
    return null
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("userId" in payload) ||
    !("verified" in payload) ||
    !("exp" in payload) ||
    !("iat" in payload)
  ) {
    return null
  }

  const p = payload as SessionPayload
  if (p.verified !== true) return null
  const now = Math.floor(Date.now() / 1000)
  if (typeof p.exp !== "number" || p.exp < now) return null
  if (typeof p.userId !== "string" || !p.userId) return null

  return p
}

export async function getVerifiedUserIdFromCookies() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null
  const payload = verifySession(token)
  return payload?.userId ?? null
}

