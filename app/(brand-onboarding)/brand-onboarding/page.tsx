
import BrandOnboarding from "@/components/brand/BrandOnboarding"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Onboarding | Book My Influencers",
    description: "Get started with your brand profile",
}

export default function BrandOnboardingPage() {
    return <BrandOnboarding />
}
