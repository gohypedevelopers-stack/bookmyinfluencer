
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { TalentSection } from "@/components/landing/TalentSection"
import { WorkflowSection } from "@/components/landing/WorkflowSection"
import { CallToAction } from "@/components/landing/CallToAction"

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <Navbar />
      {/* Main Content Wrapper */}
      <main id="main-content" className="flex-1 w-full">
        <HeroSection />
        <FeaturesSection />
        <TalentSection />
        <WorkflowSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
