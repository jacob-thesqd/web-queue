"use client"

import { useId, useState, useRef, useEffect } from "react"
import { LayoutGrid, Rows3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLayout } from "@/hooks/use-layout"

// Custom Dialog Content positioned below trigger
function CustomDialogContent({ 
  children, 
  open, 
  triggerRef,
  onClose
}: { 
  children: React.ReactNode
  open: boolean
  triggerRef: React.RefObject<HTMLButtonElement | null>
  onClose: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose, triggerRef])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className="fixed z-50 bg-background border rounded-xl shadow-lg p-6 max-w-xs w-full animate-in fade-in-0 slide-in-from-top-2 duration-300"
      style={{
        top: triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + 8 : '50%',
        left: triggerRef.current ? triggerRef.current.getBoundingClientRect().left : '50%',
        pointerEvents: 'auto'
      }}
    >
      {children}
    </div>
  )
}

interface SettingsComponentProps {
  visibleCardCount?: number;
}

export default function SettingsComponent({ visibleCardCount = 3 }: SettingsComponentProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { layout, setLayout, isMobile } = useLayout()
  
  const handleToggle = () => {
    setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
  }

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
      <Dialog open={false}>
        <DialogTrigger asChild>
          <Button 
            ref={buttonRef}
            variant="outline"
            style={{ pointerEvents: 'auto', position: 'relative' }}
            onClick={handleToggle}
          >
            Settings
          </Button>
        </DialogTrigger>
      </Dialog>

      <CustomDialogContent open={open} triggerRef={buttonRef} onClose={handleClose}>
        <div className="mb-2 flex flex-col gap-2">
          <div>
            <h2 className="text-lg leading-none font-semibold text-left mb-2">Change app layout</h2>
          </div>
        </div>

        <form className="space-y-5">
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
        </form>
      </CustomDialogContent>
    </div>
  )
}
