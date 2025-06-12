import { useEffect, useState, useRef } from 'react';
import { StrategyMemberData } from '@/lib/supabase/getStrategyMemberData';
import { globalConfig } from '@/config/globalConfig';
import { useAirtableAccount } from '@/hooks/useAirtableAccount';
import { convertAirtableToStrategyData } from '@/lib/airtable/strategyDataCompatLayer';

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
  
  // Use Airtable data directly
  const airtableData = useAirtableAccount(accountId);
  
  useEffect(() => {
    if (!accountId) {
      console.log('⚠️ No accountId provided to useStrategyData');
      setMemberData(null);
      setLoading(false);
      return;
    }
    
    console.log('🔍 useStrategyData for account:', accountId);

    const cacheKey = accountId;

    // Check cache first with timestamp-based expiration
    const cached = strategyDataCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < globalConfig.airtable.cacheDuration) {
      console.log('🚀 Using cached strategy data for:', accountId);
      setMemberData(cached.data);
      setLoading(false);
      return;
    }
    
    // Set loading state based on Airtable loading state
    setLoading(airtableData.loading);
    
    // Convert Airtable data to StrategyMemberData format when available
    if (!airtableData.loading && airtableData.accountData) {
      const compatData = convertAirtableToStrategyData(airtableData);
      setMemberData(compatData);
      
      // Cache the data with timestamp if successful
      if (compatData) {
        strategyDataCache[cacheKey] = {
          data: compatData,
          timestamp: Date.now()
        };
      }
    } else if (!airtableData.loading) {
      setMemberData(null);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [accountId, airtableData]);

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
      // Cache clear will trigger refresh through refreshCounter dependency
    };

    window.addEventListener('global-cache-clear', handleGlobalCacheClear);
    
    return () => {
      window.removeEventListener('global-cache-clear', handleGlobalCacheClear);
      isMountedRef.current = false;
    };
  }, []);

  return { data: memberData, loading: loading || airtableData.loading };
} 