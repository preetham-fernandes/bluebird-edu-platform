// import { HeroSection } from "@/components/home/hero-section"
// import { FeaturesSection } from "@/components/home/features-section"
// import { HowItWorksSection } from "@/components/home/how-it-works-section"
// import { PricingSection } from "@/components/home/pricing-section"
// import { AboutSection } from "@/components/home/about-section"
// import { CTASection } from "@/components/home/cta-section"
// import { Footer } from "@/components/home/footer"
// import { Header } from "@/components/home/header"
import { Button } from "@/components/ui/button";
import Link from "next/link";
export type { Metadata } from "next";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer /> */}

      <h1 className="text-6xl text-center font-bold mb-8">
        Welcome to <br></br> Bluebird{" "}
      </h1>
      <Button
        variant="default"
        className="text-2xl font-mono px-4 py-2"
        asChild
      >
        <Link href="/boeing-737-max/practice-test">Get Started</Link>
      </Button>
    </div>
  );
}
