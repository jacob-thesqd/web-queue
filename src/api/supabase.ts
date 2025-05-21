import { supabase } from '@/lib/supabase/client';
import { StrategyMemberData } from '@/lib/supabase/getStrategyMemberData';

/**
 * Fetches strategy member data for a specific account
 * This function can be used both client-side and server-side
 */
export async function fetchStrategyMemberData(accountId?: string): Promise<StrategyMemberData | null> {
  try {
    let query = supabase
      .from('strategy_members')
      .select(`
        *,
        accounts:account (
          church_name,
          primary_email,
          address,
          website
        )
      `);
    
    if (accountId) {
      query = query.eq('account', accountId);
    }
    
    const { data, error } = await query.single();

    if (error) {
      // If no rows returned error, just return null without logging
      if (error.code === 'PGRST116') {
        console.log(`No strategy member found for account: ${accountId}`);
        return null;
      }
      console.error('Error fetching strategy member data:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Transform the data to include the joined account details
    return {
      id: data.id,
      account: data.account,
      church_name: data.accounts?.church_name || '',
      primary_email: data.accounts?.primary_email || [],
      address: data.accounts?.address || '',
      website: data.accounts?.website || '',
      brand_guide: data.brand_guide || '',
      discovery_call: data.discovery_call || '',
      status: data.status || '',
      queue_num: data.queue_num || 0,
    };
  } catch (err) {
    console.error('Unexpected error fetching strategy member data:', err);
    return null;
  }
} 