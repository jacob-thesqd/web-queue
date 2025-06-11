import { useCallback, useState } from 'react';
import { apiCache } from '@/lib/api-cache';

/**
 * Hook to manage global data refresh across the entire application
 * Provides a centralized way to clear all caches and trigger refetch
 */
export function useGlobalDataRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // 1. Clear the global API cache
      apiCache.clear();
      
      // 2. Clear all localStorage caches used by various hooks
      if (typeof window !== 'undefined') {
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.includes('cache') || 
          key.includes('data') || 
          key.includes('api') ||
          key.includes('task-templates') ||
          key.includes('milestone') ||
          key.includes('account') ||
          key.includes('strategy')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      // 3. Clear module-level caches by dispatching a custom event
      // Components can listen to this event and clear their local caches
      window.dispatchEvent(new CustomEvent('global-cache-clear', { 
        detail: { timestamp: Date.now() } 
      }));
      
      // 4. Force URL change to trigger React hooks re-execution
      const currentUrl = new URL(window.location.href);
      const searchParams = new URLSearchParams(currentUrl.search);
      const refreshParam = `_r${Date.now()}`;
      searchParams.set('refresh', refreshParam);
      
      // Update URL to trigger useEffect dependencies
      const newUrl = `${currentUrl.pathname}?${searchParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
      
      // Give components time to react to the URL change and re-fetch data
      setTimeout(() => {
        // Clean up the refresh parameter
        const cleanUrl = new URL(window.location.href);
        const cleanParams = new URLSearchParams(cleanUrl.search);
        cleanParams.delete('refresh');
        const finalUrl = cleanParams.toString() ? 
          `${cleanUrl.pathname}?${cleanParams.toString()}` : 
          cleanUrl.pathname;
        window.history.replaceState({}, '', finalUrl);
        
        setIsRefreshing(false);
      }, 1500); // Allow time for data fetching
      
    } catch (error) {
      console.error('Error during global data refresh:', error);
      setIsRefreshing(false);
    }
  }, []);

  return {
    isRefreshing,
    refreshAllData
  };
} 