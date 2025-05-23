"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type LayoutType = "list" | "grid"

interface LayoutContextType {
  layout: LayoutType
  setLayout: (layout: LayoutType) => void
  isMobile: boolean
  effectiveLayout: LayoutType // The actual layout to use (considering mobile override)
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayoutState] = useState<LayoutType>("list")
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 1024) // lg breakpoint
    }

    // Check on mount
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // Load layout from localStorage on component mount
  useEffect(() => {
    const savedLayout = localStorage.getItem("app-layout") as LayoutType
    if (savedLayout && (savedLayout === "list" || savedLayout === "grid")) {
      setLayoutState(savedLayout)
    }
  }, [])

  // Save layout to localStorage whenever it changes
  const setLayout = (newLayout: LayoutType) => {
    setLayoutState(newLayout)
    localStorage.setItem("app-layout", newLayout)
  }

  // Force list layout on mobile
  const effectiveLayout = isMobile ? "list" : layout

  return (
    <LayoutContext.Provider value={{ layout, setLayout, isMobile, effectiveLayout }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }
  return context
} 