import { useEffect, useState, useRef } from 'react';
import { StrategyMemberData } from '@/lib/supabase/getStrategyMemberData';
import { fetchStrategyMember } from '@/lib/api-helpers';
import { globalConfig } from '@/config/globalConfig';

// Cache for strategy member data with timestamp-based expiration
const strategyDataCache: Record<string, { 
  data: StrategyMemberData; 
  timestamp: number;
}> = {};

// Track ongoing fetch requests to prevent duplicates
const ongoingRequests: Record<string, Promise<void>> = {};

export function useStrategyData(accountId?: string) {
  const [memberData, setMemberData] = useState<StrategyMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    if (!accountId) {
      setMemberData(null);
      setLoading(false);
      return;
    }

    const cacheKey = accountId;

    // Check cache first with timestamp-based expiration
    const cached = strategyDataCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < globalConfig.airtable.cacheDuration) {
      console.log('🚀 Using cached strategy data for:', accountId);
      setMemberData(cached.data);
      setLoading(false);
      return;
    }

    // Check if there's already an ongoing request for this account
    if (cacheKey in ongoingRequests) {
      console.log('⏳ Strategy request already in progress for account:', accountId);
      ongoingRequests[cacheKey].then(() => {
        // Re-check cache after the ongoing request completes
        const updatedCache = strategyDataCache[cacheKey];
        if (updatedCache && isMountedRef.current) {
          setMemberData(updatedCache.data);
          setLoading(false);
        }
      }).catch(() => {
        // Handle errors from ongoing request
        if (isMountedRef.current) {
          setLoading(false);
        }
      });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching strategy data for:', accountId);
        const data = await fetchStrategyMember(accountId);
        
        if (isMountedRef.current) {
          setMemberData(data);
          
          // Cache the data with timestamp if successful
          if (data) {
            strategyDataCache[cacheKey] = {
              data,
              timestamp: Date.now()
            };
            console.log('✅ Strategy data cached for:', accountId);
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching strategy member data:', err);
        if (isMountedRef.current) {
          setMemberData(null);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        // Remove from ongoing requests
        delete ongoingRequests[cacheKey];
      }
    };

    // Store the promise to prevent duplicate requests
    ongoingRequests[cacheKey] = fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [accountId, refreshTrigger]);

  // Update the ref when component unmounts
  // Listen for global cache clear events
  useEffect(() => {
    const handleGlobalCacheClear = () => {
      // Clear module-level cache
      Object.keys(strategyDataCache).forEach(key => {
        delete strategyDataCache[key];
      });
      Object.keys(ongoingRequests).forEach(key => {
        delete ongoingRequests[key];
      });
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('global-cache-clear', handleGlobalCacheClear);
    
    return () => {
      window.removeEventListener('global-cache-clear', handleGlobalCacheClear);
      isMountedRef.current = false;
    };
  }, []);

  return { data: memberData, loading };
} 