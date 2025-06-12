"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useLoading } from "@/components/providers/LoadingProvider";
import { globalConfig } from "@/config/globalConfig";

interface CardLoadingWrapperProps {
  cardId: string;
  children: ReactNode;
  dependencies?: any[];
  className?: string;
}

export function CardLoadingWrapper({ 
  cardId, 
  children, 
  dependencies = [], 
  className 
}: CardLoadingWrapperProps) {
  const { registerComponent, markComponentLoaded, markComponentError } = useLoading();
  const hasRegisteredRef = useRef(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get config values
  const { componentLoadingDelay } = globalConfig.loadingOverlay;

  // Register the component on mount
  useEffect(() => {
    if (!hasRegisteredRef.current) {
      registerComponent(cardId);
      hasRegisteredRef.current = true;
    }
  }, [cardId, registerComponent]);

  // Track when the card should be considered loaded
  useEffect(() => {
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Check if all dependencies are ready
    const hasUndefinedDeps = dependencies.some(dep => dep === undefined || dep === null);
    
    if (!hasUndefinedDeps || dependencies.length === 0) {
      // Use configured delay to allow for DOM updates
      loadTimeoutRef.current = setTimeout(() => {
        markComponentLoaded(cardId);
      }, componentLoadingDelay);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [dependencies, cardId, markComponentLoaded, componentLoadingDelay]);

  // Intersection Observer to detect when card is actually visible
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Card is visible, mark immediately
            markComponentLoaded(`${cardId}-visible`);
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(cardElement);

    return () => {
      observer.disconnect();
    };
  }, [cardId, markComponentLoaded]);

  // Register visibility tracking
  useEffect(() => {
    registerComponent(`${cardId}-visible`);
  }, [cardId, registerComponent]);

  return (
    <div 
      ref={cardRef} 
      className={className}
      data-card-id={cardId}
    >
      {children}
    </div>
  );
} 