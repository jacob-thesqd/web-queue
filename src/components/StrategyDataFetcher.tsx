"use client";

import { useEffect, useState, ReactNode } from 'react';
import { StrategyMemberData } from '@/lib/supabase/getStrategyMemberData';
import { fetchStrategyMemberData } from '@/api/supabase';

// Create a cache object to store data
const dataCache: Record<string, StrategyMemberData> = {};

type StrategyDataFetcherProps = {
  accountId?: string;
  children: (data: StrategyMemberData | null, loading: boolean) => ReactNode;
};

export default function StrategyDataFetcher({ 
  accountId, 
  children 
}: StrategyDataFetcherProps) {
  const [memberData, setMemberData] = useState<StrategyMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      // Check if data is already in cache
      if (accountId && dataCache[accountId]) {
        setMemberData(dataCache[accountId]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const data = await fetchStrategyMemberData(accountId);
        
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

  // Make sure to call the function and return its result
  const renderedContent = children(memberData, loading);
  return <>{renderedContent}</>;
} 