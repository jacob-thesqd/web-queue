import { supabase } from './client';
import { cache } from 'react';

export type StrategyMemberData = {
  id: string;
  account: number;
  church_name: string;
  queue_num: number;
  address?: string;
  website?: string;
  brand_guide?: string;
  discovery_call?: string;
  status?: string;
  primary_email?: any[];
  wb_products?: string[];
  wb_type?: string;
  url?: string;
};

export const getStrategyMemberData = cache(async (accountId?: string): Promise<StrategyMemberData | null> => {
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
      queue_num: data.queue_num,
      address: data.accounts?.address || '',
      website: data.accounts?.website || '',
      brand_guide: data.brand_guide || '',
      discovery_call: data.discovery_call || '',
      status: data.status || '',
      primary_email: data.accounts?.primary_email || [],
    };
  } catch (err) {
    console.error('Unexpected error fetching strategy member data:', err);
    return null;
  }
});

/**
 * Enhanced function that returns strategy member data with additional web builder fields
 * This function calls a Postgres stored procedure to get enriched data
 */
export const get_strategy_member_data = cache(async (accountId: number): Promise<StrategyMemberData | null> => {
  try {
    // Call the Postgres stored procedure
    const { data, error } = await supabase
      .rpc('get_strategy_member_data', { p_account_id: accountId });

    if (error) {
      console.error('Error calling get_strategy_member_data function:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`No strategy member data found for account: ${accountId}`);
      return null;
    }

    // Return the first result (should be single row)
    const result = data[0];
    
    // Transform to match our TypeScript interface
    return {
      id: result.id?.toString() || '',
      account: result.account || 0,
      church_name: result.church_name || '',
      primary_email: result.primary_email || [],
      address: result.address || '',
      website: result.website || '',
      status: result.status || '',
      brand_guide: result.brand_guide,
      discovery_call: result.discovery_call,
      queue_num: result.queue_num,
      wb_products: result.wb_products || [],
      wb_type: result.wb_type || '',
      url: result.url,
    };
  } catch (err) {
    console.error('Unexpected error calling get_strategy_member_data:', err);
    return null;
  }
}); 