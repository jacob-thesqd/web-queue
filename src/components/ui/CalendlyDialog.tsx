"use client";

import { useEffect } from "react";
import { PopupWidget } from "react-calendly";

// Declare Calendly global type
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

interface CalendlyDialogProps {
  calendlyUrl: string;
  triggerText?: string;
  triggerClassName?: string;
  textColor?: string;
  color?: string;
  children?: React.ReactNode;
}

export default function CalendlyDialog({ 
  calendlyUrl, 
  triggerText = "Book a call",
  triggerClassName = "text-blue-500 font-semibold text-xs",
  textColor = "#ffffff",
  color = "#00a2ff",
  children 
}: CalendlyDialogProps) {
  
  useEffect(() => {
    // Add custom styles for blur effect behind Calendly popup
    const style = document.createElement('style');
    style.textContent = `
      .calendly-overlay {
        backdrop-filter: blur(8px) !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
      }
      
      /* Target Calendly's popup overlay */
      div[style*="position: fixed"][style*="z-index"] {
        backdrop-filter: blur(8px) !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const openCalendlyPopup = () => {
    // Use Calendly's global method to open popup
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: calendlyUrl });
    }
  };

  return (
    <>
      {/* Hidden PopupWidget to load Calendly scripts */}
      <div style={{ display: 'none' }}>
        <PopupWidget
          url={calendlyUrl}
          rootElement={document.getElementById("root") || document.body}
          text=""
          textColor={textColor}
          color={color}
        />
      </div>
      
      {/* Custom trigger button in original position */}
      {children ? (
        <div onClick={openCalendlyPopup} style={{ cursor: 'pointer' }}>
          {children}
        </div>
      ) : (
        <button 
          className={triggerClassName}
          onClick={openCalendlyPopup}
        >
          {triggerText}
        </button>
      )}
    </>
  );
} 