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
      console.log('🔄 Starting global data refresh...');
      
      // 1. Clear the global API cache
      apiCache.clear();
      console.log('✅ Global API cache cleared');
      
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
        console.log(`✅ Cleared ${keysToRemove.length} localStorage keys`);
      }
      
      // 3. Clear module-level caches by dispatching a custom event
      window.dispatchEvent(new CustomEvent('global-cache-clear', { 
        detail: { timestamp: Date.now() } 
      }));
      console.log('✅ Global cache clear event dispatched');
      
      // 4. Simple page reload to refresh all data
      console.log('🔄 Reloading page for fresh data...');
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error during global data refresh:', error);
      setIsRefreshing(false);
    }
  }, []);

  return {
    isRefreshing,
    refreshAllData
  };
} 