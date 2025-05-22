"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InlineWidget } from "react-calendly";

interface CalendlyDialogProps {
  calendlyUrl: string;
  triggerText?: string;
  triggerClassName?: string;
  children?: React.ReactNode;
}

export default function CalendlyDialog({ 
  calendlyUrl, 
  triggerText = "Book a call",
  triggerClassName = "text-blue-500 font-semibold text-xs",
  children 
}: CalendlyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className={triggerClassName}>
            {triggerText}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl px-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Schedule a Call</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="flex-1 h-full mt-0 mb-8">
        <InlineWidget styles={{ height: '700px', width: '100%', padding: '0px', margin: '0px' }} url={calendlyUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
} 