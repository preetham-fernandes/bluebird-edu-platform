"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface PricingPlanProps {
  title: string
  description: string
  price: string
  features: string[]
  buttonText: string
  buttonVariant?: "default" | "outline"
  highlighted?: boolean
  href: string
}

function PricingPlan({
  title,
  description,
  price,
  features,
  buttonText,
  buttonVariant = "default",
  highlighted = false,
  href,
}: PricingPlanProps) {
  return (
    <div>
      <Card className={`flex flex-col h-full ${highlighted ? "border-foreground shadow-lg" : ""}`}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <div className="mt-4 text-4xl font-bold">{price}</div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="grid gap-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {/* Removed text-primary */}
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="pt-0 mt-auto">
          <Button
            className={`w-full ${highlighted ? "bg-foreground text-background hover:bg-foreground/90" : ""}`}
            variant={buttonVariant}
            asChild
          >
            <Link href={href}>{buttonText}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export function PricingSection() {
  const pricingPlans = [
    {
      title: "Free Trial",
      description: "Get started with basic access",
      price: "₹0",
      features: ["10 questions per system", "Access to 3-4 subjects", "Basic progress tracking"],
      buttonText: "Sign Up Free",
      buttonVariant: "default" as const,
      highlighted: false,
      href: "/register",
    },
    {
      title: "Full Access",
      description: "Complete access to one aircraft",
      price: "₹5,999",
      features: [
        "Full question bank for one aircraft",
        "Unlimited practice questions",
        "5 complete mock tests",
        "Detailed performance analytics",
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "default" as const,
      highlighted: false, // Made this highlighted
      href: "/register",
    },
    {
      title: "Test Series",
      description: "Individual test packages",
      price: "₹2,999",
      features: [
        "Individual test series purchase",
        "Specific aircraft focus",
        "Results and explanations",
        "Performance comparison",
      ],
      buttonText: "Buy Test Series",
      buttonVariant: "default" as const,
      highlighted: false,
      href: "/register",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32" id="pricing">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-black">Pricing Plans</h2>
            <p className="max-w-[900px]  md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-black">
              Flexible options to suit your preparation needs
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
          {pricingPlans.map((plan, index) => (
            <PricingPlan
              key={index}
              title={plan.title}
              description={plan.description}
              price={plan.price}
              features={plan.features}
              buttonText={plan.buttonText}
              buttonVariant={plan.buttonVariant}
              highlighted={plan.highlighted}
              href={plan.href}
            />
          ))}
        </div>
      </div>
    </section>
  )
}