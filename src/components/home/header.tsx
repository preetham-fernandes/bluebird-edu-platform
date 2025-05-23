"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useMagneticHover } from "@/hooks/use-magnetic-hover"
import Image from 'next/image';

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const getStartedRef = useRef(null)
  useMagneticHover(getStartedRef, { strength: 20 })

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  // Close mobile menu when window is resized to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [mobileMenuOpen])

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Adjust for header height
        behavior: "smooth",
      })
    }
    setMobileMenuOpen(false) // Close mobile menu after clicking a link
  }

  return (
    <motion.header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-white/60 ${
        scrolled ? "bg-white/95 shadow-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="#" className="flex items-center space-x-2">
            <Image
              src="/bluebird-logo-white.svg"
              alt="Logo"
              width={40}
              height={40}
              style={{ filter: 'invert(1) sepia(1) saturate(5) hue-rotate(180deg)' }}
            />
            <span className="inline-block text-black text-xl md:text-3xl font-serif">Bluebird Edu</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Button variant="link" className="text-black font-normal" onClick={scrollToSection("about")}>
              About
            </Button>
            <Button variant="link" className="text-black font-normal" onClick={scrollToSection("features")}>
              Features
            </Button>
            <Button variant="link" className="text-black font-normal" onClick={scrollToSection("how-it-works")}>
              How It Works
            </Button>
            <Button variant="link" className="text-black font-normal" onClick={scrollToSection("pricing")}>
              Pricing
            </Button>
            
            <div ref={getStartedRef}>
              <Button
                variant="default"
                className="text-sm bg-black text-white hover:bg-muted hover:text-white font-normal ml-4"
                asChild
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="text-black"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed right-0 top-16 w-64 bg-white/80 shadow-lg z-30 flex flex-col "
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col p-4 space-y-4">
              <Button variant="ghost" className="w-full justify-start text-black font-normal" onClick={scrollToSection("about")}>
                About
              </Button>
              <Button variant="ghost" className="w-full justify-start text-black font-normal" onClick={scrollToSection("features")}>
                Features
              </Button>
              <Button variant="ghost" className="w-full justify-start text-black font-normal" onClick={scrollToSection("how-it-works")}>
                How It Works
              </Button>
              <Button variant="ghost" className="w-full justify-start text-black font-normal" onClick={scrollToSection("pricing")}>
                Pricing
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}