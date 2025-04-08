
export function AboutSection() {
  return (
    <section
      className="w-full h-screen py-12 md:py-24 lg:py-32 bg-primary/5 dark:bg-primary/10 dark:brightness-[0.8] relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/wind-turbine.svg')`, // Use absolute path from public/
      }}
      id="about"
    >
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl text-white font-bold tracking-tighter sm:text-4xl md:text-5xl">
                About Bluebird Edu
              </h2>
              <p className="max-w-[600px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Bluebird Edu is dedicated to helping aviation professionals excel in their certification exams. Our
                platform provides comprehensive study materials, practice questions, and mock tests designed by industry
                experts.
              </p>
              <p className="max-w-[600px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We currently focus on Boeing 737 Max certification, with plans to expand to other aircraft types. Our
                goal is to make exam preparation efficient, effective, and accessible for all aviation professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
