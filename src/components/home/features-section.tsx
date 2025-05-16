"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, BarChart3, Plane, Shield, Users } from "lucide-react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <div>
            {icon}
          </div>
          <div className="grid gap-1">
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p>{description}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function FeaturesSection() {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 " />,
      title: "Comprehensive Question Bank",
      description: "Access thousands of MCQs across 13 subject categories with detailed explanations.",
    },
    {
      icon: <Clock className="h-8 w-8 " />,
      title: "Practice & Mock Tests",
      description:
        "Subject-specific practice with immediate feedback and timed mock tests that simulate exam conditions.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 " />,
      title: "Progress Tracking",
      description: "Monitor your performance with detailed analytics and identify areas for improvement.",
    },
    {
      icon: <Plane className="h-8 w-8 " />,
      title: "Aircraft-Specific Content",
      description: "Starting with Boeing 737 Max, with plans to expand to Airbus A320 and other aircraft.",
    },
    {
      icon: <Shield className="h-8 w-8 " />,
      title: "Secure Platform",
      description:
        "Encrypted data, secure authentication, and anti-cheating measures to protect the integrity of your learning.",
    },
    {
      icon: <Users className="h-8 w-8 " />,
      title: "Easy Registration",
      description: "Quick sign-up with email + OTP or Google authentication. No manual approvals needed.",
    },
  ]

  return (
    <section className="w-full py-8" id="features">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-4xl md:text-5xl">Key Features</h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to prepare for your pilot certification exams
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}