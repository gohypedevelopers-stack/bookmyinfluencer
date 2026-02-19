
import CreatorOnboarding from "@/components/creator/CreatorOnboarding"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Join as Creator | Book My Influencers",
    description: "Start your journey as a creator",
}

export default function CreatorOnboardingPage() {
    return <CreatorOnboarding />
}
