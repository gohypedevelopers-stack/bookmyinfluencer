import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { OnboardingClient } from "./OnboardingClient"

export default async function CreatorOnboardingPage() {
  const userId = await getVerifiedUserIdFromCookies()
  if (!userId) redirect("/verify")

  console.log("Onboarding Page - UserID:", userId);

  const creator = await db.creator.findUnique({
    where: { userId },
    select: {
      id: true,
      instagramUrl: true,
      youtubeUrl: true,
      lastInstagramFetchAt: true,
      lastYoutubeFetchAt: true,
      rawSocialData: true,
    }
  })

  console.log("Onboarding Page - Creator Found:", creator);

  // If we have social data already, user might be revisiting.
  // But for onboarding flow, we primarily want to seed the inputs.

  return <OnboardingClient
    initialInstagramUrl={creator?.instagramUrl || ""}
    initialYoutubeUrl={creator?.youtubeUrl || ""}
  />
}

