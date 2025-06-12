"use client"

import { useId, useState, useEffect } from "react"
import { LayoutGrid, Rows3, RefreshCw } from "lucide-react"
import { motion, Easing } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLayout } from "@/hooks/use-layout"
import { useGlobalDataRefresh } from "@/hooks/useGlobalDataRefresh"

interface SettingsComponentProps {
  visibleCardCount?: number;
}

export default function SettingsComponent({ visibleCardCount = 3 }: SettingsComponentProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const { layout, setLayout, isMobile } = useLayout()
  const { isRefreshing, refreshAllData } = useGlobalDataRefresh()
  
  const handleLayoutChange = (value: string) => {
    const newLayout = value === "1" ? "list" : "grid"
    setLayout(newLayout)
  }
  
  // Hide settings button if no options are available (i.e., on mobile where only list is available)
  if (isMobile && visibleCardCount === 1) {
    return null
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" as Easing, delay: 0.2 }}
      style={{ pointerEvents: 'auto' }}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline"
            style={{ pointerEvents: 'auto', position: 'relative' }}
          >
            Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md !fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 !z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-center mb-3">Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Layout Section - Only show if not mobile or if multiple cards visible */}
            {(!isMobile || visibleCardCount > 1) && (
              <div>
                <h3 className="text-sm font-medium mb-3 text-left">Layout</h3>
                <RadioGroup 
                  className="gap-2" 
                  value={layout === "list" ? "1" : "2"} 
                  onValueChange={handleLayoutChange}
                >
                  {/* Radio card #1 */}
                  <div className="border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex w-full items-center justify-between rounded-md border px-4 py-3 shadow-xs outline-none">
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
                  {/* Radio card #2 - Only show on desktop */}
                  {!isMobile && (
                    <div className="border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex w-full items-center justify-between rounded-md border px-4 py-3 shadow-xs outline-none">
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

            {/* Data Management Section - Always show for debugging */}
            <div>
              <div className="border-input relative flex w-full items-center justify-between rounded-md border px-4 py-3 shadow-xs outline-none">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <div>
                      <Label className="text-sm font-medium">Refresh App Data</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Force reload all content with fresh data
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAllData}
                  disabled={isRefreshing}
                  className="shrink-0"
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
