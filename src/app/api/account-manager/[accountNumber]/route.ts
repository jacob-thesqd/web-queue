import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export interface AccountManagerData {
  account: number;
  account_manager_name: string;
  employee_email: string;
  profile_picture: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountNumber: string }> }
) {
  try {
    const { accountNumber: accountNumberStr } = await params;
    const accountNumber = parseInt(accountNumberStr);
    
    if (isNaN(accountNumber)) {
      return NextResponse.json(
        { error: 'Invalid account number' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .rpc('get_account_manager_profile_pictures', { 
        account_number: accountNumber 
      });

    if (error) {
      console.error('Error fetching account manager data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch account manager data' },
        { status: 500 }
      );
    }

    // Set cache headers for client-side caching
    const response = NextResponse.json({ data: data || [] });
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 minutes cache
    
    return response;
  } catch (err) {
    console.error('Unexpected error in account manager API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 