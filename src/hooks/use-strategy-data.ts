import { useEffect, useState } from 'react';
import { StrategyMemberData } from '@/lib/supabase/getStrategyMemberData';
import { fetchStrategyMember } from '@/lib/api-helpers';

// Create a cache object to store data
const dataCache: Record<string, StrategyMemberData> = {};

export function useStrategyData(accountId?: string) {
  const [memberData, setMemberData] = useState<StrategyMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      // Check if data is already in cache - TEMPORARILY DISABLED FOR TESTING
      // if (accountId && dataCache[accountId]) {
      //   setMemberData(dataCache[accountId]);
      //   setLoading(false);
      //   return;
      // }
      
      try {
        setLoading(true);
        const data = await fetchStrategyMember(accountId);
        
        if (data) {
          setMemberData(data);
          
          // Save to cache
          if (accountId) {
            dataCache[accountId] = data;
          }
        } else {
          setMemberData(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching strategy member data:', err);
        setMemberData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [accountId]);

  return { data: memberData, loading };
} 