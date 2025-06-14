import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export interface AccountManagerProfileData {
  account: number;
  account_manager_name: string;
  email: string;
  profile_picture: string;
  am_calendly: string;
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

    // Step 1: Get account manager data from Airtable
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const baseId = 'appjHSW7sGtitxoHf';
    const tableId = 'tblAIXogbNPuIRMOo';
    
    if (!AIRTABLE_API_KEY) {
      throw new Error('Airtable API key not configured');
    }

    // Use Airtable REST API to search for records
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const filterFormula = `{Member #} = ${accountNumber}`;
    
    const airtableResponse = await fetch(`${airtableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!airtableResponse.ok) {
      throw new Error(`Airtable API call failed: ${airtableResponse.statusText}`);
    }

    const airtableData = await airtableResponse.json();
    const searchResults = airtableData.records || [];

    // Check if we found any records
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      console.log('⚠️ No Airtable records found for account:', accountNumber);
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Get the first matching record and extract account manager data
    const record = searchResults[0];
    const cssRep = record.fields['CSS Rep (Strategy)'] as string | undefined;
    const cssRepEmail = record.fields['CSS Rep Email (Strategy)'] as string | undefined;
    const calendlyField = record.fields['Calendly Check-In (Strategy)'] as string | null | undefined;
    
    if (!cssRep) {
      console.log('⚠️ CSS Rep not found in Airtable for account:', accountNumber);
      return NextResponse.json(
        { error: 'Account manager not found' },
        { status: 404 }
      );
    }

    if (!cssRepEmail) {
      console.log('⚠️ CSS Rep Email not found in Airtable for account:', accountNumber);
      return NextResponse.json({
        data: {
          account: accountNumber,
          account_manager_name: cssRep,
          email: '',
          profile_picture: '',
          am_calendly: calendlyField || '',
        }
      });
    }

    // Step 2: Query Supabase clickup_users table for profile picture
    const { data: clickupUser, error: supabaseError } = await supabase
      .from('clickup_users')
      .select('profile_picture')
      .eq('email', cssRepEmail)
      .single();

    if (supabaseError) {
      console.log('⚠️ Error querying Supabase for profile picture:', supabaseError.message);
      // Return data without profile picture if Supabase query fails
      return NextResponse.json({
        data: {
          account: accountNumber,
          account_manager_name: cssRep,
          email: cssRepEmail,
          profile_picture: '',
          am_calendly: calendlyField || '',
        }
      });
    }

    // Format calendly URL
    const formatCalendlyUrl = (url: string | null | undefined): string => {
      if (!url) return '';
      
      const cleanUrl = String(url).trim();
      
      if (!cleanUrl || !cleanUrl.includes('calendly')) {
        return '';
      }
      
      if (!cleanUrl.startsWith('http')) {
        if (!cleanUrl.includes('.') && !cleanUrl.includes('/')) {
          return `https://calendly.com/${cleanUrl}`;
        }
        return `https://${cleanUrl}`;
      }
      
      return cleanUrl;
    };
    
    // Set cache headers for client-side caching
    const response = NextResponse.json({ 
      data: {
        account: accountNumber,
        account_manager_name: cssRep,
        email: cssRepEmail,
        profile_picture: clickupUser?.profile_picture || '',
        am_calendly: formatCalendlyUrl(calendlyField),
      }
    });
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 minutes cache
    
    return response;
  } catch (err) {
    console.error('Unexpected error in account manager profile API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 