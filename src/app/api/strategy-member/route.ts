import { NextRequest, NextResponse } from 'next/server';
import { get_strategy_member_data } from '@/lib/supabase/getStrategyMemberData';

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
    const data = await get_strategy_member_data(parseInt(accountId));

    if (!data) {
      return NextResponse.json({ 
        message: `No strategy member found for account: ${accountId}`,
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Unexpected error fetching strategy member data:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 