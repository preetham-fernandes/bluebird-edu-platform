import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground" id="cta">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Elevate Your Exam Preparation?
            </h2>
            <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join Bluebird Edu today and take your pilot certification journey to new heights.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" className="bg-black text-primary hover:bg-white/90" asChild>
              <Link href="/register">Get Started Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

