"use client";

import { useEffect, useRef } from 'react';
import { globalConfig } from '@/config/globalConfig';

export function useCustomScrollbar() {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only apply scrollbar if enabled in config
    if (!globalConfig.components.customScrollbar) {
      return;
    }

    const handleScroll = () => {
      // Add scrolling class to show scrollbar
      document.documentElement.classList.add('scrolling');
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Hide scrollbar after 1 second of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        document.documentElement.classList.remove('scrolling');
      }, 1000);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check in case page loads scrolled
    if (window.scrollY > 0) {
      document.documentElement.classList.add('scrolling');
      scrollTimeoutRef.current = setTimeout(() => {
        document.documentElement.classList.remove('scrolling');
      }, 1000);
    }

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      document.documentElement.classList.remove('scrolling');
    };
  }, []);
} 