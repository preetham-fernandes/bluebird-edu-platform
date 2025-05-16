"use client"
import { useEffect, useRef } from "react"

export function BackgroundGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    
    // Animation
    let angle = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Move gradient center based on time
      const centerX = canvas.width / 2 + Math.sin(angle) * 100
      const centerY = canvas.height / 2 + Math.cos(angle) * 100
      
      // Changed to neutral colors (white/transparent)
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width / 1.5)
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)")  // White with less opacity
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)") // White with even less opacity
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)") // Transparent
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      angle += 0.002
      requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])
  
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />
}