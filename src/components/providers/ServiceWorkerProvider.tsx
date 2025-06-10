"use client";

import { useEffect } from 'react';

export function ServiceWorkerProvider() {
  useEffect(() => {
    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Handle page visibility for back/forward cache optimization
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible - re-initialize if needed
        console.log('Page became visible');
      } else {
        // Page became hidden - cleanup resources
        console.log('Page became hidden');
      }
    };

    // Handle page show/hide for bfcache optimization
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        console.log('Page restored from bfcache');
        // Force a re-render by dispatching a custom event
        window.dispatchEvent(new CustomEvent('bfcache-restore'));
      }
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page is being stored in bfcache
        console.log('Page stored in bfcache');
      }
      
      // Clean up any ongoing operations that could prevent bfcache
      // Clear timeouts, intervals, etc.
      const timeouts = (window as any).__timeouts || [];
      timeouts.forEach((id: number) => clearTimeout(id));
      
      const intervals = (window as any).__intervals || [];
      intervals.forEach((id: number) => clearInterval(id));
    };

    // Handle unload to prevent bfcache blocking
    const handleBeforeUnload = () => {
      // Don't prevent unload - this would block bfcache
      // Just cleanup resources
    };

    // Listen for service worker messages
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PAGE_RESTORED_FROM_BFCACHE') {
        // Handle restoration from bfcache
        window.dispatchEvent(new CustomEvent('bfcache-restore'));
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, []);

  return null; // This is a provider component, no UI
} 