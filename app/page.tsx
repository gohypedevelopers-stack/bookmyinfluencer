
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { TalentSection } from "@/components/landing/TalentSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { WorkflowSection } from "@/components/landing/WorkflowSection"
import { CallToAction } from "@/components/landing/CallToAction"

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col transition-colors duration-500">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TalentSection />
      <TestimonialsSection />
      <WorkflowSection />
      <CallToAction />
      <Footer />
    </div>
  )
}
