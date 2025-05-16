"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { TypeAnimation } from "react-type-animation"
import { useMagneticHover } from "@/hooks/use-magnetic-hover"

export function HeroSection() {
  const containerRef = useRef(null)

  // Magnetic hover for buttons
  const primaryBtnRef = useRef(null)
  const secondaryBtnRef = useRef(null)
  useMagneticHover(primaryBtnRef, { strength: 30 })
  useMagneticHover(secondaryBtnRef, { strength: 20 })

  return (
    <section
      ref={containerRef}
      className="w-full h-screen relative overflow-hidden flex items-center"
    >
      {/* Full screen background image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image 
          src="/home/cockpit8.webp"
          alt="Cockpit View"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay to improve text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content container */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="space-y-4">
            <motion.h1
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="block">Master Your Pilot Exams with</span>
              <TypeAnimation
                sequence={["Bluebird Edu", 1000, "Confidence", 1000, "Precision", 1000]}
                wrapper="span"
                speed={50}
                className="text-primary"
                repeat={Number.POSITIVE_INFINITY}
              />
            </motion.h1>
            <motion.p
              className="text-white/90 md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Comprehensive mock tests and practice questions for aviation professionals. Prepare for your pilot exams
              with confidence.
            </motion.p>
          </div>
          <motion.div
            className="flex flex-col gap-2 min-[400px]:flex-row mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div ref={primaryBtnRef}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 relative z-10" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
            </div>
            <div ref={secondaryBtnRef}>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 relative z-10" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}