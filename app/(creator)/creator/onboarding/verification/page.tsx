import { VerificationClient } from "./VerificationClient"
import { getVerifiedUserIdFromCookies } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function VerificationPage() {
    const userId = await getVerifiedUserIdFromCookies()
    if (!userId) redirect("/verify")

    return <VerificationClient />
}
