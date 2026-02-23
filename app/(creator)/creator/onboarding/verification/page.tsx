export const dynamic = 'force-dynamic'

import { VerificationClient } from "./VerificationClient"
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth"
import { redirect } from "next/navigation"

export default async function VerificationPage() {
    const userId = await getAuthenticatedCreatorId()
    if (!userId) redirect("/verify")

    return <VerificationClient />
}
