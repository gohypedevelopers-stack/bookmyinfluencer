import { redirect } from "next/navigation";
import { getAuthenticatedCreatorId } from "@/lib/onboarding-auth";
import { db } from "@/lib/db";
import KYCOnboardingClient from "./KYCOnboardingClient";

export default async function KYCOnboardingPage() {
    const userId = await getAuthenticatedCreatorId();
    if (!userId) redirect("/verify");

    const creator = await db.creator.findUnique({
        where: { userId },
        include: { kycSubmission: true },
    }) as any;

    // If already approved, skip
    if (creator?.verificationStatus === "APPROVED") {
        redirect("/creator/onboarding/finalize");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <KYCOnboardingClient userId={userId} existingKey={creator?.kycSubmission?.selfieImageKey || null} />
        </div>
    );
}
