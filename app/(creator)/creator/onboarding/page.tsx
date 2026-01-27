import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { OnboardingClient } from "./OnboardingClient"

export default async function CreatorOnboardingPage() {
  const userId = await getVerifiedUserIdFromCookies()
  if (!userId) redirect("/verify")

  const creator = await db.creator.findUnique({ where: { userId }, select: { id: true } })
  if (creator) redirect("/creator/dashboard")

  return <OnboardingClient />
}

