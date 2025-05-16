"use client"

import type React from "react"

import { useRef, useEffect } from "react"

interface MagneticHoverOptions {
  strength?: number
  ease?: number
}

export function useMagneticHover(ref: React.RefObject<HTMLElement>, options: MagneticHoverOptions = {}) {
  const { strength = 25, ease = 0.15 } = options

  const animationRef = useRef<number | null>(null)
  const positionRef = useRef({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    let bounds: DOMRect

    const handleMouseMove = (e: MouseEvent) => {
      if (!element) return

      bounds = element.getBoundingClientRect()

      const x = e.clientX - bounds.left - bounds.width / 2
      const y = e.clientY - bounds.top - bounds.height / 2

      positionRef.current = { x, y }

      if (animationRef.current === null) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    const handleMouseLeave = () => {
      positionRef.current = { x: 0, y: 0 }
      if (animationRef.current === null) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    const animate = () => {
      if (!element) {
        animationRef.current = null
        return
      }

      const { x, y } = positionRef.current

      const newX = x * ease
      const newY = y * ease

      element.style.transform = `translate(${newX / strength}px, ${newY / strength}px)`

      const isDone = Math.abs(newX) < 0.1 && Math.abs(newY) < 0.1

      if (isDone) {
        element.style.transform = ""
        animationRef.current = null
        return
      }

      positionRef.current = { x: newX, y: newY }
      animationRef.current = requestAnimationFrame(animate)
    }

    element.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseleave", handleMouseLeave)

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [ref, strength, ease])
}
