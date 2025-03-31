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
    <Card className={`flex flex-col ${highlighted ? "border-primary" : ""}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4 text-4xl font-bold">{price}</div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="grid gap-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0 mt-auto">
        <Button
          className={`w-full ${highlighted ? "bg-primary hover:bg-primary/90" : ""}`}
          variant={buttonVariant}
          asChild
        >
          <Link href={href}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
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
      price: "₹XX.XX",
      features: [
        "Full question bank for one aircraft",
        "Unlimited practice questions",
        "5 complete mock tests",
        "Detailed performance analytics",
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "default" as const,
      highlighted: true,
      href: "/register",
    },
    {
      title: "Test Series",
      description: "Individual test packages",
      price: "₹XX.XX",
      features: [
        "Individual test series purchase",
        "Specific aircraft focus",
        "Results and explanations",
        "Performance comparison",
      ],
      buttonText: "Buy Test Series",
      buttonVariant: "outline" as const,
      highlighted: false,
      href: "/register",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32" id="pricing">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Pricing Plans</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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

