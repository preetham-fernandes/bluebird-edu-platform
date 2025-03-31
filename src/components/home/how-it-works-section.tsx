export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Register",
      description: "Create your account using email or Google authentication",
    },
    {
      number: 2,
      title: "Practice",
      description: "Access subject-specific questions with immediate feedback",
    },
    {
      number: 3,
      title: "Test",
      description: "Take timed mock exams that simulate real test conditions",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5 dark:bg-primary/10" id="how-it-works">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Simple steps to enhance your exam preparation
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                {step.number}
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

