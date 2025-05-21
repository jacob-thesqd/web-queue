import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * Handles GET requests to fetch strategy member data
 */
export async function GET(request: NextRequest) {
  // Get account ID from query params
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('account');

  if (!accountId) {
    return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
  }

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
      `)
      .eq('account', accountId);
    
    const { data, error } = await query.single();

    if (error) {
      // If no rows returned error, return a structured response
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          message: `No strategy member found for account: ${accountId}`,
          data: null
        }, { status: 404 });
      }

      console.error('Error fetching strategy member data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        message: 'No data found',
        data: null
      }, { status: 404 });
    }

    // Transform the data to include the joined account details
    const strategyMemberData = {
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

    return NextResponse.json({ data: strategyMemberData });
  } catch (err: any) {
    console.error('Unexpected error fetching strategy member data:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 