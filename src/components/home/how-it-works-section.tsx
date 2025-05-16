"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

export function HowItWorksSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 })

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <motion.section
      ref={sectionRef}
      className="w-full py-8 bg-white"
      id="how-it-works"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="flex flex-col items-center justify-center space-y-4 text-center" variants={itemVariants}>
          <div className="space-y-2">
            <motion.h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-black" variants={itemVariants}>
              How It Works
            </motion.h2>
            <motion.p
              className="max-w-[900px]  md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-black"
              variants={itemVariants}
            >
              Simple steps to enhance your exam preparation
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12"
          variants={containerVariants}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="flex flex-col items-center space-y-2 text-center"
              variants={itemVariants}
              custom={index}
            >
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {step.number}
              </motion.div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-black">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
