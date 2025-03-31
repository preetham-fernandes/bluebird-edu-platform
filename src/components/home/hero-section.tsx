"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"

export function HeroSection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  // Transform values for airplane animation
  const planeX = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"])
  const planeY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-100%"])
  const planeRotate = useTransform(scrollYProgress, [0, 0.2, 0.5], [0, 15, 25])
  const planeScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1.2])

  return (
    <section
      ref={containerRef}
      className="w-full h-screen py-12 md:py-24 lg:py-32 bg-primary/5 dark:bg-primary/10 relative bg-cover bg-center bg-no-repeat overflow-hidden"
    >
      <div className="container px-4 md:px-6 relative z-10 text-white">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4 mt-15">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Master Your Pilot Exams with Bluebird Edu
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Comprehensive mock tests and practice questions for aviation professionals. Prepare for your pilot exams
                with confidence.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Airplane animation */}
      <motion.div
        className="absolute bottom-[10%] left-[-10%] z-20 w-[300px] h-[150px] md:w-[400px] md:h-[200px] lg:w-[500px] lg:h-[250px]"
        style={{
          x: planeX,
          y: planeY,
          rotate: planeRotate,
          scale: planeScale,
        }}
      >
        <Image src="/animated-plane.svg" alt="Airplane" fill className="object-contain" priority />
      </motion.div>

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/50"></div>
    </section>
  )
}

