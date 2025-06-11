"use client"

import { useId, useState } from "react"
import { LayoutGrid, Rows3 } from "lucide-react"

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

interface SettingsComponentProps {
  visibleCardCount?: number;
}

export default function SettingsComponent({ visibleCardCount = 3 }: SettingsComponentProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const { layout, setLayout, isMobile } = useLayout()

  const handleLayoutChange = (value: string) => {
    const newLayout = value === "1" ? "list" : "grid"
    setLayout(newLayout)
  }

  // Hide settings button if no options are available (i.e., on mobile where only list is available)
  if (isMobile) {
    return null
  }
  
  // Hide settings button if only 1 card is showing (only layout toggle available, but limited usefulness)
  if (visibleCardCount === 1) {
    return null
  }
  
  return (
    <div style={{ pointerEvents: 'auto' }}>
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
            <DialogTitle className="text-center">App Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3 text-center">Layout</h3>
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
              </RadioGroup>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
