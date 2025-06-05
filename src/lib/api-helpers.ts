import { StrategyMemberData } from './supabase/getStrategyMemberData';

export async function fetchStrategyMember(accountId?: string): Promise<StrategyMemberData | null> {
  
  if (!accountId) return null;
  
  try {
    const url = `/api/strategy-member?account=${accountId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      
      const errorData = await response.json();
      console.error('Error fetching strategy member data:', errorData);
      return null;
    }
    
    const { data } = await response.json();
    return data as StrategyMemberData;
  } catch (err) {
    console.error('Unexpected error fetching strategy member data:', err);
    return null;
  }
} 