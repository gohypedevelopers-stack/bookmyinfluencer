import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { OnboardingClient } from "./OnboardingClient"

export default async function CreatorOnboardingPage() {
  const userId = await getAuthenticatedCreatorId()
  if (!userId) redirect("/verify")

  console.log("Onboarding Page - UserID:", userId);

  const creator = await db.creator.findUnique({
    where: { userId },
    select: {
      id: true,
      niche: true,
      instagramUrl: true,
      youtubeUrl: true,
      lastInstagramFetchAt: true,
      lastYoutubeFetchAt: true,
      rawSocialData: true,
    }
  })

  // If creator has already completed onboarding (niche is selected), go to dashboard
  if (creator?.niche) {
    redirect("/creator/dashboard")
  }

  console.log("Onboarding Page - Creator Found:", creator);

  // If we have social data already, user might be revisiting.
  // But for onboarding flow, we primarily want to seed the inputs.

  return <OnboardingClient
    initialInstagramUrl={creator?.instagramUrl || ""}
    initialYoutubeUrl={creator?.youtubeUrl || ""}
  />
}

