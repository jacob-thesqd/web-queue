"use client"

import { useId, useState, useRef, useEffect } from "react"
import { LayoutGrid, Rows3, RefreshCw } from "lucide-react"
import { motion, Easing, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLayout } from "@/hooks/use-layout"
import { useGlobalDataRefresh } from "@/hooks/useGlobalDataRefresh"
import { globalConfig } from "@/config/globalConfig"

interface SettingsComponentProps {
  visibleCardCount?: number;
  shouldShow?: boolean;
}

export default function SettingsComponent({ 
  visibleCardCount = 3, 
  shouldShow = true 
}: SettingsComponentProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const { layout, setLayout, isMobile } = useLayout()
  const { isRefreshing, refreshAllData } = useGlobalDataRefresh()
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const handleLayoutChange = (value: string) => {
    const newLayout = value === "1" ? "list" : "grid"
    setLayout(newLayout)
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])
  
  // Don't render if shouldShow is false
  if (!shouldShow) {
    return null
  }
  
  if (isMobile && visibleCardCount === 1) {
    return null
  }
  
  // Hide on mobile if globally disabled
  if (isMobile && !globalConfig.components.showSettingsOnMobile) {
    return null
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" as Easing, delay: 0.2 }}
      style={{ pointerEvents: 'auto' }}
      className="relative"
    >
      <Button 
        ref={buttonRef}
        variant="glass"
        style={{ pointerEvents: 'auto', position: 'relative' }}
        onClick={() => setOpen(!open)}
      >
        Settings
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 isolate rounded-xl bg-white/10 shadow-md ring-1 ring-black/5 backdrop-blur-sm border border-white/90 text-black p-4 z-50"
          >
            <div className="space-y-6">
              {(!isMobile || visibleCardCount > 1) && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-left">Layout</h3>
                  <RadioGroup 
                    className="gap-2" 
                    value={layout === "list" ? "1" : "2"} 
                    onValueChange={handleLayoutChange}
                  >
                    <div className="bg-white/50 shadow-md backdrop-blur-sm border border-white hover:bg-gray-100 text-foreground has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-white/70 relative flex w-full items-center justify-between rounded-md px-4 py-3 outline-none">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Rows3 className="w-4 h-4" />
                          <Label htmlFor={`${id}-1`}>List</Label>
                        </div>
                      </div>
                      <RadioGroupItem
                        value="1"
                        id={`${id}-1`}
                        aria-describedby={`${id}-1-description`}
                        className="after:absolute after:inset-0"
                      />
                    </div>
                    {!isMobile && (
                      <div className="bg-white/50 shadow-md backdrop-blur-sm border border-white hover:bg-gray-100 text-foreground has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-white/70 relative flex w-full items-center justify-between rounded-md px-4 py-3 outline-none">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4" />
                            <Label htmlFor={`${id}-2`}>Grid</Label>
                          </div>
                        </div>
                        <RadioGroupItem
                          value="2"
                          id={`${id}-2`}
                          aria-describedby={`${id}-2-description`}
                          className="after:absolute after:inset-0"
                        />
                      </div>
                    )}
                  </RadioGroup>
                </div>
              )}
              <div>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={refreshAllData}
                    disabled={isRefreshing}
                    className="w-fit"
                  >
                    {isRefreshing ? 'Refreshing...' : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh App Data</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
