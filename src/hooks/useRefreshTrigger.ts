import { useState, useCallback, useEffect } from 'react';

// Global refresh trigger state
let globalRefreshCounter = 0;
const refreshListeners: Set<(counter: number) => void> = new Set();

/**
 * Hook that provides a way to trigger and listen for global refresh events
 * This ensures all components refresh when requested
 */
export function useRefreshTrigger() {
  const [refreshCounter, setRefreshCounter] = useState(globalRefreshCounter);

  // Subscribe to global refresh events
  useEffect(() => {
    const listener = (counter: number) => {
      setRefreshCounter(counter);
    };
    
    refreshListeners.add(listener);
    
    return () => {
      refreshListeners.delete(listener);
    };
  }, []);

  // Function to trigger a global refresh
  const triggerGlobalRefresh = useCallback(() => {
    globalRefreshCounter++;
    refreshListeners.forEach(listener => listener(globalRefreshCounter));
  }, []);

  return {
    refreshCounter,
    triggerGlobalRefresh
  };
}

/**
 * Hook specifically for triggering refresh (used by the Settings component)
 */
export function useGlobalRefreshTrigger() {
  const { triggerGlobalRefresh } = useRefreshTrigger();
  return triggerGlobalRefresh;
} 