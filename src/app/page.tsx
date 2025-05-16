import { Header } from "@/components/home/header"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { PricingSection } from "@/components/home/pricing-section"
import { AboutSection } from "@/components/home/about-section"
import { CTASection } from "@/components/home/cta-section"
import { Footer } from "@/components/home/footer"
import { BackgroundGradient } from "@/components/home/background-gradient"


export default function Home() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      
      <BackgroundGradient />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
