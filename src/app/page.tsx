import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { PricingSection } from "@/components/home/pricing-section"
import { AboutSection } from "@/components/home/about-section"
import { CTASection } from "@/components/home/cta-section"
import { Footer } from "@/components/home/footer"
import { Header } from "@/components/home/header"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
