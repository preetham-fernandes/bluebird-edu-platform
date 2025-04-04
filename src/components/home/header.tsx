"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Plane } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="#" className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold">Bluebird Edu</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" className="text-sm font-medium" asChild>
              <Link href="#features">Features</Link>
            </Button>
            <Button variant="ghost" className="text-sm font-medium" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
            <Button variant="ghost" className="text-sm font-medium" asChild>
              <Link href="#pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" className="text-sm font-medium" asChild>
              <Link href="#about">About</Link>
            </Button>
            <Button variant="default" className="text-sm font-medium" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}

