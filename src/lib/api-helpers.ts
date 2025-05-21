import { StrategyMemberData } from './supabase/getStrategyMemberData';

/**
 * Client-side function to fetch strategy member data from the API route
 */
export async function fetchStrategyMember(accountId?: string): Promise<StrategyMemberData | null> {
  if (!accountId) return null;
  
  try {
    const response = await fetch(`/api/strategy-member?account=${accountId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No strategy member found for account: ${accountId}`);
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