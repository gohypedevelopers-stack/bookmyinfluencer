import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"

import { db } from "@/lib/db"
import { verifySession } from "@/lib/session"

const bodySchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(5).max(30).optional().or(z.literal("")),
  niche: z.string().min(2).max(100),
  instagram: z.string().max(200).optional().or(z.literal("")),
  youtube: z.string().max(200).optional().or(z.literal("")),
  portfolioUrl: z.string().max(500).optional().or(z.literal("")),
  country: z.string().min(2).max(80),
})

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  const session = token ? verifySession(token) : null

  if (!session) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
  }

  const user = await db.otpUser.findUnique({
    where: { id: session.userId },
    select: { verifiedAt: true },
  })
  if (!user?.verifiedAt) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 })
  }

  const data = parsed.data

  // Create/Update creator
  const creator = await db.creator.upsert({
    where: { userId: session.userId },
    update: {
      fullName: data.fullName,
      phone: data.phone || null,
      niche: data.niche,
      instagramUrl: data.instagram || null,
      youtubeUrl: data.youtube || null,
      // portfolioUrl: data.portfolioUrl || null, // Field not in schema
      // country: data.country, // Field not in schema
    },
    create: {
      userId: session.userId,
      fullName: data.fullName,
      phone: data.phone || null,
      niche: data.niche,
      instagramUrl: data.instagram || null,
      youtubeUrl: data.youtube || null,
      // portfolioUrl: data.portfolioUrl || null, // Field not in schema
      // country: data.country, // Field not in schema
    },
  })

  // Handle Public Fetch if requested (Logic added dynamically to avoid circular deps if any)
  // We check for the flag in the request body roughly, or add it to schema.
  // Let's assume the client sends it.
  const reqJson = await req.json().catch(() => ({}));
  /* Legacy YouTube API Auto-Fetch - Removed in favor of Apify Logic
  if (reqJson.fetchPublic && data.youtube && process.env.YOUTUBE_API_KEY) {
    try {
      const { resolveChannelIdFromUrl, fetchPublicYouTubeStats } = await import("@/lib/youtube-public");
      const channelId = await resolveChannelIdFromUrl(data.youtube, process.env.YOUTUBE_API_KEY);
      if (channelId) {
        // ... (Logic removed/disabled due to type errors and switch to Apify)
      }
    } catch (e) {
      console.error("Auto-fetch error:", e);
    }
  }
  */

  return NextResponse.json({ ok: true })
}
