import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { getVerifiedUserIdFromCookies } from "@/lib/session"

export default async function VerifyPage() {
  const userId = await getVerifiedUserIdFromCookies()
  if (userId) {
    const creator = await db.creator.findUnique({ where: { userId }, select: { id: true } })
    redirect(creator ? "/creator/dashboard" : "/creator/onboarding")
  }

  redirect("/login")
}

