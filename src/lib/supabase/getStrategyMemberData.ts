import { supabase } from './client';
import { cache } from 'react';

export type StrategyMemberData = {
  id: string;
  account: number;
  church_name: string;
  queue_num: number;
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
    };
  } catch (err) {
    console.error('Unexpected error fetching strategy member data:', err);
    return null;
  }
}); 